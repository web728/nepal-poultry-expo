/**
 * Brand graphics from the 2027 brochure, drawn as lightweight inline SVG / CSS:
 * the orange→red swoosh that frames the cover, and the orange dot grid in page corners.
 * Purely decorative (aria-hidden).
 */
import { useId } from "react";
import { cn } from "@/lib/cn";

/** Layered orange-to-red swoosh. `flip` mirrors it for top edges. */
export function Swoosh({ className, flip = false }: { className?: string; flip?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block w-full", flip && "-scale-y-100", className)}
    >
      <defs>
        <linearGradient id={`sw-a-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#e32b1b" />
          <stop offset="0.55" stopColor="#ff5e21" />
          <stop offset="1" stopColor="#ffa47e" />
        </linearGradient>
        <linearGradient id={`sw-b-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#e32b1b" />
        </linearGradient>
      </defs>
      <path d="M0 78C260 30 520 22 780 52s470 52 660 6v62H0z" fill="#fff" />
      <path d="M0 70C250 22 520 14 790 46c240 28 450 44 650 4v10c-200 40-410 26-650-2C520 26 250 34 0 82z" fill={`url(#sw-a-${id})`} />
      <path d="M0 92c300-42 560-40 820-10 250 28 450 32 620 0v8c-170 34-370 30-620 2-260-30-520-32-820 10z" fill={`url(#sw-b-${id})`} opacity="0.85" />
    </svg>
  );
}

/** Orange dot grid (the brochure's page-corner motif). */
export function DotGrid({ className }: { className?: string }) {
  return <div aria-hidden className={cn("dot-grid pointer-events-none absolute opacity-80", className)} />;
}
