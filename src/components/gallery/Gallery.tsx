"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import type { GalleryImage } from "@/lib/images";
import { MotionScope } from "@/components/motion/MotionScope";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 16;

/**
 * Gallery fed by the build-time image manifest — no hand-maintained image list.
 * Renders one page of lazy-loaded thumbnails at a time ("Load more"), with an
 * accessible lightbox (arrow keys, Escape, swipe).
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(() => Array.from(new Set(images.map((i) => i.category))), [images]);
  const [category, setCategory] = useState<string>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [index, setIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const touchX = useRef<number | null>(null);

  const filtered = useMemo(() => (category === "all" ? images : images.filter((i) => i.category === category)), [images, category]);
  const shown = filtered.slice(0, visible);
  const current = index !== null ? filtered[index] : null;

  const openAt = (i: number, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setDirection(0);
    setIndex(i);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => dialogRef.current?.close(), []);

  const step = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i === null ? i : (i + delta + filtered.length) % filtered.length));
    },
    [filtered.length],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setIndex(null);
      lastTrigger.current?.focus();
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  const loadMore = () => {
    const firstNew = visible;
    setVisible((v) => v + PAGE_SIZE);
    // Move focus to the first newly revealed photo for keyboard users.
    requestAnimationFrame(() => gridRef.current?.querySelectorAll<HTMLButtonElement>("button")[firstNew]?.focus({ preventScroll: true }));
  };

  return (
    <MotionScope>
    <div>
      {categories.length > 1 && (
        <div role="group" aria-label="Filter photos" className="mb-8 flex flex-wrap gap-2">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setVisible(PAGE_SIZE);
              }}
              className={cn(
                "h-9 border px-4 text-sm font-medium transition-colors",
                category === c ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-700 hover:border-ink-400",
              )}
            >
              {c === "all" ? "All photos" : c}
            </button>
          ))}
        </div>
      )}

      <ul ref={gridRef} className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={(e) => openAt(i, e.currentTarget)}
              className="group relative block aspect-[3/2] w-full overflow-hidden bg-sand-200"
              aria-label={`Open photo: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                placeholder="blur"
                blurDataURL={img.blurDataURL}
                quality={60}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/70 via-transparent to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {img.alt}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-sm text-ink-500" aria-live="polite">
          Showing {shown.length} of {filtered.length} photos
        </p>
        {visible < filtered.length && (
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex h-11 items-center gap-2 border border-ink-900 px-6 text-[0.9375rem] font-semibold text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
          >
            <Plus aria-hidden className="size-4" /> Load more photos
          </button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onKeyDown={onKeyDown}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink-950/95 p-0 text-white backdrop:bg-ink-950/80"
      >
        {current && index !== null && (
          <div
            className="relative flex h-full flex-col"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-sm text-ink-300" aria-live="polite">
                {index + 1} / {filtered.length}
              </p>
              <button type="button" onClick={close} aria-label="Close photo viewer" className="inline-flex size-11 items-center justify-center text-ink-200 hover:text-white">
                <X aria-hidden className="size-6" />
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden" onClick={(e) => e.target === e.currentTarget && close()}>
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <m.div
                  key={current.src}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 mx-auto max-w-6xl px-2 sm:px-16"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={current.src}
                      alt={current.alt}
                      fill
                      sizes="(min-width: 1152px) 1152px, 100vw"
                      placeholder="blur"
                      blurDataURL={current.blurDataURL}
                      className="object-contain"
                      loading="eager"
                    />
                  </div>
                </m.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center bg-ink-950/60 text-white transition-colors hover:bg-ink-950 sm:left-4"
              >
                <ChevronLeft aria-hidden className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center bg-ink-950/60 text-white transition-colors hover:bg-ink-950 sm:right-4"
              >
                <ChevronRight aria-hidden className="size-6" />
              </button>
            </div>

            <p className="mx-auto max-w-3xl px-6 py-4 text-center text-sm text-ink-200">
              {current.alt}
              <span className="text-ink-400"> · {current.category}</span>
            </p>
          </div>
        )}
      </dialog>
    </div>
    </MotionScope>
  );
}
