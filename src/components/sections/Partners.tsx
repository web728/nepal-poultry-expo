import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig, type Organisation } from "@/config/site";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

function LogoTile({
  org,
  tall = false,
}: {
  org: Organisation;
  tall?: boolean;
}) {
  const isMediaSpace = org.shortName === "Media Space";
  const isConcurrent = org.shortName === "Nepal Agritech";

  return (
    <li
      className="
        group flex h-full min-h-[128px]
        min-w-0 items-center justify-center
        overflow-hidden rounded-lg
        border border-sand-200 bg-white
        px-5 py-4
        sm:min-h-[144px] sm:px-6 sm:py-5
        transition-all duration-300 ease-out
        hover:border-brand-500/30
        hover:shadow-sm
      "
    >
      {/* Logo container */}
      <div
        className="
          relative flex h-[96px]
          w-full max-w-[280px]
          items-center justify-center
          sm:h-[104px]
        "
      >
        {org.logo && (
          <div
            className={`
              relative min-w-0
              ${
                tall
                  ? "h-[88px] w-[96px] sm:h-[100px] sm:w-[112px]"
                  : isConcurrent
                    ? "h-[72px] w-full max-w-[240px]"
                    : "h-[64px] w-full max-w-[220px]"
              }
              ${isMediaSpace ? "w-[76%]" : ""}
            `}
          >
            <Image
              src={org.logo.src}
              alt={`${org.name} logo`}
              title={org.name}
              fill
              sizes={
                tall
                  ? "(max-width: 639px) 96px, 112px"
                  : isConcurrent
                    ? "240px"
                    : isMediaSpace
                      ? "286px"
                      : "220px"
              }
              className={`
                object-contain
                origin-center
                transition-transform
                duration-300 ease-out
                ${
                  isMediaSpace
                    ? "scale-[1.30] motion-safe:group-hover:scale-[1.35]"
                    : "motion-safe:group-hover:scale-105"
                }
              `}
            />
          </div>
        )}
      </div>
    </li>
  );
}

function Group({
  label,
  orgs,
  tall = false,
  cols,
}: {
  label: string;
  orgs: readonly Organisation[];
  tall?: boolean;
  cols: string;
}) {
  return (
    <div className="min-w-0">
      <h3
        className="
          flex items-center gap-3
          text-xs font-bold uppercase
          tracking-[0.14em] text-brand-600
        "
      >
        <span
          aria-hidden="true"
          className="h-px w-6 shrink-0 bg-brand-500"
        />

        {label}
      </h3>

      <ul
        className={`
          mt-4 grid auto-rows-fr
          gap-3 sm:gap-4
          ${cols}
        `}
      >
        {orgs.map((org) => (
          <LogoTile
            key={org.name}
            org={org}
            tall={tall}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Promoted by / Supported by /
 * Organised by / Concurrent event.
 *
 * Clean logo-only partner cards.
 */
export function Partners({
  showLink = true,
}: {
  showLink?: boolean;
}) {
  const {
    promoters,
    supporters,
    organisers,
    concurrentEvent,
  } = siteConfig;

  return (
    <Section
      tone="sand"
      labelledBy="partners-title"
      id="partners"
    >
      <div className="container-site">
        <h2
          id="partners-title"
          className="sr-only"
        >
          Promoters, supporters and organisers
        </h2>

        {/* TOP ROW — PROMOTED & SUPPORTED BY */}
        <Reveal
          className="
            grid gap-8
            lg:grid-cols-[1fr_2fr]
          "
        >
          <Group
            label="Promoted by"
            orgs={promoters}
            tall
            cols="grid-cols-1"
          />

          <Group
            label="Supported by"
            orgs={supporters}
            tall
            cols="grid-cols-1 sm:grid-cols-2"
          />
        </Reveal>

        {/* BOTTOM ROW — ORGANISERS & CONCURRENT EVENT */}
        <Reveal
          delay={0.06}
          className="
            mt-8 grid gap-8
            lg:grid-cols-[2fr_1fr]
          "
        >
          <Group
            label="Organised by"
            orgs={organisers}
            cols="grid-cols-1 sm:grid-cols-2"
          />

          <Group
            label="Concurrent event"
            orgs={[concurrentEvent]}
            cols="grid-cols-1"
          />
        </Reveal>

        {/* ABOUT LINK */}
        {showLink && (
          <Link
            href="/about/organizers"
            className="
              group mt-8 inline-flex
              items-center gap-1.5
              text-[0.9375rem]
              font-semibold text-ink-900
              transition-colors duration-200
              hover:text-brand-600
            "
          >
            About the organisers and partners

            <ArrowRight
              aria-hidden="true"
              className="
                size-4 transition-transform
                duration-300
                motion-safe:group-hover:translate-x-0.5
              "
            />
          </Link>
        )}
      </div>
    </Section>
  );
}