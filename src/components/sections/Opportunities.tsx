import Image from "next/image";
import { OPPORTUNITIES } from "@/data/content";
import { img } from "@/lib/images";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/** "Explore opportunities across the industry" (brochure p.2). */
export function Opportunities() {
  return (
    <Section tone="white" labelledBy="opportunities-title">
      <div className="container-site">
        <Reveal>
          <SectionHeading id="opportunities-title" title="Explore opportunities across the industry" />
        </Reveal>
        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OPPORTUNITIES.map((o) => {
            const p = img(o.image);
            return (
              <RevealItem key={o.title} as="article" className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand-200">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    blurDataURL={p.blurDataURL}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <h3 className="mt-4 border-l-[3px] border-brand-500 pl-3 text-sm font-bold uppercase tracking-wide text-brand-600">{o.title}</h3>
                <p className="mt-2 pl-[15px] text-[0.9375rem] leading-relaxed text-ink-700">{o.body}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </Section>
  );
}
