"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { m } from "framer-motion";
import { MotionScope } from "@/components/motion/MotionScope";
import { AlertCircle, ArrowRight, CheckCircle2, Download, LoaderCircle } from "lucide-react";
import { Recaptcha, type RecaptchaHandle } from "@/components/forms/Recaptcha";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** Hidden honeypot field — real visitors never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Leave this field empty</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-3 border-l-[3px] border-danger-600 bg-danger-600/5 px-4 py-3 text-sm text-danger-600">
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export function SubmitRow({
  label,
  submitting,
  captchaRef,
  onToken,
  onExpired,
  captchaError,
  note,
}: {
  label: string;
  submitting: boolean;
  captchaRef: React.RefObject<RecaptchaHandle | null>;
  onToken: (t: string | null) => void;
  onExpired: () => void;
  captchaError?: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="space-y-5 border-t border-sand-200 pt-6">
      <Recaptcha ref={captchaRef} onToken={onToken} onExpired={onExpired} error={captchaError} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={submitting} aria-disabled={submitting} className="w-full sm:w-auto sm:min-w-52">
          {submitting ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              {label} <ArrowRight aria-hidden className="size-4" />
            </>
          )}
        </Button>
        {note && <p className="text-xs leading-relaxed text-ink-500 sm:max-w-xs sm:text-right">{note}</p>}
      </div>
      <p aria-live="polite" className="sr-only">
        {submitting ? "Sending your submission" : ""}
      </p>
    </div>
  );
}

export function FormSuccess({
  title,
  message,
  submissionId,
  email,
  brochureUrl,
  brochureMissingNote,
  actions,
  onReset,
  resetLabel = "Submit another response",
}: {
  title: string;
  message: React.ReactNode;
  submissionId: string;
  email?: string;
  brochureUrl?: string | null;
  brochureMissingNote?: string;
  actions?: { href: string; label: string }[];
  onReset?: () => void;
  resetLabel?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Move focus to the confirmation so keyboard and screen-reader users land on it.
  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <MotionScope>
    <m.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-28 border border-sand-200 bg-white p-6 outline-none sm:p-9"
      tabIndex={-1}
      ref={panelRef}
    >
      <m.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex size-12 items-center justify-center rounded-full bg-success-600/10 text-success-600"
      >
        <CheckCircle2 aria-hidden className="size-7" />
      </m.div>
      <h2 className="mt-5 text-2xl sm:text-[1.75rem]">{title}</h2>
      <div className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-ink-600">{message}</div>

      {brochureUrl ? (
        <a href={brochureUrl} className={cn(buttonClasses({ size: "lg" }), "mt-6")} download>
          <Download aria-hidden className="size-4" /> Download the brochure
        </a>
      ) : (
        brochureMissingNote && <p className="mt-5 border-l-[3px] border-brand-500 bg-sand-100 px-4 py-3 text-[0.9375rem] text-ink-700">{brochureMissingNote}</p>
      )}

      <dl className="mt-7 grid gap-4 border-t border-sand-200 pt-5 sm:grid-cols-2">
        <div>
          <dt className="eyebrow text-ink-500">Reference</dt>
          <dd className="mt-1 font-mono text-[0.9375rem] font-semibold tracking-wide text-ink-900">{submissionId}</dd>
        </div>
        {email && (
          <div>
            <dt className="eyebrow text-ink-500">Confirmation sent to</dt>
            <dd className="mt-1 break-all text-[0.9375rem] text-ink-900">{email}</dd>
          </div>
        )}
      </dl>

      {(actions?.length || onReset) && (
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {actions?.map((a) => (
            <Link key={a.href} href={a.href} className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-900 hover:text-brand-700">
              {a.label}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
          {onReset && (
            <button type="button" onClick={onReset} className="text-[0.9375rem] font-medium text-ink-600 underline underline-offset-4 hover:text-ink-900">
              {resetLabel}
            </button>
          )}
        </div>
      )}
    </m.div>
    </MotionScope>
  );
}
