
import { ArrowRight } from "lucide-react";

import { SEGMENTS } from "@/data/content";

import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * "Who should exhibit? — Showcase solutions across the complete poultry & livestock
 * value chain": six sectors presented in a full-width responsive card grid.
 */
export function SegmentsSection({
  showLink = true,
  headingId = "segments-title",
}: {
  showLink?: boolean;
  headingId?: string;
}) {
  return (
    <Section tone="light" labelledBy={headingId}>
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              id={headingId}
              eyebrow="Exhibitor profile"
              title="Who should exhibit?"
              subtitle="Showcase solutions across the complete poultry & livestock value chain"
            />
          </Reveal>

          {showLink && (
            <ButtonLink href="/register/exhibitor" variant="outline">
              Reserve your space <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          )}
        </div>

        <div className="mt-12">
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SEGMENTS.map(({ id, title, body, Icon }) => (
              <RevealItem key={id} as="article" className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_30px_60px_-30px_rgb(14_14_16/0.35)] sm:p-7">
                  <div
                    aria-hidden
                    className="bg-signature absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  />

                  <span className="bg-signature grid size-12 place-items-center rounded-xl text-white shadow-[0_12px_22px_-12px_rgb(227_43_27/0.9)]">
                    <Icon className="size-6" />
                  </span>

                  <h3 className="mt-5 text-lg leading-snug text-ink-900">
                    {title}
                  </h3>

                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">
                    {body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </Section>
  );
}
