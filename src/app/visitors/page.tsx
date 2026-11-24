import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { VISITOR_BENEFITS } from "@/data/content";
import { photo } from "@/lib/images";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { VisitorGroups } from "@/components/sections/VisitorGroups";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Visit the Expo — Why Visit & Who You Will Meet",
  description:
    "Visit Nepal Poultry & Livestock International Expo 2027, 18–20 February at Bhrikuti Mandap, Kathmandu. Who should attend and how to register your visit.",
  path: "/visitors",
});

export default function VisitorsPage() {
  const { event } = siteConfig;
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Visitors", path: "/visitors" },
        ]}
        eyebrow="Visitor information"
        title="Meet the poultry & livestock industry in one place"
        intro={`Compare suppliers, see equipment up close and pick up practical know-how for your farm or business — ${event.datesLabel}, ${event.venue.shortName}, Kathmandu.`}
        image={photo(53)}
      >
        <ButtonLink href="/register/visitor" size="lg">
          Register to Visit
        </ButtonLink>
      </PageHero>

      <Section tone="white" labelledBy="why-visit">
        <div className="container-site">
          <Reveal>
            <SectionHeading id="why-visit" eyebrow="Why visit?" title="What you get from a day at the expo" />
          </Reveal>
          <RevealGroup className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {VISITOR_BENEFITS.map((b) => (
              <RevealItem key={b.title} as="article" className="border-t-[3px] border-brand-500 pt-5">
                <h3 className="text-lg">{b.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{b.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <VisitorGroups headingId="visitor-profile" />

      <Section tone="white" labelledBy="plan-visit">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              id="plan-visit"
              eyebrow="Plan your visit"
              title="Venue and dates"
              intro="Register now and we will send you visitor information and reminders before the show opens."
            />
            <ButtonLink href="/register/visitor" className="mt-8">
              Register to Visit
            </ButtonLink>
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="divide-y divide-sand-200 rounded-xl border border-sand-200 px-6">
              <div className="relative py-5 pl-9">
                <dt className="eyebrow text-ink-500">
                  <CalendarDays aria-hidden className="absolute left-0 top-5 size-5 text-brand-500" />
                  Dates
                </dt>
                <dd className="mt-1 text-xl font-bold">{event.datesLabel}</dd>
              </div>
              <div className="relative py-5 pl-9">
                <dt className="eyebrow text-ink-500">
                  <MapPin aria-hidden className="absolute left-0 top-5 size-5 text-brand-500" />
                  Venue
                </dt>
                <dd className="mt-1 text-xl font-bold">{event.venue.name}</dd>
                <dd className="text-ink-600">
                  {event.venue.city}, {event.venue.country}
                </dd>
                <dd className="mt-2">
                  <a href={event.venue.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                    Open in Google Maps <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>

      <CtaBand title="Register your visit today" body="It takes a minute — we will e-mail you visitor information before the show opens." />
    </>
  );
}
