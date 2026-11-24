import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** Best-effort client IP from proxy headers (Vercel / Nginx / Cloudflare). */
export function getClientIp(headers: Headers): string | undefined {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || headers.get("cf-connecting-ip")?.trim() || undefined;
}

/** Salted hash so raw IP addresses are never stored. */
export function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(`${env.ipHashSalt}:${ip}`).digest("hex").slice(0, 32);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hmac(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Constant-time check of `Authorization: Bearer <CRON_SECRET>`. */
export function isAuthorizedCron(headers: Headers): boolean {
  const secret = env.cronSecret;
  if (!secret) return false;
  const auth = headers.get("authorization") ?? "";
  return safeEqual(auth, `Bearer ${secret}`);
}
