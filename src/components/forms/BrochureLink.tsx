"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
const BrochureDialogContent = dynamic(() => import("@/components/forms/BrochureDialogContent"), {
  ssr: false,
  loading: () => <div role="status" className="flex min-h-64 items-center justify-center bg-white p-8"><span className="size-7 animate-spin rounded-full border-2 border-sand-200 border-t-brand-600" /><span className="sr-only">Loading brochure form</span></div>,
});
export function BrochureLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const restoreScroll = useCallback(() => {
    if (previousOverflow.current !== null) {
      document.documentElement.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  }, []);
  const close = useCallback(() => dialogRef.current?.close(), []);
  const handleClose = useCallback(() => { setOpen(false); restoreScroll(); triggerRef.current?.focus(); }, [restoreScroll]);
  useEffect(() => () => restoreScroll(), [restoreScroll]);
  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    if (dialog.open) return;
    try {
      dialog.showModal();
      previousOverflow.current = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      setOpen(true);
    } catch { restoreScroll(); window.location.assign("/brochure"); }
  };
  return <><a ref={triggerRef} href="/brochure" onClick={onClick} className={className} aria-haspopup="dialog">{children}</a>
    <dialog ref={dialogRef} aria-label="Request the expo brochure" onClose={handleClose} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } }} className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-xl border-0 bg-white p-0 text-ink-900 shadow-2xl backdrop:bg-ink-950/65 backdrop:backdrop-blur-[3px]">
      {open && <BrochureDialogContent onClose={close} />}
    </dialog></>;
}
