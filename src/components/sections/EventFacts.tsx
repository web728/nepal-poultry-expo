import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

/** Floating facts card that overlaps the hero: dates, venue, promoters/supporters, organisers. */
export function EventFacts() {
  const { event, organisers, supporters, promoters } = siteConfig;
  const cell = "relative px-6 py-6 sm:px-7 sm:py-7";
  return (
    <section aria-label="Event information" className="relative z-10 -mt-36 pb-12 sm:-mt-32 md:pb-16">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-40px_rgb(14_14_16/0.6)] ring-1 ring-ink-900/5">
          <div aria-hidden className="bg-signature absolute inset-x-0 top-0 h-1" />
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
            <div className={`${cell} border-b border-sand-200 sm:border-r lg:border-b-0`}>
              <dt className="eyebrow flex items-center gap-2 text-ink-500">
                <CalendarDays aria-hidden className="size-4 text-brand-500" strokeWidth={2} /> Dates
              </dt>
              <dd className="mt-2 font-display text-lg font-bold leading-snug text-ink-900">{event.datesLabel}</dd>
              <dd className="mt-0.5 text-sm text-ink-500">Three days · B2B trade show</dd>
            </div>
            <div className={`${cell} border-b border-sand-200 lg:border-b-0 lg:border-r`}>
              <dt className="eyebrow flex items-center gap-2 text-ink-500">
                <MapPin aria-hidden className="size-4 text-brand-500" strokeWidth={2} /> Venue
              </dt>
              <dd className="mt-2 font-display text-lg font-bold leading-snug text-ink-900">{event.venue.name}</dd>
              <dd className="mt-0.5 text-sm text-ink-500">
                {event.venue.city}, {event.venue.country}
              </dd>
            </div>
            <div className={`${cell} border-b border-sand-200 sm:border-b-0 sm:border-r`}>
              <dt className="eyebrow text-ink-500">Promoted &amp; supported by</dt>
              <dd className="mt-3 flex items-center gap-3">
                {[...promoters, ...supporters].map((o) => (
                  <Image key={o.name} src={o.logo.src} alt={o.name} title={o.name} width={o.logo.width} height={o.logo.height} className="h-11 w-auto" sizes="60px" />
                ))}
              </dd>
              <dd className="mt-2 text-sm text-ink-500">
                <Link href="/about/organizers#partners" className="hover:text-brand-600">
                  Government of Nepal (MoALD), NPF &amp; NFIA
                </Link>
              </dd>
            </div>
            <div className={cell}>
              <dt className="eyebrow text-ink-500">Organised by</dt>
              <dd className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {organisers.map((o) => (
                  <Image key={o.name} src={o.logo.src} alt={o.name} width={o.logo.width} height={o.logo.height} className="h-6 w-auto max-w-full xl:h-7" sizes="140px" />
                ))}
              </dd>
              <dd className="mt-2 text-sm text-ink-500">
                <Link href="/about/organizers" className="hover:text-brand-600">
                  Futurex &amp; Media Space
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
