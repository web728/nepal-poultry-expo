import { ExternalLink } from "lucide-react";
import { INDUSTRY_FACTS, INDUSTRY_SOURCES, WHY_NEPAL } from "@/data/content";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * "Why Nepal?" on charcoal with large gradient figures.
 * National industry figures — not expo statistics — each tied to its source.
 */
export function WhyNepal() {
  return (
    <Section tone="darker" labelledBy="why-nepal-title" className="overflow-hidden">
      <div aria-hidden className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div aria-hidden className="absolute -right-48 -top-48 size-[36rem] rounded-full bg-brand-500/15 blur-[120px]" />
      <div className="container-site relative">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <SectionHeading id="why-nepal-title" eyebrow="The market" tone="dark" title={WHY_NEPAL.heading} subtitle={WHY_NEPAL.subheading} />
          <p className="text-[1.0625rem] leading-relaxed text-ink-300">{WHY_NEPAL.body}</p>
        </Reveal>

        <RevealGroup as="dl" className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 lg:grid-cols-4">
          {INDUSTRY_FACTS.map((f) => {
            const npr = f.value.startsWith("NPR ");
            return (
              <RevealItem key={f.label} className="flex flex-col-reverse justify-end bg-ink-950 px-4 py-8 sm:px-8 sm:py-10">
                <dt className="mt-3 text-sm font-medium leading-snug text-ink-300 sm:text-[0.9375rem]">
                  {f.label}
               
                </dt>
                <dd className="whitespace-nowrap font-display text-[1.75rem] font-extrabold leading-none tracking-tight sm:text-[2.6rem] xl:text-[3.1rem]">
                  {npr && <span className="mr-1.5 align-top text-[0.42em] font-bold tracking-wide text-ink-200">NPR</span>}
                  <span className="text-gradient">{npr ? f.value.slice(4) : f.value}</span>
                </dd>
              </RevealItem>
            );
          })}
        </RevealGroup>
       
      </div>
    </Section>
  );
}
