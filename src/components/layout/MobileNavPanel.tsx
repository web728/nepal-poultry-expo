"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/config/site";
import { buttonClasses } from "@/components/ui/Button";
import { isActivePath } from "@/components/layout/DesktopNav";
import { MotionScope } from "@/components/motion/MotionScope";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  items: NavItem[];
  pathname: string;
  onClose: () => void;
  onNavigate: () => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
};

/**
 * The mobile menu panel. Loaded only when the menu is first opened (keeps Framer Motion
 * out of the initial bundle) and portalled to <body>, because the sticky header's
 * backdrop-filter would otherwise contain the fixed-position panel.
 */
export default function MobileNavPanel({ open, items, pathname, onClose, onNavigate, toggleRef }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, trap focus and support Escape while open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a,button")?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"));
      const all = [toggleRef.current, ...focusables].filter(Boolean) as HTMLElement[];
      const idx = all.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && idx <= 0) {
        e.preventDefault();
        all[all.length - 1].focus();
      } else if (!e.shiftKey && idx === all.length - 1) {
        e.preventDefault();
        all[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, toggleRef]);

  return createPortal(
    <MotionScope>
      <AnimatePresence>
        {open && (
          <m.div
            key="mobile-menu"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto border-t border-sand-200 bg-white"
          >
            <nav aria-label="Mobile" className="container-site flex-1 py-4">
              <ul className="divide-y divide-sand-200">
                {items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  if (!item.children) {
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className={cn("flex min-h-13 items-center font-display text-xl font-semibold", active ? "text-brand-700" : "text-ink-900")}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                  const isExpanded = expanded === item.label;
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : item.label)}
                        aria-expanded={isExpanded}
                        className={cn(
                          "flex min-h-13 w-full items-center justify-between font-display text-xl font-semibold",
                          active ? "text-brand-700" : "text-ink-900",
                        )}
                      >
                        {item.label}
                        <ChevronDown aria-hidden className={cn("size-5 transition-transform", isExpanded && "rotate-180")} />
                      </button>
                      <ul className={cn("pb-3 pl-3", !isExpanded && "hidden")}>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onNavigate}
                              aria-current={pathname === child.href ? "page" : undefined}
                              className={cn(
                                "flex min-h-11 items-center border-l-2 pl-4 text-base",
                                pathname === child.href ? "border-brand-500 text-ink-950" : "border-sand-200 text-ink-600",
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="container-site grid gap-3 border-t border-sand-200 bg-sand-50 py-5 sm:grid-cols-2">
              <Link href="/register/exhibitor" onClick={onNavigate} className={buttonClasses({ size: "lg", className: "w-full" })}>
                Book a Stand
              </Link>
              <Link href="/register/visitor" onClick={onNavigate} className={buttonClasses({ variant: "outline", size: "lg", className: "w-full" })}>
                Register to Visit
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </MotionScope>,
    document.body,
  );
}
