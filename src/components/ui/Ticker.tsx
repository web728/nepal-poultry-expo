import { TICKER } from "@/data/content";

/**
 * Red category band with a slow CSS marquee (pauses on hover, static for reduced motion).
 * The list is rendered twice for a seamless loop; the copy is hidden from assistive tech.
 */
export function Ticker() {
  const items = TICKER.map((t) => (
    <li key={t} className="flex shrink-0 items-center gap-6 pr-6">
      <span className="headline text-lg sm:text-xl">{t}</span>
      <span aria-hidden className="size-1.5 rotate-45 bg-white/70" />
    </li>
  ));
  return (
    <section aria-label="Exhibition categories" className="overflow-hidden bg-brand-500 py-3.5 text-white">
      <div className="group flex w-max">
        <ul className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {items}
          <li aria-hidden className="contents">
            {TICKER.map((t) => (
              <span key={`dup-${t}`} className="flex shrink-0 items-center gap-6 pr-6">
                <span className="headline text-lg sm:text-xl">{t}</span>
                <span className="size-1.5 rotate-45 bg-white/70" />
              </span>
            ))}
          </li>
        </ul>
      </div>
    </section>
  );
}
