
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { GROWTH_DRIVERS, MARKET_GAPS } from "@/data/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/Reveal";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { WhyNepal } from "@/components/sections/WhyNepal";
import { Opportunities } from "@/components/sections/Opportunities";
import { Partners } from "@/components/sections/Partners";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "About the Expo 2027 & Why Nepal",
  description:
    "About Nepal Poultry & Livestock International Expo 2027 (18–20 Feb, Bhrikuti Mandap, Kathmandu): the B2B platform for Nepal's poultry, feed, animal health, dairy and livestock sectors.",
  path: "/about",
});

export default function AboutPage() {
  const {
    event,
    organisers,
    promoters,
    supporters,
  } = siteConfig;

  const facts = [
    {
      Icon: CalendarDays,
      label: "Dates",
      value: event.datesLabel,
    },
    {
      Icon: MapPin,
      label: "Venue",
      value: `${event.venue.name}, ${event.venue.city}, ${event.venue.country}`,
    },
    {
      Icon: Building2,
      label: "Organised by",
      value: organisers
        .map((o) => o.name)
        .join(" & "),
    },
    {
      Icon: Building2,
      label: "Promoted by",
      value: `${promoters[0].name} — ${promoters[0].description.replace(/\.$/, "")}`,
    },
    {
      Icon: Building2,
      label: "Supported by",
      value: supporters
        .map((s) => s.name)
        .join(" & "),
    },
  ];

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About the Expo", path: "/about" },
        ]}
        eyebrow="About the expo"
        title="Your gateway to Nepal's poultry & livestock market"
        intro={siteConfig.positioning}
      />

      <AboutIntro showLink={false} />

      <Section
        tone="light"
        spacing="compact"
        labelledBy="edition-title"
      >
        <div className="container-site">
          <h2
            id="edition-title"
            className="headline text-xl text-ink-900 sm:text-2xl"
          >
            The 2027 edition at a glance
          </h2>

          <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-6">
            {facts.map(({ Icon, label, value }, index) => (
              <div
                key={label}
                className={`relative bg-white py-5 pl-14 pr-5 ${
                  index < 3
                    ? "lg:col-span-2"
                    : "lg:col-span-3"
                } ${
                  index === facts.length - 1
                    ? "sm:col-span-2 lg:col-span-3"
                    : ""
                }`}
              >
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">
                  <Icon
                    aria-hidden
                    className="absolute left-5 top-5 size-5 text-brand-500"
                  />

                  {label}
                </dt>

                <dd className="mt-1 font-medium leading-snug text-ink-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <WhyNepal />

      <Opportunities />

      <Section tone="sand" labelledBy="gaps-title">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              id="gaps-title"
              eyebrow="Why it matters"
              title="Growth — and gaps to close"
              intro="Demand for poultry and livestock products keeps rising, while the sector still works on practical gaps. A focused trade show puts suppliers, farmers and regulators in the same hall."
            />

            <ul className="mt-7 space-y-2.5">
              {GROWTH_DRIVERS.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 text-[0.9375rem] text-ink-700"
                >
                  <span
                    aria-hidden
                    className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-brand-500"
                  />

                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <RevealGroup
            as="ul"
            className="divide-y divide-sand-300 self-start border-y border-sand-300"
          >
            {MARKET_GAPS.map((g) => (
              <RevealItem
                as="li"
                key={g}
                className="flex gap-3 py-3.5 text-[0.9375rem] text-ink-700"
              >
                <ArrowRight
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-brand-500"
                />

                {g}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section
        tone="white"
        spacing="compact"
        labelledBy="next-title"
      >
        <div className="container-site grid gap-4 md:grid-cols-2">
          <h2 id="next-title" className="sr-only">
            Plan your participation
          </h2>

          {[
            {
              href: "/exhibitors",
              kicker: "Exhibitors",
              title: "Why exhibit and who should exhibit",
            },
            {
              href: "/visitors",
              kicker: "Visitors",
              title: "Why visit and who you will meet",
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center justify-between gap-6 rounded-xl border border-sand-200 bg-white p-6 transition-colors hover:border-brand-500 sm:p-8"
            >
              <span>
                <span className="tag">{c.kicker}</span>

                <span className="mt-3 block text-xl font-bold text-ink-900">
                  {c.title}
                </span>
              </span>

              <ArrowRight
                aria-hidden
                className="size-6 shrink-0 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500"
              />
            </Link>
          ))}
        </div>
      </Section>

      <Partners />

      <CtaBand />
    </>
  );
}
