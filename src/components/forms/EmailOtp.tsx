
"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { emailField } from "@/lib/validation/schemas";
import { TextInput } from "@/components/forms/fields";

type EmailOtpProps = {
  email: string;
  verified: boolean;
  onVerified: (token: string) => void;
  disabled: boolean;
};

export function EmailOtp({
  email,
  verified,
  onVerified,
  disabled,
}: EmailOtpProps) {
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [until, setUntil] = useState(0);

  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    alive.current = true;

    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!until) return;

    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((until - Date.now()) / 1000)
      );

      setRemaining(seconds);
    };

    tick();

    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [until]);

  useEffect(() => {
    if (challenge && !verified) {
      codeRef.current?.focus();
    }
  }, [challenge, verified]);

  const validEmail = emailField.safeParse(email);

  async function request(action: "send" | "verify") {
    if (
      !validEmail.success ||
      disabled ||
      controller.current ||
      verified
    ) {
      return;
    }

    if (
      action === "send" &&
      (remaining > 0 || until > Date.now())
    ) {
      return;
    }

    if (
      action === "verify" &&
      (!challenge || !/^\d{6}$/.test(code))
    ) {
      return;
    }

    const abort = new AbortController();

    controller.current = abort;

    setBusy(action);
    setError("");

    const timer = setTimeout(() => abort.abort(), 30_000);

    try {
      const response = await fetch(`/api/otp/${action}`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        cache: "no-store",
        signal: abort.signal,

        body: JSON.stringify(
          action === "send"
            ? {
                email: validEmail.data,
              }
            : {
                email: validEmail.data,
                challenge,
                code,
              }
        ),
      });

      const result = await response.json().catch(() => null);

      if (!alive.current) return;

      if (!response.ok || !result?.ok) {
        setError(
          typeof result?.error === "string"
            ? result.error
            : "Verification failed. Please try again."
        );

        if (
          action === "send" &&
          (response.status === 429 || response.status === 503)
        ) {
          const retryAfter = Number(
            response.headers.get("Retry-After")
          );

          const seconds =
            Number.isFinite(retryAfter) && retryAfter > 0
              ? retryAfter
              : 60;

          setRemaining(seconds);
          setUntil(Date.now() + seconds * 1000);
        }

        return;
      }

      if (action === "send") {
        if (
          typeof result.challenge !== "string" ||
          !result.challenge
        ) {
          throw new Error("Invalid OTP response");
        }

        setChallenge(result.challenge);
        setCode("");
        setRemaining(60);
        setUntil(Date.now() + 60_000);
      } else {
        if (
          typeof result.verificationToken !== "string" ||
          !result.verificationToken
        ) {
          throw new Error("Invalid verification response");
        }

        setCode("");
        setError("");

        onVerified(result.verificationToken);
      }
    } catch {
      if (!alive.current) return;

      setError(
        action === "send"
          ? "We could not confirm that the code was sent. Please try again."
          : "We could not verify the code. Please try again."
      );

      if (action === "send") {
        setRemaining(60);
        setUntil(Date.now() + 60_000);
      }
    } finally {
      clearTimeout(timer);

      controller.current = null;

      if (alive.current) {
        setBusy(null);
      }
    }
  }

  const button =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50";

  /* Email already verified */
  if (verified) {
    return (
      <p
        role="status"
        className="mt-3 flex items-center gap-2 text-sm font-medium text-success-600"
      >
        <CheckCircle2
          className="size-5 shrink-0"
          aria-hidden
        />

        Email verified successfully
      </p>
    );
  }

  /* Invalid email address */
  if (!validEmail.success) {
    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs text-ink-500">
          Enter a valid email to receive a verification code.
        </p>

        <button
          type="button"
          disabled
          className={button}
        >
          Send OTP
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-md border border-sand-200 bg-sand-50 p-3">

      <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
        <Mail
          className="size-4 shrink-0"
          aria-hidden
        />

        Verify your email
      </p>

      {/* OTP input after successful sending */}
      {challenge && (
        <>
          <p className="text-xs leading-relaxed text-ink-600">
            Enter the six-digit verification code sent to your
            email. The code expires in 5 minutes.
          </p>

          <TextInput
            ref={codeRef}
            aria-label="Six-digit verification code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            disabled={!!busy || disabled}
            onChange={(e) => {
              setCode(
                e.target.value.replace(/\D/g, "").slice(0, 6)
              );

              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void request("verify");
              }
            }}
            placeholder="000000"
            className="tracking-[0.25em]"
          />

          <button
            type="button"
            className={button}
            disabled={
              code.length !== 6 ||
              !!busy ||
              disabled
            }
            onClick={() => void request("verify")}
          >
            {busy === "verify" && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden
              />
            )}

            {busy === "verify"
              ? "Verifying…"
              : "Verify email"}
          </button>
        </>
      )}

      {/* Direct send and resend — no CAPTCHA */}
      <button
        type="button"
        className={
          challenge
            ? "inline-flex items-center gap-2 text-sm font-semibold text-brand-700 underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            : button
        }
        disabled={
          !!busy ||
          disabled ||
          remaining > 0
        }
        onClick={() => void request("send")}
      >
        {busy === "send" && (
          <LoaderCircle
            className="size-4 animate-spin"
            aria-hidden
          />
        )}

        {busy === "send"
          ? "Sending…"
          : remaining > 0
            ? `Resend in ${remaining}s`
            : challenge
              ? "Resend code"
              : "Send OTP"}
      </button>

      {error && (
        <p
          role="alert"
          className="text-xs font-medium text-danger-600"
        >
          {error}
        </p>
      )}

    </div>
  );
}
