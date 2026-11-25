import { after, type NextRequest } from "next/server";
import { submissionEnvelope, issuesToFieldErrors } from "@/lib/validation/schemas";
import { verifyRecaptcha } from "@/lib/recaptcha/verify";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, hashIp } from "@/lib/security/request";
import { createSubmission, SubmissionKeyConflict } from "@/lib/submissions/create";
import { processOutbox } from "@/lib/queue/outbox";
import { brochureLink } from "@/lib/brochure/brochure";
import { env } from "@/lib/env";
import { DatabaseNotConfiguredError } from "@/lib/mongodb/client";
import type { SubmitResponse } from "@/types/submission";
import type { FormType } from "@/data/form-options";

export const maxDuration = 30;
const MAX_BODY_BYTES = 32 * 1024;
const MIN_FILL_MS = 1500;
const RATE_LIMIT = { limit: 8, windowSeconds: 10 * 60 };
type PublicResponse = Extract<SubmitResponse, { ok: false }> | {
  ok: true; formType: FormType; duplicate: boolean; brochureUrl?: string | null;
};
function json(body: PublicResponse, status: number, headers?: HeadersInit) {
  const output = new Headers(headers);
  output.set("Cache-Control", "no-store");
  return Response.json(body, { status, headers: output });
}
class BodyTooLarge extends Error {}
async function readJson(request: NextRequest): Promise<unknown> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) throw new BodyTooLarge();
  if (!request.body) throw new Error("Empty body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        throw new BodyTooLarge();
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}
export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await readJson(request); }
  catch (err) {
    return err instanceof BodyTooLarge
      ? json({ ok: false, code: "validation", error: "The submission is too large." }, 413)
      : json({ ok: false, code: "validation", error: "Invalid request." }, 400);
  }
  const parsed = submissionEnvelope.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = issuesToFieldErrors(parsed.error.issues.filter(i => i.path[0] === "data"), "data");
    const captchaIssue = parsed.error.issues.find(i => i.path[0] === "recaptchaToken");
    if (!Object.keys(fieldErrors).length && captchaIssue) return json({ ok: false, code: "captcha", error: captchaIssue.message }, 400);
    return json({ ok: false, code: "validation", error: Object.keys(fieldErrors).length ? "Please correct the highlighted fields." : "Invalid submission. Please reload and try again.", fieldErrors }, 400);
  }
  const envelope = parsed.data;
  if (envelope.website || (envelope.elapsedMs !== undefined && envelope.elapsedMs < MIN_FILL_MS)) {
    return json({ ok: false, code: "spam", error: "We could not accept this submission. Please try again." }, 400);
  }
  let stage = "client-ip";
  try {
    const ip = getClientIp(request.headers);
    stage = "ip-hash";
    if (ip && !env.ipHashSalt) {
      console.error("[submissions] Missing IP_HASH_SALT or CRON_SECRET");
      return json({ ok: false, code: "unavailable", error: "The form is temporarily unavailable. Please try again later." }, 503);
    }
    const ipHash = hashIp(ip);
    stage = "rate-limit / captcha";
    const [limit, captcha] = await Promise.all([
      rateLimit(`submit:${ipHash ?? "unknown"}`, RATE_LIMIT),
      verifyRecaptcha(envelope.recaptchaToken, ip),
    ]);
    if (!limit.allowed) return json({ ok: false, code: "rate_limited", error: "Too many submissions from your network. Please wait a few minutes and try again." }, 429, { "Retry-After": String(limit.retryAfterSeconds) });
    if (!captcha.ok) {
      const messages = {
        expired: "The ‘I’m not a robot’ check expired. Please tick it again.",
        invalid: "The ‘I’m not a robot’ check failed. Please tick it again.",
        unreachable: "We could not verify the ‘I’m not a robot’ check. Please try again.",
        not_configured: "The form is temporarily unavailable. Please try again later.",
      } as const;
      if (captcha.reason === "not_configured") console.error("[submissions] CAPTCHA is not configured");
      return json({ ok: false, code: captcha.reason === "not_configured" ? "unavailable" : "captcha", error: messages[captcha.reason] }, captcha.reason === "not_configured" ? 503 : 400);
    }
    // createSubmission must persist both submission and durable outbox jobs before returning.
    stage = "mongodb-transaction";
    const { submissionId, duplicate } = await createSubmission(envelope, {
      ipHash, userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
      recaptchaHostname: captcha.hostname,
    });
    // The cron/worker remains responsible for recovery. No SMTP or Sheets on the response path.
    try {
      after(async () => {
        try { await processOutbox({ submissionId, limit: 8 }); }
        catch { console.error("[outbox] Immediate delivery attempt failed; scheduled retry required"); }
      });
    } catch { console.error("[outbox] Immediate scheduling unavailable; scheduled retry required"); }
    let brochureUrl: string | null | undefined;
    if (envelope.formType === "brochure") {
      // A brochure failure must not turn a successfully saved submission into an error.
      brochureUrl = await brochureLink(submissionId).catch(() => null);
    }
    return json({ ok: true, formType: envelope.formType, duplicate, brochureUrl }, duplicate ? 200 : 201);
  } catch (err) {
    if (err instanceof SubmissionKeyConflict) return json({ok:false,code:"validation",error:"This request key was already used. Reload the form and try again."},409);
    if (err instanceof DatabaseNotConfiguredError) {
      console.error("[submissions] MongoDB is not configured");
      return json({ ok: false, code: "unavailable", error: "The form is temporarily unavailable. Please try again later." }, 503);
    }
    // Log only structured error metadata, never raw messages, URIs or form data.
    const e = err as { name?: unknown; code?: unknown; codeName?: unknown; cause?: { name?: unknown; code?: unknown } } | null;
    const safe = (v: unknown) => typeof v === "number" ? v : typeof v === "string" && /^[A-Za-z0-9_]{1,80}$/.test(v) ? v : undefined;
    console.error("[submissions] Request processing failed", JSON.stringify({
      stage, name: safe(e?.name), code: safe(e?.code), codeName: safe(e?.codeName),
      causeName: safe(e?.cause?.name), causeCode: safe(e?.cause?.code),
    }));
    return json({ ok: false, code: "server_error", error: "Something went wrong on our side. Please try again in a moment." }, 500);
  }
}
