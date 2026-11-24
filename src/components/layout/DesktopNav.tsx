"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/cn";

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupActive(pathname: string, item: NavItem) {
  return isActivePath(pathname, item.href) || (item.children ?? []).some((c) => isActivePath(pathname, c.href));
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // Close any open dropdown after navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const openNow = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  };

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center">
        {items.map((item) => {
          const active = groupActive(pathname, item);
          const linkClass = cn(
            "relative inline-flex h-10 items-center px-3 text-[0.9375rem] font-medium transition-colors",
            active ? "text-ink-950" : "text-ink-600 hover:text-ink-950",
            "after:absolute after:inset-x-3 after:-bottom-[1px] after:h-[2px] after:origin-left after:bg-brand-500 after:transition-transform after:duration-300",
            active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
          );

          if (!item.children) {
            return (
              <li key={item.href}>
                <Link href={item.href} className={linkClass} aria-current={pathname === item.href ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          }

          const isOpen = open === item.label;
          const panelId = `nav-panel-${item.label.toLowerCase()}`;
          return (
            <li
              key={item.href}
              className="relative flex items-center"
              onMouseEnter={() => openNow(item.label)}
              onMouseLeave={closeSoon}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && isOpen) {
                  setOpen(null);
                  (e.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
                }
              }}
            >
              <Link href={item.href} className={cn(linkClass, "pr-1")} aria-current={pathname === item.href ? "page" : undefined}>
                {item.label}
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-7 items-center justify-center text-ink-500 hover:text-ink-950"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`${item.label} menu`}
                onClick={() => (isOpen ? setOpen(null) : openNow(item.label))}
              >
                <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
              <div
                id={panelId}
                className={cn(
                  "absolute left-0 top-full z-50 pt-3 transition-[opacity,transform,visibility] duration-200 ease-out",
                  isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                )}
              >
                <ul className="w-72 border border-sand-200 border-t-2 border-t-brand-500 bg-white py-2 shadow-[0_18px_40px_-18px_rgba(13,26,43,0.35)]">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={childActive ? "page" : undefined}
                          className={cn(
                            "block px-5 py-2.5 transition-colors hover:bg-sand-100",
                            childActive && "bg-sand-100",
                          )}
                        >
                          <span className="block text-[0.9375rem] font-medium text-ink-900">{child.label}</span>
                          {child.description && <span className="block text-sm text-ink-500">{child.description}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
