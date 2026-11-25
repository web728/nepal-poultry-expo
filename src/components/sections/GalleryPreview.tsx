
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

/** Image-free introduction to the past-edition media library. */
export function GalleryPreview() {
  const past = siteConfig.pastEditions[0];

  return (
    <Section tone="white" labelledBy="gallery-title">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-3xl border border-sand-200 bg-sand-50 px-7 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-brand-500/5 blur-3xl"
          />

          <div
            aria-hidden
            className="grid-lines pointer-events-none absolute inset-0 opacity-30"
          />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionHeading
                id="gallery-title"
                eyebrow="Past editions"
                title={`Explore the ${past.year} edition`}
                intro={`${past.dates} at ${past.venue}. Discover more about the event and its industry highlights.`}
              />

              <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-600">
                Explore the event's media collection and get a closer look at
                the poultry and livestock industry gathering.
              </p>
            </div>

            <Link
              href="/media"
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-ink-950 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
            >
              Explore event media
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
