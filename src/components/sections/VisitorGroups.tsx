
import { VISITOR_GROUPS } from "@/data/content";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/** "Who will you connect with? — Target trade visitor profile" (brochure p.3). */
export function VisitorGroups({
  headingId = "visitor-groups-title",
  tone = "light",
}: {
  headingId?: string;
  tone?: "light" | "white";
}) {
  return (
    <Section tone={tone} labelledBy={headingId}>
      <div className="container-site">
        <Reveal>
          <SectionHeading
            id={headingId}
            title="Who will you connect with?"
            accent
            subtitle="Target trade visitor profile"
          />
        </Reveal>

        <RevealGroup
          as="dl"
          className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {VISITOR_GROUPS.map((g) => (
            <RevealItem
              key={g.title}
              className="h-full border-l-[3px] border-brand-500 pl-5"
            >
              <dt className="text-sm font-bold uppercase tracking-wide text-brand-600">
                {g.title}
              </dt>

              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-700">
                {g.body}
              </dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
