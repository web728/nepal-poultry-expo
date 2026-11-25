import "server-only";
import { randomBytes } from "node:crypto";
import { stat } from "node:fs/promises";
import path from "node:path";
import { SITE_URL } from "@/config/site";
import { env } from "@/lib/env";
import { hmac, safeEqual } from "@/lib/security/request";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export function brochureFilePath(): string {
  return path.join(process.cwd(), "private", "brochure", path.basename(env.brochureFileName));
}
export async function brochureAvailable(): Promise<boolean> {
  try {
    if (path.extname(brochureFilePath()).toLowerCase() !== ".pdf") return false;
    const s = await stat(brochureFilePath());
    return s.isFile() && s.size > 0;
  } catch { return false; }
}
// Keep the existing caller signature. The reference is never embedded in the token.
export function createBrochureToken(_submissionId: string, now = Date.now()): string | null {
  const key = env.signingSecret;
  if (!key) return null;
  const exp = Math.floor(now / 1000) + TOKEN_TTL_SECONDS;
  const nonce = randomBytes(24).toString("hex");
  const payload = `v2.${nonce}.${exp}`;
  return `${payload}.${hmac(`brochure:${payload}`, key)}`;
}
export function verifyBrochureToken(token: string, now = Date.now()): { valid: true } | null {
  const key = env.signingSecret;
  if (!key || token.length > 512) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [version, nonce, expRaw, sig] = parts;
  if (version !== "v2" || !/^[a-f0-9]{48}$/.test(nonce) || !/^\d{1,12}$/.test(expRaw)) return null;
  const exp = Number(expRaw);
  const seconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(exp) || exp <= seconds || exp > seconds + TOKEN_TTL_SECONDS) return null;
  if (!safeEqual(sig, hmac(`brochure:${version}.${nonce}.${expRaw}`, key))) return null;
  return { valid: true };
}
export async function brochureLink(submissionId: string, { absolute = false } = {}): Promise<string | null> {
  if (!(await brochureAvailable())) return null;
  const token = createBrochureToken(submissionId);
  if (!token) return null;
  const rel = `/api/brochure/download?token=${encodeURIComponent(token)}`;
  return absolute ? `${SITE_URL.replace(/\/$/, "")}${rel}` : rel;
}
