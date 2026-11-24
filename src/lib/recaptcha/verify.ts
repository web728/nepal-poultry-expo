import "server-only";
import { env } from "@/lib/env";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export type RecaptchaResult =
  | { ok: true; hostname?: string }
  | { ok: false; reason: "not_configured" | "invalid" | "expired" | "unreachable"; codes?: string[] };

/**
 * Server-side verification of a reCAPTCHA v2 ("I'm not a robot") token with Google.
 * The secret key never leaves the server. Tokens are single-use and expire after
 * two minutes, so `timeout-or-duplicate` is reported as "expired".
 */
export async function verifyRecaptcha(token: string, remoteIp?: string): Promise<RecaptchaResult> {
  const secret = env.recaptchaSecret;
  if (!secret) return { ok: false, reason: "not_configured" };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let data: { success?: boolean; hostname?: string; "error-codes"?: string[] };
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { ok: false, reason: "unreachable" };
    data = await res.json();
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (data.success) return { ok: true, hostname: data.hostname };
  const codes = data["error-codes"] ?? [];
  if (codes.includes("timeout-or-duplicate")) return { ok: false, reason: "expired", codes };
  return { ok: false, reason: "invalid", codes };
}
