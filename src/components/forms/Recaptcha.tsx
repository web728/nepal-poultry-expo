"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * Google reCAPTCHA v2 checkbox ("I'm not a robot").
 *
 * The Google script is only requested when the widget is about to scroll into view
 * (or `eager` is set), keeping it off the critical path. The token is verified on the
 * server; expiry and errors clear the token so the user is asked to tick again.
 */

type GRecaptcha = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: GRecaptcha & { ready?: (cb: () => void) => void };
    __npeRecaptchaOnload?: () => void;
  }
}

let scriptPromise: Promise<GRecaptcha> | null = null;

function loadRecaptcha(): Promise<GRecaptcha> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  scriptPromise ??= new Promise<GRecaptcha>((resolve, reject) => {
    window.__npeRecaptchaOnload = () => resolve(window.grecaptcha!);
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=__npeRecaptchaOnload&render=explicit&hl=en";
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("reCAPTCHA failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type RecaptchaHandle = { reset: () => void };

type Props = {
  onToken: (token: string | null) => void;
  onExpired?: () => void;
  error?: string;
  eager?: boolean;
};

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export const Recaptcha = forwardRef<RecaptchaHandle, Props>(function Recaptcha({ onToken, onExpired, error, eager }, ref) {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const callbacks = useRef({ onToken, onExpired });
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    callbacks.current = { onToken, onExpired };
  });

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
      callbacks.current.onToken(null);
    },
  }));

  useEffect(() => {
    const el = holder.current;
    if (!el || !SITE_KEY) return;
    let cancelled = false;

    const mount = () => {
      loadRecaptcha()
        .then((g) => {
          if (cancelled || widgetId.current !== null || !holder.current) return;
          widgetId.current = g.render(holder.current, {
            sitekey: SITE_KEY,
            theme: "light",
            callback: (token: string) => callbacks.current.onToken(token),
            "expired-callback": () => {
              callbacks.current.onToken(null);
              callbacks.current.onExpired?.();
            },
            "error-callback": () => {
              callbacks.current.onToken(null);
              setLoadError(true);
            },
          });
          setReady(true);
        })
        .catch(() => !cancelled && setLoadError(true));
    };

    if (eager) {
      mount();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          mount();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [eager]);

  if (!SITE_KEY) {
    return (
      <p className="border border-dashed border-danger-600/40 bg-danger-600/5 px-4 py-3 text-sm text-danger-600">
        Spam protection is not configured (NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing), so this form cannot be submitted yet.
      </p>
    );
  }

  return (
    <div>
      {/* 304×78 is the size of the v2 checkbox — reserved up front to avoid layout shift. */}
      <div className="relative h-[78px] w-[304px] max-w-full origin-left max-[360px]:scale-[0.92]">
        {!ready && !loadError && (
          <div aria-hidden className="absolute inset-0 animate-pulse rounded-[3px] border border-ink-200 bg-sand-100" />
        )}
        <div ref={holder} />
      </div>
      {loadError && (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger-600">
          The “I’m not a robot” check could not load. Check your connection or disable content blockers, then reload the page.
        </p>
      )}
      {error && !loadError && (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
});
