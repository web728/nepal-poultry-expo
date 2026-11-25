import "server-only";
import { z } from "zod";
import { emailField } from "@/lib/validation/schemas";
import { getClientIp, hashIp } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha/verify";
import { withMongoScope, logMongo } from "@/lib/mongodb/client";
import { env } from "@/lib/env";
import { emailKey, issueOtp, verifyOtp, OtpError } from "@/lib/otp/service";

const sendSchema = z.object({ email: emailField, recaptchaToken: z.string().min(20).max(4000) });
const verifySchema = z.object({ email: emailField, challenge: z.string().regex(/^[a-f0-9]{48}$/), code: z.string().regex(/^\d{6}$/) });
const respond = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function readBody(request: Request) {
  if (!request.body || Number(request.headers.get("content-length") ?? 0) > 8192) throw new OtpError("Invalid request.", 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0, text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel().catch(() => {}); throw new OtpError("Request too large.", 413); }
      text += decoder.decode(value, { stream: true });
    }
    try { return JSON.parse(text + decoder.decode()) as unknown; } catch { throw new OtpError("Invalid request."); }
  } finally { reader.releaseLock(); }
}
export async function handleOtp(request: Request, action: "send" | "verify") {
  try {
    const body = await readBody(request);
    const ip = getClientIp(request.headers);
    if (!env.ipHashSalt || !env.otpSecret || env.otpSecret.length < 32) throw new OtpError("Email verification is temporarily unavailable.", 503);
    const ipKey = hashIp(ip) ?? "unknown";
    return await withMongoScope(async () => {
      // Limit all requests by IP, including malformed or invalid CAPTCHA attempts.
      const ipLimit = await rateLimit(`otp:${action}:ip:${ipKey}`, { limit: action === "send" ? 15 : 40, windowSeconds: 3600 });
      if (!ipLimit.allowed) throw new OtpError("Too many verification requests. Please try again later.", 429);
      if (action === "send") {
        const parsed = sendSchema.safeParse(body);
        if (!parsed.success) throw new OtpError("Enter a valid email and complete the security check.");
        const captcha = await verifyRecaptcha(parsed.data.recaptchaToken, ip);
        if (!captcha.ok) throw new OtpError("Security check failed or expired. Please complete it again.", captcha.reason === "not_configured" ? 503 : 400);
        const emailLimit = await rateLimit(`otp:send:email:${emailKey(parsed.data.email)}`, { limit: 5, windowSeconds: 3600 });
        if (!emailLimit.allowed) throw new OtpError("Too many codes requested. Please try again later.", 429);
        return respond({ ok: true, ...await issueOtp(parsed.data.email) });
      }
      const parsed = verifySchema.safeParse(body);
      if (!parsed.success) throw new OtpError("Enter a valid six-digit verification code.");
      return respond({ ok: true, ...await verifyOtp(parsed.data.email, parsed.data.challenge, parsed.data.code) });
    });
  } catch (err) {
    if (err instanceof OtpError) return respond({ ok: false, error: err.message }, err.status);
    logMongo(`otp-${action}`, err);
    return respond({ ok: false, error: "Email verification is temporarily unavailable. Please try again." }, 503);
  }
}
