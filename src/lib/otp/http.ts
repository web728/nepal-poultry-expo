
import "server-only";

import { z } from "zod";
import { emailField } from "@/lib/validation/schemas";
import { getClientIp, hashIp } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import { withMongoScope, logMongo } from "@/lib/mongodb/client";
import { env } from "@/lib/env";

import {
  emailKey,
  issueOtp,
  verifyOtp,
  OtpError,
} from "@/lib/otp/service";

/* OTP send — email only */
const sendSchema = z.object({
  email: emailField,
});

/* OTP verification */
const verifySchema = z.object({
  email: emailField,

  challenge: z
    .string()
    .regex(/^[a-f0-9]{48}$/),

  code: z
    .string()
    .regex(/^\d{6}$/),
});

function respond(
  body: object,
  status = 200,
  extraHeaders?: HeadersInit
) {
  const headers = new Headers(extraHeaders);

  headers.set("Cache-Control", "no-store");

  headers.set(
    "X-OTP-Revision",
    "otp-single-captcha-v2"
  );

  return Response.json(body, {
    status,
    headers,
  });
}

/* Prevent oversized request bodies */
async function readBody(request: Request) {
  if (
    !request.body ||
    Number(request.headers.get("content-length") ?? 0) >
      8192
  ) {
    throw new OtpError("Invalid request.", 400);
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();

  let size = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) break;

      size += value.byteLength;

      if (size > 8192) {
        await reader.cancel().catch(() => {});

        throw new OtpError(
          "Request too large.",
          413
        );
      }

      text += decoder.decode(value, {
        stream: true,
      });
    }

    try {
      return JSON.parse(
        text + decoder.decode()
      ) as unknown;
    } catch {
      throw new OtpError("Invalid request.", 400);
    }
  } finally {
    reader.releaseLock();
  }
}

function limited(
  error: string,
  retryAfterSeconds: number
) {
  return respond(
    {
      ok: false,
      error,
    },
    429,
    {
      "Retry-After": String(
        Math.max(1, retryAfterSeconds)
      ),
    }
  );
}

export async function handleOtp(
  request: Request,
  action: "send" | "verify"
) {
  try {
    const body = await readBody(request);

    /* Prefer Cloudflare's client IP header */
    const ip =
      request.headers.get("cf-connecting-ip")?.trim() ||
      getClientIp(request.headers);

    /* Security configuration */
    if (
      !env.ipHashSalt ||
      !env.otpSecret ||
      env.otpSecret.length < 32
    ) {
      console.error(
        "[otp] Missing server security configuration"
      );

      throw new OtpError(
        "Email verification is temporarily unavailable.",
        503
      );
    }

    const ipKey = hashIp(ip) ?? "unknown";

    return await withMongoScope(async () => {
      /* IP-based abuse protection */
      const ipLimit = await rateLimit(
        `otp:${action}:ip:${ipKey}`,
        {
          limit: action === "send" ? 15 : 40,
          windowSeconds: 3600,
        }
      );

      if (!ipLimit.allowed) {
        return limited(
          "Too many verification requests. Please try again later.",
          ipLimit.retryAfterSeconds
        );
      }

      /* =========================
         SEND OTP
      ========================= */

      if (action === "send") {
        const parsed = sendSchema.safeParse(body);

        if (!parsed.success) {
          throw new OtpError(
            "Enter a valid email address.",
            400
          );
        }

        const email = parsed.data.email;

        /* Email-specific hourly limit */
        const emailLimit = await rateLimit(
          `otp:send:email:${emailKey(email)}`,
          {
            limit: 5,
            windowSeconds: 3600,
          }
        );

        if (!emailLimit.allowed) {
          return limited(
            "Too many codes requested. Please try again later.",
            emailLimit.retryAfterSeconds
          );
        }

        /* Global protection against distributed OTP abuse */
        const globalLimit = await rateLimit(
          "otp:send:global",
          {
            limit: 60,
            windowSeconds: 3600,
          }
        );

        if (!globalLimit.allowed) {
          return limited(
            "Email verification is busy. Please try again later.",
            globalLimit.retryAfterSeconds
          );
        }

        /* Direct OTP sending — no reCAPTCHA */
        const result = await issueOtp(email);

        return respond({
          ok: true,
          ...result,
        });
      }

      /* =========================
         VERIFY OTP
      ========================= */

      const parsed = verifySchema.safeParse(body);

      if (!parsed.success) {
        throw new OtpError(
          "Enter a valid six-digit verification code.",
          400
        );
      }

      const result = await verifyOtp(
        parsed.data.email,
        parsed.data.challenge,
        parsed.data.code
      );

      return respond({
        ok: true,
        ...result,
      });
    });
  } catch (err) {
    if (err instanceof OtpError) {
      return respond(
        {
          ok: false,
          error: err.message,
        },
        err.status
      );
    }

    logMongo(`otp-${action}`, err);

    return respond(
      {
        ok: false,
        error:
          "Email verification is temporarily unavailable. Please try again.",
      },
      503
    );
  }
}
