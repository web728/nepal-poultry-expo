
import { OPPORTUNITIES } from "@/data/content";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/Reveal";

export function Opportunities() {
  return (
    <Section tone="white" labelledBy="opportunities-title">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            id="opportunities-title"
            title="Explore opportunities across the industry"
          />
        </Reveal>

        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OPPORTUNITIES.map((o, index) => (
            <RevealItem
              key={o.title}
              as="article"
              className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_16px_40px_rgba(31,56,100,0.08)]"
            >
              {/* Decorative background element */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/[0.04] transition-transform duration-500 group-hover:scale-125"
              />

              {/* Accent line */}
              <div className="relative mb-8 h-1 w-10 overflow-hidden rounded-full bg-brand-500">
                <div className="h-full w-0 bg-brand-700 transition-all duration-500 group-hover:w-full" />
              </div>

              {/* Opportunity number */}
              <div className="relative flex flex-1 flex-col">
                <h3 className="text-base font-bold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-600">
                  {o.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-ink-600">
                  {o.body}
                </p>
              </div>

              {/* Bottom accent */}
              <div className="mt-7 h-px w-full bg-ink-100 transition-colors duration-300 group-hover:bg-brand-200" />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
