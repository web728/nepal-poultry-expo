
"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type GRecaptcha = {
  render: (
    el: HTMLElement,
    opts: Record<string, unknown>
  ) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: GRecaptcha & {
      ready?: (cb: () => void) => void;
    };
    __npeRecaptchaOnload?: () => void;
  }
}

const SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";

let scriptPromise: Promise<GRecaptcha> | null = null;

function loadRecaptcha(): Promise<GRecaptcha> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser unavailable"));
  }

  if (window.grecaptcha?.render) {
    return Promise.resolve(window.grecaptcha);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<GRecaptcha>((resolve, reject) => {
    const script = document.createElement("script");

    const fail = () => {
      clearTimeout(timer);
      scriptPromise = null;
      script.remove();
      delete window.__npeRecaptchaOnload;

      reject(new Error("reCAPTCHA failed to load"));
    };

    const timer = window.setTimeout(fail, 15000);

    window.__npeRecaptchaOnload = () => {
      if (!window.grecaptcha?.render) {
        fail();
        return;
      }

      clearTimeout(timer);
      delete window.__npeRecaptchaOnload;
      resolve(window.grecaptcha);
    };

    script.src =
      "https://www.google.com/recaptcha/api.js?onload=__npeRecaptchaOnload&render=explicit&hl=en";

    script.async = true;
    script.defer = true;
    script.onerror = fail;

    document.head.appendChild(script);
  });

  return scriptPromise;
}

export type RecaptchaHandle = {
  reset: () => void;
};

type Props = {
  onToken: (token: string | null) => void;
  onExpired?: () => void;
  error?: string;
  eager?: boolean;
};

export const Recaptcha = forwardRef<RecaptchaHandle, Props>(
  function Recaptcha(
    { onToken, onExpired, error, eager = true },
    ref
  ) {
    const holder = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);

    const callbacks = useRef({
      onToken,
      onExpired,
    });

    const [loadError, setLoadError] = useState(false);
    const [ready, setReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
      callbacks.current = {
        onToken,
        onExpired,
      };
    }, [onToken, onExpired]);

    useImperativeHandle(ref, () => ({
      reset() {
        try {
          if (widgetId.current !== null) {
            window.grecaptcha?.reset(widgetId.current);
          }
        } finally {
          callbacks.current.onToken(null);
        }
      },
    }), []);

    useEffect(() => {
      const container = holder.current;

      if (!container || !SITE_KEY) return;

      let cancelled = false;

      const widgetContainer = document.createElement("div");

      container.replaceChildren(widgetContainer);

      widgetId.current = null;

      const mount = async () => {
        try {
          const grecaptcha = await loadRecaptcha();

          if (cancelled || widgetId.current !== null) {
            return;
          }

          widgetId.current = grecaptcha.render(
            widgetContainer,
            {
              sitekey: SITE_KEY,
              theme: "light",

              callback: (token: string) => {
                if (cancelled) return;

                setLoadError(false);
                callbacks.current.onToken(token);
              },

              "expired-callback": () => {
                if (cancelled) return;

                callbacks.current.onToken(null);
                callbacks.current.onExpired?.();
              },

              "error-callback": () => {
                if (cancelled) return;

                callbacks.current.onToken(null);
                setLoadError(true);
              },
            }
          );

          setReady(true);
          setLoadError(false);
        } catch {
          if (cancelled) return;

          setReady(false);
          setLoadError(true);
          callbacks.current.onToken(null);
        }
      };

      let observer: IntersectionObserver | undefined;

      if (
        eager ||
        typeof IntersectionObserver === "undefined"
      ) {
        void mount();
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            if (
              entries.some((entry) => entry.isIntersecting)
            ) {
              observer?.disconnect();
              void mount();
            }
          },
          { rootMargin: "400px 0px" }
        );

        observer.observe(container);
      }

      return () => {
        cancelled = true;
        observer?.disconnect();

        if (widgetId.current !== null) {
          try {
            window.grecaptcha?.reset(widgetId.current);
          } catch {
            // Ignore cleanup errors.
          }
        }

        widgetId.current = null;
        widgetContainer.remove();
      };
    }, [eager, retryCount]);

    const retry = () => {
      callbacks.current.onToken(null);
      setReady(false);
      setLoadError(false);
      setRetryCount((count) => count + 1);
    };

    if (!SITE_KEY) {
      return (
        <p
          role="alert"
          className="rounded-md border border-danger-600/40 bg-danger-600/5 p-3 text-sm text-danger-600"
        >
          Spam protection is temporarily unavailable.
          Please try again later.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        <div className="relative h-[78px] w-[304px] max-w-full origin-left max-[360px]:scale-[0.82]">
          {!ready && !loadError && (
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse rounded-md border border-ink-200 bg-sand-100"
            />
          )}

          <div ref={holder} />
        </div>

        {loadError && (
          <div className="space-y-2">
            <p
              role="alert"
              className="text-xs font-medium text-danger-600"
            >
              The security check could not load.
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={retry}
              className="text-sm font-semibold text-brand-700 underline underline-offset-4"
            >
              Retry security check
            </button>
          </div>
        )}

        {error && !loadError && (
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
);
