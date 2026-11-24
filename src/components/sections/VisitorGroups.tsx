import Image from "next/image";
import { VISITOR_GROUPS } from "@/data/content";
import { photo } from "@/lib/images";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/** "Who will you connect with? — Target trade visitor profile" (brochure p.3). */
export function VisitorGroups({ headingId = "visitor-groups-title", tone = "light" }: { headingId?: string; tone?: "light" | "white" }) {
  const pics = [photo(53), photo(48), photo(51), photo(73)];
  return (
    <Section tone={tone} labelledBy={headingId}>
      <div className="container-site">
        <Reveal>
          <SectionHeading id={headingId} title="Who will you connect with?" accent subtitle="Target trade visitor profile" />
        </Reveal>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <RevealGroup as="dl" className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {VISITOR_GROUPS.map((g) => (
              <RevealItem key={g.title} className="border-l-[3px] border-brand-500 pl-4">
                <dt className="text-sm font-bold uppercase tracking-wide text-brand-600">{g.title}</dt>
                <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink-700">{g.body}</dd>
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="grid grid-cols-2 gap-3 self-start">
            {pics.map((p, i) => (
              <div key={p.src} data-reveal="clip" className={`relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-200 ${i % 2 === 1 ? "translate-y-6" : ""}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 170px, 50vw" placeholder="blur" blurDataURL={p.blurDataURL} className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
