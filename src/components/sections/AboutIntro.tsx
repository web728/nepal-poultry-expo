import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ABOUT_COPY } from "@/data/content";
import { img } from "@/lib/images";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { DotGrid } from "@/components/ui/Decor";
import { Reveal } from "@/components/motion/Reveal";

/** "About the expo — Connecting industry. Creating opportunities." (brochure p.2) */
export function AboutIntro({ showLink = true }: { showLink?: boolean }) {
  const farm = img("brand/modern-livestock-and-poultry-farm.jpg");
  const past = siteConfig.pastEditions[0];
  return (
    <Section tone="white" labelledBy="about-title">
      <DotGrid className="right-4 top-8 hidden h-20 w-32 md:block" />
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <Reveal>
          <SectionHeading id="about-title" eyebrow="About the expo" title={ABOUT_COPY.heading} />
          <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-ink-700">
            <p>
              <strong className="font-semibold text-ink-900">{siteConfig.name} {siteConfig.edition}</strong>
              {ABOUT_COPY.lead.replace(`${siteConfig.name} ${siteConfig.edition}`, "")}
            </p>
            <p>{ABOUT_COPY.body}</p>
            <p className="text-[0.9375rem] text-ink-500">
              The previous edition took place at {past.venue} ({past.dates}).
            </p>
          </div>
          {showLink && (
            <ButtonLink href="/about" variant="link" className="mt-7 gap-1.5 text-[0.9375rem]">
              More about the expo <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          )}
        </Reveal>

        <div className="relative">
          <div data-reveal="clip" className="relative aspect-[16/10] overflow-hidden rounded-xl bg-sand-200 shadow-[0_30px_60px_-35px_rgb(0_0_0/0.5)]">
            <Image
              src={farm.src}
              alt="Modern dairy and poultry farm with cattle grazing beside a poultry house"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              placeholder="blur"
              blurDataURL={farm.blurDataURL}
              className="object-cover"
            />
          </div>
          <div aria-hidden className="absolute -bottom-4 -left-4 -z-10 h-2/3 w-2/3 rounded-xl bg-gradient-to-br from-flame-500 to-brand-500 opacity-90" />
        </div>
      </div>
    </Section>
  );
}
