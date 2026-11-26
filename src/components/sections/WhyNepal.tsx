
"use client";

import { useEffect, useRef, useState } from "react";
import { INDUSTRY_FACTS, WHY_NEPAL } from "@/data/content";
import { Section, SectionHeading } from "@/components/ui/Section";

export function WhyNepal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      typeof IntersectionObserver === "undefined"
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 100px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Section
      tone="darker"
      labelledBy="why-nepal-title"
      className="overflow-hidden"
    >
      {/* Lightweight background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
      />

      {/* Gradient glow without expensive blur filters */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(220,38,38,0.12), transparent 55%)",
        }}
      />

      <div
        ref={sectionRef}
        className="container-site relative"
        data-visible={visible}
      >
        {/* Section heading */}
        <div className="why-nepal-intro grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <SectionHeading
            id="why-nepal-title"
            eyebrow="The market"
            tone="dark"
            title={WHY_NEPAL.heading}
            subtitle={WHY_NEPAL.subheading}
          />

          <p className="text-[1.0625rem] leading-relaxed text-ink-300">
            {WHY_NEPAL.body}
          </p>
        </div>

        {/* Industry statistics */}
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:mt-14 lg:grid-cols-4">
          {INDUSTRY_FACTS.map((fact, index) => {
            const isNpr = fact.value.startsWith("NPR ");

            return (
              <div
                key={fact.label}
                className="why-nepal-card relative flex min-w-0 flex-col-reverse justify-end bg-ink-950 px-4 py-8 transition-colors duration-200 hover:bg-ink-900 sm:px-8 sm:py-10"
                style={{
                  animationDelay: `${Math.min(index, 4) * 45}ms`,
                }}
              >
                <dt className="mt-3 text-sm font-medium leading-snug text-ink-300 sm:text-[0.9375rem]">
                  {fact.label}
                </dt>

                <dd className="whitespace-nowrap font-display text-[clamp(1.35rem,3.5vw,3.1rem)] font-extrabold leading-none tracking-tight tabular-nums">
                  {isNpr && (
                    <span className="mr-1.5 align-top text-[0.42em] font-bold tracking-wide text-ink-200">
                      NPR
                    </span>
                  )}

                  <span className="text-gradient">
                    {isNpr
                      ? fact.value.slice(4)
                      : fact.value}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <style jsx>{`
        @keyframes whyNepalReveal {
          from {
            opacity: 0.35;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        [data-visible="true"] .why-nepal-intro {
          animation: whyNepalReveal 320ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        [data-visible="true"] .why-nepal-card {
          animation-name: whyNepalReveal;
          animation-duration: 280ms;
          animation-timing-function: cubic-bezier(
            0.22,
            1,
            0.36,
            1
          );
          animation-fill-mode: both;
        }

        @media (prefers-reduced-motion: reduce) {
          .why-nepal-intro,
          .why-nepal-card {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
            transition: none !important;
          }
        }
      `}</style>
    </Section>
  );
}
