import { after, type NextRequest } from "next/server";
import { submissionEnvelope, issuesToFieldErrors } from "@/lib/validation/schemas";
import { verifyRecaptcha } from "@/lib/recaptcha/verify";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, hashIp } from "@/lib/security/request";
import { createSubmission } from "@/lib/submissions/create";
import { processOutbox } from "@/lib/queue/outbox";
import { brochureLink } from "@/lib/brochure/brochure";
import { DatabaseNotConfiguredError } from "@/lib/mongodb/client";
import { safeErrorMessage } from "@/lib/errors";
import type { SubmitResponse } from "@/types/submission";

export const maxDuration = 30;

const MAX_BODY_BYTES = 32 * 1024;
const MIN_FILL_MS = 1500;
const RATE_LIMIT = { limit: 8, windowSeconds: 10 * 60 };

function json(body: SubmitResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

/**
 * Single endpoint for all four public forms.
 * validate → spam checks → (rate limit ∥ reCAPTCHA) → MongoDB (submission + outbox jobs)
 * → respond → process this submission's jobs after the response.
 */
export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return json({ ok: false, code: "validation", error: "The submission is too large." }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "validation", error: "Invalid request." }, 400);
  }

  const parsed = submissionEnvelope.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = issuesToFieldErrors(
      parsed.error.issues.filter((i) => i.path[0] === "data"),
      "data",
    );
    const captchaIssue = parsed.error.issues.find((i) => i.path[0] === "recaptchaToken");
    if (!Object.keys(fieldErrors).length && captchaIssue) {
      return json({ ok: false, code: "captcha", error: captchaIssue.message }, 400);
    }
    return json(
      { ok: false, code: "validation", error: "Please correct the highlighted fields.", fieldErrors },
      400,
    );
  }
  const envelope = parsed.data;

  // Spam: honeypot must be empty and a human needs more than a moment to fill a form.
  if (envelope.website || (envelope.elapsedMs !== undefined && envelope.elapsedMs < MIN_FILL_MS)) {
    return json({ ok: false, code: "spam", error: "We could not accept this submission. Please try again." }, 400);
  }

  const ip = getClientIp(request.headers);
  const ipHash = hashIp(ip);

  try {
    const [limit, captcha] = await Promise.all([
      rateLimit(`submit:${ipHash ?? "unknown"}`, RATE_LIMIT),
      verifyRecaptcha(envelope.recaptchaToken, ip),
    ]);

    if (!limit.allowed) {
      return json(
        { ok: false, code: "rate_limited", error: "Too many submissions from your network. Please wait a few minutes and try again." },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    if (!captcha.ok) {
      const messages = {
        expired: "The “I’m not a robot” check expired. Please tick it again.",
        invalid: "The “I’m not a robot” check failed. Please tick it again.",
        unreachable: "We could not verify the “I’m not a robot” check. Please try again.",
        not_configured: "The form is temporarily unavailable. Please try again later.",
      } as const;
      if (captcha.reason === "not_configured") console.error("[submissions] RECAPTCHA_SECRET_KEY is not configured");
      return json(
        { ok: false, code: captcha.reason === "not_configured" ? "unavailable" : "captcha", error: messages[captcha.reason] },
        captcha.reason === "not_configured" ? 503 : 400,
      );
    }

    const { submissionId, duplicate } = await createSubmission(envelope, {
      ipHash,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
      recaptchaHostname: captcha.hostname,
    });

    // Deliver this submission's jobs straight after the response. If the process dies
    // first, the cron / worker sweep picks the jobs up — they are already in MongoDB.
    if (!duplicate) {
      after(async () => {
        try {
          await processOutbox({ submissionId, limit: 8 });
        } catch (err) {
          console.error(`[outbox] immediate processing for ${submissionId} failed: ${safeErrorMessage(err)}`);
        }
      });
    }

    const brochureUrl = envelope.formType === "brochure" ? await brochureLink(submissionId) : undefined;

    return json({ ok: true, submissionId, formType: envelope.formType, duplicate, brochureUrl }, duplicate ? 200 : 201);
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      console.error("[submissions] MONGODB_URI is not configured");
      return json({ ok: false, code: "unavailable", error: "The form is temporarily unavailable. Please try again later." }, 503);
    }
    console.error(`[submissions] failed: ${safeErrorMessage(err)}`);
    return json({ ok: false, code: "server_error", error: "Something went wrong on our side. Please try again in a moment." }, 500);
  }
}
