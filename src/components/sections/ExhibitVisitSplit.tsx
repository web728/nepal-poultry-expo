import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { EXHIBITOR_BENEFITS, VISITOR_BENEFITS } from "@/data/content";
import { img, photo } from "@/lib/images";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/** Two large photo cards — "Why exhibit?" and "Why visit?" — in the style of the big trade-show sites. */
export function ExhibitVisitSplit() {
  const cards = [
    {
      key: "exhibit",
      eyebrow: "For exhibitors",
      title: "Why exhibit?",
      lead: "Present your products, meet industry professionals and explore opportunities across Nepal's poultry and livestock sectors.",
      items: EXHIBITOR_BENEFITS.map((b) => b.title),
      image: img("brand/exhibitor-stand-meeting.jpg"),
      primary: { href: "/register/exhibitor", label: "Book a Stand" },
      secondary: { href: "/exhibitors", label: "Exhibitor information" },
    },
    {
      key: "visit",
      eyebrow: "For visitors",
      title: "Why visit?",
      lead: "See what is new in feed, animal health, hatchery, dairy and farm equipment — and talk to the people behind it.",
      items: VISITOR_BENEFITS.slice(0, 4).map((b) => b.title),
      image: photo(80),
      primary: { href: "/register/visitor", label: "Register to Visit" },
      secondary: { href: "/visitors", label: "Visitor information" },
    },
  ];

  return (
    <Section tone="white" labelledBy="participate-title">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            id="participate-title"
            eyebrow="Take part"
            title={siteConfig.slogan}
            align="center"
            intro="Two ways to be part of the 2027 edition: present your products to the trade, or come and source them."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.key} delay={i * 0.08} className="h-full">
              <article className="group relative isolate flex h-full min-h-[34rem] flex-col justify-end overflow-hidden rounded-3xl bg-ink-950 p-7 text-white sm:p-10">
                <Image
                  src={c.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={c.image.blurDataURL}
                  className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/85 to-ink-950/25" />
                <p className="tag [--tag-color:var(--color-flame-400)]">{c.eyebrow}</p>
                <h3 className="headline mt-4 text-[2rem] sm:text-[2.6rem]">{c.title}</h3>
                <p className="mt-3 max-w-lg text-[1rem] leading-relaxed text-ink-200">{c.lead}</p>
                <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {c.items.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[0.9375rem] font-medium leading-snug">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-flame-400" strokeWidth={3} />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <ButtonLink href={c.primary.href}>
                    {c.primary.label} <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <Link href={c.secondary.href} className="text-[0.9375rem] font-semibold text-white underline-offset-4 hover:text-flame-300 hover:underline">
                    {c.secondary.label}
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
