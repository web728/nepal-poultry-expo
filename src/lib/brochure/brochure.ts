import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { SITE_URL } from "@/config/site";
import { env } from "@/lib/env";
import { hmac, safeEqual } from "@/lib/security/request";

/**
 * The brochure PDF lives outside /public (default: private/brochure/…) so it can only
 * be downloaded through a signed, expiring link issued after a successful request.
 */
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Always inside private/brochure/ — only the file name is configurable (BROCHURE_FILE_NAME). */
export function brochureFilePath(): string {
  return path.join(process.cwd(), "private", "brochure", path.basename(env.brochureFileName));
}

export async function brochureAvailable(): Promise<boolean> {
  try {
    const s = await stat(brochureFilePath());
    return s.isFile() && s.size > 0;
  } catch {
    return false;
  }
}

function secret(): string | undefined {
  return env.signingSecret;
}

export function createBrochureToken(submissionId: string, now = Date.now()): string | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(now / 1000) + TOKEN_TTL_SECONDS;
  const payload = `${submissionId}.${exp}`;
  return `${payload}.${hmac(payload, key)}`;
}

export function verifyBrochureToken(token: string, now = Date.now()): { submissionId: string } | null {
  const key = secret();
  if (!key) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [submissionId, expRaw, sig] = parts;
  if (!/^NPE-[A-Z]{3}-\d{6}-[A-Z0-9]{6}$/.test(submissionId)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < now) return null;
  if (!safeEqual(sig, hmac(`${submissionId}.${expRaw}`, key))) return null;
  return { submissionId };
}

/** Returns the signed download path, or null if no brochure file has been uploaded yet. */
export async function brochureLink(submissionId: string, { absolute = false } = {}): Promise<string | null> {
  if (!(await brochureAvailable())) return null;
  const token = createBrochureToken(submissionId);
  if (!token) return null;
  const rel = `/api/brochure/download?token=${encodeURIComponent(token)}`;
  return absolute ? `${SITE_URL}${rel}` : rel;
}
