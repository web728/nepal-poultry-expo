"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { Recaptcha, type RecaptchaHandle } from "@/components/forms/Recaptcha";
import { emailField } from "@/lib/validation/schemas";
import { TextInput } from "@/components/forms/fields";

export function EmailOtp({ email, verified, onVerified, disabled }: { email: string; verified: boolean; onVerified: (token: string) => void; disabled: boolean }) {
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [until, setUntil] = useState(0);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => {
    if (!until) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 250); return () => clearInterval(timer);
  }, [until]);
  useEffect(() => { if (challenge && !verified) codeRef.current?.focus(); }, [challenge, verified]);
  const validEmail = emailField.safeParse(email);
  async function request(action: "send" | "verify") {
    if (!validEmail.success || disabled || controller.current || verified) return;
    if (action === "send" && (!captcha || remaining > 0)) return;
    if (action === "verify" && (!challenge || !/^\d{6}$/.test(code))) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(action); setError("");
    const timer = setTimeout(() => abort.abort(), 30_000);
    try {
      const response = await fetch(`/api/otp/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: abort.signal,
        body: JSON.stringify(action === "send" ? { email: validEmail.data, recaptchaToken: captcha } : { email: validEmail.data, challenge, code }) });
      const result = await response.json().catch(() => null);
      if (!alive.current) return;
      if (!response.ok || !result?.ok) {
        setError(typeof result?.error === "string" ? result.error : "Verification failed. Please try again.");
        if (action === "send" && (response.status === 429 || response.status === 503)) setUntil(Date.now() + 60_000);
        return;
      }
      if (action === "send") {
        if (typeof result.challenge !== "string") throw new Error("Invalid response");
        setChallenge(result.challenge); setCode(""); setUntil(Date.now() + 60_000); setShowCaptcha(false);
      } else {
        if (typeof result.verificationToken !== "string") throw new Error("Invalid response");
        setCode(""); onVerified(result.verificationToken);
      }
    } catch {
      if (alive.current) { setError("We could not confirm the request. Please try again."); if (action === "send") setUntil(Date.now() + 60_000); }
    } finally {
      clearTimeout(timer); controller.current = null;
      if (alive.current) { setBusy(null); if (action === "send") { setCaptcha(null); captchaRef.current?.reset(); } }
    }
  }
  if (verified) return <p role="status" className="mt-3 flex items-center gap-2 text-sm font-medium text-success-600"><CheckCircle2 className="size-5" aria-hidden /> Email verified successfully</p>;
  if (!validEmail.success) return <p className="mt-2 text-xs text-ink-500">Enter your email to receive a verification code.</p>;
  const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50";
  return <div className="mt-3 space-y-3 rounded-md border border-sand-200 bg-sand-50 p-3">
    <p className="flex items-center gap-2 text-sm font-medium text-ink-900"><Mail className="size-4" aria-hidden /> Verify your email</p>
    {challenge && <>
      <p className="text-xs text-ink-600">Enter the six-digit code sent to your email. It expires in 5 minutes.</p>
      <TextInput ref={codeRef} aria-label="Six-digit verification code" autoComplete="one-time-code" inputMode="numeric" maxLength={6} value={code} disabled={!!busy || disabled} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void request("verify"); } }} placeholder="000000" className="tracking-[0.25em]" />
      <button type="button" className={button} disabled={code.length !== 6 || !!busy || disabled} onClick={() => void request("verify")}>{busy === "verify" && <LoaderCircle className="size-4 animate-spin" aria-hidden />} Verify email</button>
    </>}
    {showCaptcha ? <div className="space-y-2">
      <Recaptcha ref={captchaRef} eager onToken={setCaptcha} onExpired={() => setCaptcha(null)} />
      <button type="button" className={button} disabled={!captcha || !!busy || remaining > 0 || disabled} onClick={() => void request("send")}>{busy === "send" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}{busy === "send" ? "Sending…" : remaining ? `Try again in ${remaining}s` : "Send code"}</button>
    </div> : <button type="button" className={challenge ? "text-sm font-semibold text-brand-700 underline disabled:opacity-50" : button} disabled={!!busy || disabled || remaining > 0} onClick={() => { setShowCaptcha(true); setError(""); }}>{remaining ? `Resend in ${remaining}s` : challenge ? "Resend code" : "Send OTP"}</button>}
    {error && <p role="alert" className="text-xs font-medium text-danger-600">{error}</p>}
  </div>;
}
