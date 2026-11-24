import { ArrowRight, Check, ClipboardList, Download, MessagesSquare, Ruler } from "lucide-react";
import { siteConfig } from "@/config/site";
import { EXHIBITOR_BENEFITS } from "@/data/content";
import { BOOTH_SIZES } from "@/data/form-options";
import { photo } from "@/lib/images";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SegmentsSection } from "@/components/sections/SegmentsSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { BrochureLink } from "@/components/forms/BrochureLink";

export const metadata = pageMetadata({
  title: "Exhibit at the Expo — Why Exhibit & Who Should Exhibit",
  description:
    "Exhibit at Nepal Poultry & Livestock Expo 2027 (18–20 Feb, Kathmandu): poultry & hatchery, feed, animal health, dairy and processing suppliers. Book a stand.",
  path: "/exhibitors",
});

const sizes = BOOTH_SIZES.filter((s) => s.includes("sqm"));

const STEPS = [
  { Icon: ClipboardList, title: "Register your interest", body: "Complete the exhibitor registration with your company details, products and preferred booth size." },
  { Icon: MessagesSquare, title: "Talk to the organisers", body: "The team contacts you with stand availability, space options and participation terms." },
  {
    Icon: Ruler,
    title: "Confirm your stand",
    body: `Choose your space — from ${sizes[0]} up to ${sizes[sizes.length - 1]} — and confirm your booking.`,
  },
];

export default function ExhibitorsPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Exhibitors", path: "/exhibitors" },
        ]}
        eyebrow="Exhibitor information"
        title="Make Nepal your next business destination"
        intro={
          <>
            <strong className="font-semibold text-flame-300">{siteConfig.slogan}</strong> Present your products, meet industry professionals and explore
            opportunities across Nepal&apos;s poultry and livestock sectors — {siteConfig.event.datesLabel}, {siteConfig.event.venue.shortName}, Kathmandu.
          </>
        }
        image={photo(77)}
      >
        <ButtonLink href="/register/exhibitor" size="lg">
          Book a Stand
        </ButtonLink>
        <BrochureLink className={buttonClasses({ variant: "outline-light", size: "lg" })}>
          <Download aria-hidden className="size-4" /> Download brochure
        </BrochureLink>
      </PageHero>

      <Section tone="white" labelledBy="why-exhibit">
        <div className="container-site">
          <Reveal>
            <SectionHeading id="why-exhibit" eyebrow="Why exhibit?" title="What a stand at the expo does for your business" />
          </Reveal>
          <RevealGroup className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {EXHIBITOR_BENEFITS.map((b) => (
              <RevealItem key={b.title} as="article" className="relative pl-14">
                <span aria-hidden className="absolute left-0 top-0 inline-flex size-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <Check className="size-5" strokeWidth={2.5} />
                </span>
                <h3 className="headline border-b border-ink-900/15 pb-2 text-[1.05rem] text-ink-900">{b.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{b.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <SegmentsSection showLink={false} headingId="exhibitor-profile" />

      <Section tone="sand" labelledBy="how-to-book">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              id="how-to-book"
              eyebrow="How to book"
              title="Booking a stand in three steps"
              intro="Registering does not commit you to a booking — it starts the conversation with the organisers."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register/exhibitor">
                Start registration <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href="/contact?interest=exhibiting" variant="outline">
                Ask a question
              </ButtonLink>
            </div>
          </Reveal>
          <RevealGroup as="ol" className="space-y-3">
            {STEPS.map(({ Icon, title, body }, i) => (
              <RevealItem as="li" key={title} className="flex gap-5 rounded-xl bg-white p-6 shadow-[0_14px_30px_-24px_rgb(0_0_0/0.4)] sm:gap-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Step {i + 1}</p>
                  <h3 className="mt-1 text-lg">{title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-600">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
