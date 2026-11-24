import Image from "next/image";
import { ArrowRight, CalendarDays, Download, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { img } from "@/lib/images";
import { ButtonLink } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { BrochureLink } from "@/components/forms/BrochureLink";
import { HeroReveal } from "@/components/sections/HeroReveal";

/**
 * Full-bleed trade-show hero: the brochure's farm photograph under a charcoal gradient,
 * wide ExtraBold headline, dates and venue, and the two primary calls to action.
 * The facts card (EventFacts) overlaps its lower edge.
 */
export function HomeHero() {
  const { event } = siteConfig;
  const farm = img("brand/modern-livestock-and-poultry-farm.jpg");

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink-950 text-white">
      <Image
        src={farm.src}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        quality={60}
        sizes="100vw"
        placeholder="blur"
        blurDataURL={farm.blurDataURL}
        className="-z-30 animate-ken-burns object-cover object-[72%_center] motion-reduce:animate-none"
      />
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/15" />
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-t from-ink-950 via-ink-950/5 to-ink-950/55" />
      <div aria-hidden className="absolute -left-56 top-1/4 -z-10 size-[42rem] rounded-full bg-brand-500/20 blur-[120px]" />
      <div aria-hidden className="grid-lines absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,black,transparent_65%)]" />

      <div className="container-site flex min-h-[min(94svh,900px)] flex-col justify-center pb-48 pt-14 sm:pb-44 lg:pb-52 lg:pt-20">
        <HeroReveal>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Countdown
              startsAt={event.startsAt}
              endsOn={event.endDate ?? event.startDate ?? ""}
              className="inline-flex h-8 items-center rounded-full bg-brand-500 px-3.5 text-[0.8125rem] font-semibold text-white"
            />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-ink-200">International B2B trade show</span>
          </div>
        </HeroReveal>

        <HeroReveal delay={0.06}>
          <h1 id="hero-title" className="headline mt-7 max-w-5xl text-[2.25rem] sm:text-[3.75rem] lg:text-[4.75rem] xl:text-[5.4rem]">
            <span className="block">Nepal Poultry</span>
            <span className="block">&amp; Livestock</span>
            <span className="mt-3 block text-[1.15rem] tracking-[0.04em] text-ink-100 sm:text-[1.85rem] lg:text-[2.35rem]">
              International Expo <span className="text-gradient">{siteConfig.edition}</span>
            </span>
          </h1>
        </HeroReveal>

        <HeroReveal delay={0.12}>
          <p className="mt-7 max-w-2xl font-display text-xl font-semibold leading-snug text-white sm:text-[1.6rem]">
            Your gateway to Nepal&apos;s poultry &amp; livestock market
          </p>
          <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-ink-200">{siteConfig.positioning}</p>
        </HeroReveal>

        <HeroReveal delay={0.18}>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <p className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5">
                <CalendarDays aria-hidden className="size-5 text-flame-400" strokeWidth={1.75} />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ink-300">Dates</span>
                <span className="block font-display text-lg font-bold">{event.datesLabel}</span>
              </span>
            </p>
            <a href={event.venue.mapUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 transition-colors group-hover:border-flame-400">
                <MapPin aria-hidden className="size-5 text-flame-400" strokeWidth={1.75} />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ink-300">Venue</span>
                <span className="block font-display text-lg font-bold group-hover:text-flame-300">
                  {event.venue.shortName}, {event.venue.city}
                </span>
              </span>
            </a>
          </div>
        </HeroReveal>

        <HeroReveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/register/exhibitor" size="lg">
              Book a Stand <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="/register/visitor" variant="outline-light" size="lg">
              Register to Visit
            </ButtonLink>
            <BrochureLink className="group ml-2 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-white underline-offset-4 hover:text-flame-300 hover:underline">
              <Download aria-hidden className="size-4" />
              Download brochure
            </BrochureLink>
          </div>
        </HeroReveal>
      </div>
    </section>
  );
}
