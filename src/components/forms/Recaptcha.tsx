"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type GRecaptcha = { render: (el: HTMLElement, opts: Record<string, unknown>) => number; reset: (id?: number) => void };
declare global { interface Window { grecaptcha?: GRecaptcha & { ready?: (cb: () => void) => void }; __npeRecaptchaOnload?: () => void } }
let scriptPromise: Promise<GRecaptcha> | null = null;
let keyPromise: Promise<string> | null = null;
function loadKey(): Promise<string> {
  if (!keyPromise) {
    keyPromise = (async () => {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 10000);
      try {
        const response = await fetch("/api/recaptcha/config", { cache: "no-store", signal: abort.signal });
        const body = await response.json();
        if (!response.ok || body.ok !== true || typeof body.siteKey !== "string" || !body.siteKey.trim()) throw new Error("site-key-unavailable");
        return body.siteKey.trim();
      } finally { clearTimeout(timer); }
    })().catch(err => { keyPromise = null; throw err; });
  }
  return keyPromise;
}
function loadRecaptcha(): Promise<GRecaptcha> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<GRecaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true; clearTimeout(timer); script.remove();
      delete window.__npeRecaptchaOnload;
      reject(new Error("script-unavailable"));
    };
    const timer = window.setTimeout(fail, 15000);
    window.__npeRecaptchaOnload = () => {
      const g = window.grecaptcha;
      if (!g?.render) return fail();
      if (settled) return;
      settled = true; clearTimeout(timer); script.onerror = null;
      delete window.__npeRecaptchaOnload; resolve(g);
    };
    script.src = "https://www.google.com/recaptcha/api.js?onload=__npeRecaptchaOnload&render=explicit&hl=en";
    script.async = true; script.defer = true; script.onerror = fail;
    document.head.appendChild(script);
  }).catch(err => { scriptPromise = null; throw err; });
  return scriptPromise;
}
export type RecaptchaHandle = { reset: () => void };
type Props = { onToken: (token: string | null) => void; onExpired?: () => void; error?: string; eager?: boolean };
export const Recaptcha = forwardRef<RecaptchaHandle, Props>(function Recaptcha({ onToken, onExpired, error, eager = true }, ref) {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const callbacks = useRef({ onToken, onExpired });
  const [failure, setFailure] = useState("");
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => { callbacks.current = { onToken, onExpired }; }, [onToken, onExpired]);
  useImperativeHandle(ref, () => ({ reset() {
    try { if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current); } catch { /* widget may already be gone */ }
    callbacks.current.onToken(null);
  } }), []);
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    let cancelled = false;
    let started = false;
    const host = document.createElement("div");
    el.replaceChildren(host);
    let observer: IntersectionObserver | undefined;
    const mount = async () => {
      if (started || cancelled) return;
      started = true;
      try {
        const [siteKey, g] = await Promise.all([loadKey(), loadRecaptcha()]);
        if (cancelled) return;
        widgetId.current = g.render(host, { sitekey: siteKey, theme: "light",
          callback: (token: string) => { if (!cancelled) { setFailure(""); callbacks.current.onToken(token); } },
          "expired-callback": () => { if (!cancelled) { callbacks.current.onToken(null); callbacks.current.onExpired?.(); } },
          "error-callback": () => { if (!cancelled) { callbacks.current.onToken(null); setFailure("Security check failed. Please retry."); } },
        });
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        callbacks.current.onToken(null);
        setFailure(err instanceof Error && err.message === "site-key-unavailable" ? "Security configuration unavailable. Please retry or contact support." : "Security check could not load. Please retry.");
      }
    };
    if (eager || typeof IntersectionObserver === "undefined") void mount();
    else { observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer?.disconnect(); void mount(); } }, { rootMargin: "400px 0px" }); observer.observe(el); }
    return () => {
      cancelled = true; observer?.disconnect();
      if (widgetId.current !== null) { try { window.grecaptcha?.reset(widgetId.current); } catch { /* cleanup */ } }
      widgetId.current = null; host.remove();
    };
  }, [eager, retry]);
  return <div className="space-y-2">
    <div className="relative min-h-[78px] w-[304px] max-w-full origin-left max-[360px]:scale-[0.82]">
      {!ready && !failure && <div aria-hidden className="absolute inset-0 animate-pulse rounded-md border border-ink-200 bg-sand-100" />}
      <div ref={holder} />
    </div>
    {failure && <div role="alert" className="space-y-2 text-xs font-medium text-danger-600"><p>{failure}</p><button type="button" className="text-brand-700 underline" onClick={() => { callbacks.current.onToken(null); keyPromise = null; setReady(false); setFailure(""); setRetry(n => n + 1); }}>Retry security check</button></div>}
    {error && !failure && <p role="alert" className="text-xs font-medium text-danger-600">{error}</p>}
  </div>;
});
