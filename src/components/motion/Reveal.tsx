/**
 * Scroll reveals without JavaScript.
 *
 * Elements fade and lift into place as they scroll into view using CSS scroll-driven
 * animations (see `[data-reveal]` in globals.css). Nothing hydrates, so dozens of
 * reveals cost no main-thread time. Browsers without scroll-timeline support, and
 * visitors who prefer reduced motion, simply see the content immediately.
 *
 * Framer Motion is used for the interactive motion (menus, dialogs, lightbox, form states).
 */
import type { CSSProperties } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Small offset (seconds-equivalent) so neighbouring blocks start one after another. */
  delay?: number;
  as?: "div" | "li" | "section" | "figure";
};

export function Reveal({ children, className, delay = 0, as: Component = "div" }: RevealProps) {
  const style = delay ? ({ "--reveal-offset": `${Math.round(delay * 600)}px` } as CSSProperties) : undefined;
  return (
    <Component data-reveal="" className={className} style={style}>
      {children}
    </Component>
  );
}

/** Container whose direct <RevealItem> children reveal in a short stagger. */
export function RevealGroup({
  children,
  className,
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "dl";
}) {
  return (
    <Component data-reveal-group="" className={className}>
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  return (
    <Component data-reveal-item="" className={className}>
      {children}
    </Component>
  );
}
