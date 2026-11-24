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

  return (
    <li
      className="
        group flex h-full min-h-[160px]
        flex-col items-center justify-center
        gap-3 rounded-lg
        border border-sand-200 bg-white
        px-5 py-5 text-center
        transition-all duration-300 ease-out
        hover:border-brand-500/30
        hover:shadow-sm
      "
    >
      {/* Uniform logo container */}
      <div
        className="
          relative flex h-[80px] w-full
          max-w-[240px]
          items-center justify-center
        "
      >
        {org.logo && (
          <div
            className={`
              relative
              ${
                tall
                  ? "h-[74px] w-[84px] sm:h-[80px] sm:w-[90px]"
                  : "h-[64px] w-full max-w-[210px]"
              }
            `}
          >
            <Image
              src={org.logo.src}
              alt={`${org.name} logo`}
              title={org.name}
              fill
              sizes={
                tall
                  ? "(max-width: 639px) 84px, 90px"
                  : "(max-width: 639px) 180px, 210px"
              }
              className={`
                object-contain
                origin-center
                transition-transform
                duration-300 ease-out
                ${
                  isMediaSpace
                    ? "scale-[1.15] motion-safe:group-hover:scale-[1.20]"
                    : "motion-safe:group-hover:scale-105"
                }
              `}
            />
          </div>
        )}
      </div>

      {/* Organisation name */}
      <span
        className="
          flex min-h-[36px] items-center
          justify-center
          text-[0.8125rem]
          font-medium leading-snug
          text-ink-600
        "
      >
        {org.name}
      </span>
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
                group-hover:translate-x-0.5
              "
            />
          </Link>
        )}
      </div>
    </Section>
  );
}