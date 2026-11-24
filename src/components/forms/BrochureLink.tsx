"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

// Dialog contents (form, reCAPTCHA, Framer Motion) load only when someone opens it.
const BrochureDialogContent = dynamic(() => import("@/components/forms/BrochureDialogContent"), {
  ssr: false,
  loading: () => <div className="h-[32rem] animate-pulse bg-sand-100" />,
});

/**
 * Progressive enhancement: a normal link to /brochure (crawlable, works without JS)
 * that opens the brochure request in a modal dialog when JavaScript is available.
 */
export function BrochureLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setOpen(false);
      document.documentElement.style.overflow = "";
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setOpen(true);
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.showModal();
  };

  return (
    <>
      <a href="/brochure" onClick={onClick} className={className}>
        {children}
      </a>
      <dialog
        ref={dialogRef}
        aria-labelledby="brochure-dialog-title"
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain bg-sand-50 p-0 text-ink-900 shadow-2xl backdrop:bg-ink-950/70 backdrop:backdrop-blur-[2px]"
      >
        {open && <BrochureDialogContent onClose={close} />}
      </dialog>
    </>
  );
}
