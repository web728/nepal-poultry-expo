"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/config/site";

// Panel code (and Framer Motion) loads on first interaction with the menu button.
const MobileNavPanel = dynamic(() => import("@/components/layout/MobileNavPanel"), { ssr: false });

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);
  const navigate = useCallback(() => setOpen(false), []);

  // Close after navigation (state adjusted during render, as React recommends).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        onPointerEnter={() => setWanted(true)}
        onFocus={() => setWanted(true)}
        onClick={() => {
          setWanted(true);
          if (open) close();
          else setOpen(true);
        }}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 inline-flex size-11 items-center justify-center text-ink-900"
      >
        {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
      </button>
      {wanted && <MobileNavPanel open={open} items={items} pathname={pathname} onClose={close} onNavigate={navigate} toggleRef={toggleRef} />}
    </div>
  );
}
