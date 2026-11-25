"use client";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Download, LoaderCircle } from "lucide-react";
import { Recaptcha, type RecaptchaHandle } from "@/components/forms/Recaptcha";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
export function Honeypot() {
  const id = useId();
  return <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden"><label htmlFor={id}>Leave this field empty</label><input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" /></div>;
}
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <div role="alert" className="flex gap-3 rounded-md border border-danger-600/20 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"><AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" /><p>{message}</p></div>;
}
export function SubmitRow({ label, submitting, captchaRef, onToken, onExpired, captchaError, note }: {
  label: string; submitting: boolean; captchaRef: React.RefObject<RecaptchaHandle | null>; onToken: (t: string | null) => void; onExpired: () => void; captchaError?: string; note?: React.ReactNode;
}) {
  return <div className="space-y-5 border-t border-sand-200 pt-6" aria-busy={submitting}>
    <Recaptcha ref={captchaRef} onToken={onToken} onExpired={onExpired} error={captchaError} eager />
    <Button type="submit" size="lg" disabled={submitting} className="min-h-12 w-full justify-center gap-3 rounded-md">
      {submitting ? <><LoaderCircle aria-hidden className="size-4 animate-spin" /> Submitting…</> : <>{label} <ArrowRight aria-hidden className="size-4" /></>}
    </Button>
    <p aria-live="polite" className="sr-only">{submitting ? "Submitting your details." : ""}</p>
    {note && <p className="text-center text-xs leading-relaxed text-ink-500">{note}</p>}
  </div>;
}
export function FormSuccess({ title, message, email, brochureUrl, brochureMissingNote, actions, onReset, resetLabel = "Submit another response" }: {
  title: string; message: React.ReactNode; email?: string; brochureUrl?: string | null; brochureMissingNote?: string; actions?: { href: string; label: string }[]; onReset?: () => void; resetLabel?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { panelRef.current?.focus({ preventScroll: true }); panelRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }); }, []);
  return <div ref={panelRef} role="status" tabIndex={-1} className="scroll-mt-28 rounded-xl border border-sand-200 bg-white px-6 py-9 text-center shadow-sm outline-none sm:px-10 sm:py-12">
    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-600/10 text-success-600"><CheckCircle2 aria-hidden className="size-9" /></div>
    <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
    <div className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-600">{message}</div>
    {email && <div className="mx-auto mt-6 max-w-md rounded-md bg-sand-50 p-4"><p className="text-xs font-medium text-ink-500">Registered email address</p><p className="mt-1 break-all text-sm font-semibold text-ink-900">{email}</p></div>}
    {brochureUrl ? <a href={brochureUrl} download className={cn(buttonClasses({ size: "lg" }), "mt-6 w-full justify-center rounded-md sm:w-auto")}><Download aria-hidden className="size-4" /> Download the brochure</a> : brochureMissingNote && <p className="mt-6 rounded-md border border-brand-500/20 bg-sand-50 p-4 text-sm text-ink-700">{brochureMissingNote}</p>}
    {Boolean(actions?.length || onReset) && <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 border-t border-sand-200 pt-6">
      {actions?.map(a => <Link key={a.href} href={a.href} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-brand-700">{a.label}<ArrowRight aria-hidden className="size-4" /></Link>)}
      {onReset && <button type="button" onClick={onReset} className="text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-ink-900">{resetLabel}</button>}
    </div>}
  </div>;
}
