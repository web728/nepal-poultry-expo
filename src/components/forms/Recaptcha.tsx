"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
type GRecaptcha = { render: (el: HTMLElement, opts: Record<string, unknown>) => number; reset: (id?: number) => void };
declare global { interface Window { grecaptcha?: GRecaptcha & { ready?: (cb: () => void) => void }; __npeRecaptchaOnload?: () => void } }
let scriptPromise: Promise<GRecaptcha> | null = null;
function loadRecaptcha(): Promise<GRecaptcha> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  scriptPromise ??= new Promise<GRecaptcha>((resolve, reject) => {
    const s = document.createElement("script");
    const fail = () => { clearTimeout(timer); scriptPromise = null; s.remove(); delete window.__npeRecaptchaOnload; reject(new Error("reCAPTCHA failed to load")); };
    const timer = window.setTimeout(fail, 15000);
    window.__npeRecaptchaOnload = () => { if (!window.grecaptcha?.render) return fail(); clearTimeout(timer); resolve(window.grecaptcha); };
    s.src = "https://www.google.com/recaptcha/api.js?onload=__npeRecaptchaOnload&render=explicit&hl=en";
    s.async = true; s.defer = true; s.onerror = fail;
    document.head.appendChild(s);
  });
  return scriptPromise;
}
export type RecaptchaHandle = { reset: () => void };
type Props = { onToken: (token: string | null) => void; onExpired?: () => void; error?: string; eager?: boolean };
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
export const Recaptcha = forwardRef<RecaptchaHandle, Props>(function Recaptcha({ onToken, onExpired, error, eager }, ref) {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const callbacks = useRef({ onToken, onExpired });
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { callbacks.current = { onToken, onExpired }; });
  useImperativeHandle(ref, () => ({ reset() { if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current); callbacks.current.onToken(null); } }));
  useEffect(() => {
    const el = holder.current;
    if (!el || !SITE_KEY) return;
    let cancelled = false;
    const mount = () => {
      loadRecaptcha().then(g => {
        if (cancelled || widgetId.current !== null || !holder.current) return;
        widgetId.current = g.render(holder.current, {
          sitekey: SITE_KEY, theme: "light",
          callback: (token: string) => { if (!cancelled) callbacks.current.onToken(token); },
          "expired-callback": () => { if (!cancelled) { callbacks.current.onToken(null); callbacks.current.onExpired?.(); } },
          "error-callback": () => { if (!cancelled) { callbacks.current.onToken(null); setLoadError(true); } },
        });
        setReady(true);
      }).catch(() => { if (!cancelled) setLoadError(true); });
    };
    if (eager || typeof IntersectionObserver === "undefined") { mount(); return () => { cancelled = true; }; }
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); mount(); } }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
  }, [eager]);
  if (!SITE_KEY) return <p role="alert" className="rounded-md border border-danger-600/40 bg-danger-600/5 p-3 text-sm text-danger-600">Spam protection is temporarily unavailable. Please try again later.</p>;
  return <div>
    <div className="relative h-[78px] w-[304px] max-w-full origin-left max-[360px]:scale-[0.82]">{!ready && !loadError && <div aria-hidden className="absolute inset-0 animate-pulse rounded-md border border-ink-200 bg-sand-100" />}<div ref={holder} /></div>
    {loadError && <p role="alert" className="mt-2 text-xs font-medium text-danger-600">The “I’m not a robot” check could not load. Check your connection or content blockers, then reload the page.</p>}
    {error && !loadError && <p role="alert" className="mt-2 text-xs font-medium text-danger-600">{error}</p>}
  </div>;
});
