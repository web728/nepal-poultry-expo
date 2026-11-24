"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/**
 * Framer Motion context for interactive components (mobile menu panel, brochure dialog,
 * gallery lightbox, form confirmations). Each of those is loaded on demand, so Framer
 * Motion never weighs on the first page load. Honours the reduced-motion setting.
 */
export function MotionScope({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
