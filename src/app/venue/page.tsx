
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Navigation,
  ExternalLink,
  Plane,
  Car,
  Building2,
  Ticket,
  Globe2,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import {
  Section,
  SectionHeading,
} from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/CtaBand";

const MAP_QUERY = "Bhrikuti Mandap Exhibition Hall Kathmandu Nepal";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(MAP_QUERY);

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(MAP_QUERY);

const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=" +
  encodeURIComponent(MAP_QUERY) +
  "&t=m&z=15&ie=UTF8&iwloc=&output=embed";

export const metadata = pageMetadata({
  title: "Venue & Travel Information | Nepal Poultry Expo 2027",
  description:
    "Plan your visit to Nepal Poultry & Livestock International Expo 2027, taking place from 18–20 February 2027 at Bhrikuti Mandap Exhibition Hall, Kathmandu, Nepal. Find venue details, Google Maps and travel information.",
  path: "/venue",
});

const EVENT_DETAILS = [
  {
    Icon: CalendarDays,
    label: "Expo dates",
    title: "18–20 February 2027",
    description: "Three days of business and networking",
  },
  {
    Icon: MapPin,
    label: "Exhibition venue",
    title: "Bhrikuti Mandap",
    description: "Pradarshani Marg, Kathmandu, Nepal",
  },
  {
    Icon: Globe2,
    label: "Destination",
    title: "Kathmandu, Nepal",
    description: "Connecting local and international businesses",
  },
];

const TRAVEL_GUIDE = [
  {
    Icon: Plane,
    title: "By air",
    description:
      "International visitors can arrive at Tribhuvan International Airport, Kathmandu, and continue to the exhibition venue by taxi or pre-arranged transport.",
  },
  {
    Icon: Car,
    title: "By road",
    description:
      "The exhibition venue is accessible by local taxis, private vehicles and public transport. Use Google Maps for live directions and traffic information.",
  },
  {
    Icon: Building2,
    title: "Accommodation",
    description:
      "Choose from hotels and business accommodation across Kathmandu. We recommend booking your stay in advance for a convenient expo experience.",
  },
];

export default function VenuePage() {
  return (
    <>
      {/* PAGE HERO */}

      <PageHero
        crumbs={[
          {
            name: "Home",
            path: "/",
          },
          {
            name: "Venue",
            path: "/venue",
          },
        ]}
        eyebrow="Venue & travel"
        title="Your destination for Nepal Poultry & Livestock Expo 2027"
        intro="Join industry professionals, leading suppliers and international exhibitors at Bhrikuti Mandap Exhibition Hall in the heart of Kathmandu, Nepal."
      />

      {/* EVENT DETAILS */}

      <Section
        tone="white"
        spacing="compact"
        labelledBy="venue-details-title"
      >
        <div className="container-site">
          <h2
            id="venue-details-title"
            className="sr-only"
          >
            Event dates and venue details
          </h2>

          <Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {EVENT_DETAILS.map(
                ({ Icon, label, title, description }) => (
                  <article
                    key={label}
                    className="
                      group relative min-w-0
                      overflow-hidden rounded-xl
                      border border-sand-200
                      bg-white p-6
                      transition-colors duration-200
                      hover:border-brand-500/40
                      sm:p-7
                    "
                  >
                    <div
                      className="
                        flex size-12 items-center
                        justify-center rounded-lg
                        bg-brand-500/10
                        text-brand-600
                      "
                    >
                      <Icon
                        aria-hidden
                        className="size-6"
                      />
                    </div>

                    <p
                      className="
                        mt-5 text-xs font-bold uppercase
                        tracking-[0.12em] text-ink-500
                      "
                    >
                      {label}
                    </p>

                    <h3
                      className="
                        mt-2 text-xl font-bold
                        leading-snug text-ink-900
                      "
                    >
                      {title}
                    </h3>

                    <p
                      className="
                        mt-2 text-sm leading-relaxed
                        text-ink-600
                      "
                    >
                      {description}
                    </p>
                  </article>
                )
              )}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ABOUT THE VENUE */}

      <Section
        tone="darker"
        labelledBy="about-venue-title"
        className="overflow-hidden"
      >
        {/* Lightweight decorative background */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0
            grid-lines
            [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]
          "
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(220,38,38,0.12), transparent 60%)",
          }}
        />

        <div className="container-site relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal>
              <SectionHeading
                id="about-venue-title"
                eyebrow="The exhibition venue"
                tone="dark"
                title="Bhrikuti Mandap Exhibition Hall"
                subtitle="Kathmandu, Nepal"
              />

              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-300">
                Located in central Kathmandu, Bhrikuti Mandap
                is an established venue for trade exhibitions,
                business events and industry gatherings.
              </p>

              <p className="mt-4 leading-relaxed text-ink-300">
                From 18–20 February 2027, the venue will bring
                together businesses and professionals from the
                poultry, livestock, dairy, feed, animal health
                and allied industries.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex min-h-12 items-center
                    justify-center gap-2.5 rounded-lg
                    bg-brand-600 px-6 py-3
                    text-sm font-semibold text-white
                    transition-colors duration-200
                    hover:bg-brand-700
                  "
                >
                  <Navigation
                    aria-hidden
                    className="size-4"
                  />
                  Get directions
                  <ArrowRight
                    aria-hidden
                    className="size-4"
                  />
                </a>

                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex min-h-12 items-center
                    justify-center gap-2.5 rounded-lg
                    border border-white/20
                    px-6 py-3 text-sm font-semibold
                    text-white transition-colors
                    duration-200 hover:bg-white/10
                  "
                >
                  View location
                  <ExternalLink
                    aria-hidden
                    className="size-4"
                  />
                </a>
              </div>
            </Reveal>

            {/* Premium date and address panel */}

            <Reveal delay={0.04}>
              <div
                className="
                  relative overflow-hidden rounded-2xl
                  border border-white/10
                  bg-white/5 p-7 sm:p-10
                "
              >
                <p
                  className="
                    text-xs font-bold uppercase
                    tracking-[0.18em] text-ink-300
                  "
                >
                  Save the dates
                </p>

                <div className="mt-5">
                  <span
                    className="
                      text-gradient block font-display
                      text-[clamp(3.5rem,8vw,6rem)]
                      font-extrabold leading-none
                      tracking-tight
                    "
                  >
                    18–20
                  </span>

                  <span
                    className="
                      mt-3 block font-display
                      text-2xl font-bold text-white
                      sm:text-3xl
                    "
                  >
                    February 2027
                  </span>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="flex items-start gap-4">
                  <MapPin
                    aria-hidden
                    className="
                      mt-1 size-6 shrink-0
                      text-brand-500
                    "
                  />

                  <div>
                    <p className="text-xl font-bold text-white">
                      Bhrikuti Mandap
                    </p>

                    <address
                      className="
                        mt-2 text-sm not-italic
                        leading-relaxed text-ink-300
                      "
                    >
                      Exhibition Hall
                      <br />
                      Pradarshani Marg
                      <br />
                      Kathmandu, Nepal
                    </address>
                  </div>
                </div>

                <div
                  className="
                    mt-7 inline-flex items-center gap-2
                    rounded-full border border-white/10
                    bg-white/5 px-4 py-2 text-xs
                    font-medium text-ink-200
                  "
                >
                  <CalendarDays
                    aria-hidden
                    className="size-4 text-brand-500"
                  />

                  Thursday – Saturday
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* GOOGLE MAPS */}

      <Section
        tone="sand"
        labelledBy="location-title"
        id="location"
      >
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                id="location-title"
                eyebrow="Find us"
                title="Locate the exhibition venue"
                intro="Explore the venue location and plan your journey to Nepal Poultry & Livestock International Expo 2027."
              />

              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex min-h-11 w-fit
                  shrink-0 items-center gap-2
                  rounded-lg border border-sand-300
                  bg-white px-5 py-3 text-sm
                  font-semibold text-ink-900
                  transition-colors duration-200
                  hover:border-brand-500
                  hover:text-brand-600
                "
              >
                Open Google Maps
                <ExternalLink
                  aria-hidden
                  className="size-4"
                />
              </a>
            </div>
          </Reveal>

          {/* Map is intentionally not animated */}

          <div
            className="
              mt-8 overflow-hidden rounded-2xl
              border border-sand-200 bg-white
              shadow-sm
            "
          >
            <div
              className="
                flex flex-wrap items-center
                justify-between gap-3
                border-b border-sand-200
                px-5 py-4 sm:px-7
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex size-10 shrink-0 items-center
                    justify-center rounded-lg
                    bg-brand-500/10
                  "
                >
                  <MapPin
                    aria-hidden
                    className="size-5 text-brand-600"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-ink-900">
                    Bhrikuti Mandap Exhibition Hall
                  </p>

                  <p className="mt-0.5 text-xs text-ink-500">
                    Kathmandu, Nepal
                  </p>
                </div>
              </div>

              <span
                className="
                  rounded-full bg-sand-100
                  px-3 py-1.5 text-xs
                  font-medium text-ink-600
                "
              >
                Interactive map
              </span>
            </div>

            <iframe
              src={MAP_EMBED_URL}
              title="Google Maps location of Bhrikuti Mandap Exhibition Hall, Kathmandu"
              width="100%"
              height="480"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="
                block h-[340px] w-full
                border-0 bg-sand-100
                sm:h-[420px] lg:h-[480px]
              "
            />

            <div
              className="
                flex flex-col gap-4
                border-t border-sand-200
                p-5 sm:flex-row
                sm:items-center sm:justify-between
                sm:px-7
              "
            >
              <div>
                <p className="font-semibold text-ink-900">
                  Plan your route
                </p>

                <p className="mt-1 text-sm text-ink-600">
                  Get directions from your current location.
                </p>
              </div>

              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex min-h-11 items-center
                  justify-center gap-2 rounded-lg
                  bg-brand-600 px-5 py-3
                  text-sm font-semibold text-white
                  transition-colors duration-200
                  hover:bg-brand-700
                "
              >
                <Navigation
                  aria-hidden
                  className="size-4"
                />

                Get directions
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* TRAVEL INFORMATION */}

      <Section
        tone="white"
        labelledBy="travel-title"
      >
        <div className="container-site">
          <Reveal>
            <SectionHeading
              id="travel-title"
              eyebrow="Plan your journey"
              title="Getting to the expo"
              intro="Useful travel information for exhibitors, visitors and international industry professionals travelling to Kathmandu."
            />
          </Reveal>

          <Reveal
            delay={0.04}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {TRAVEL_GUIDE.map(
              ({ Icon, title, description }) => (
                <article
                  key={title}
                  className="
                    rounded-xl border border-sand-200
                    bg-white p-6 transition-colors
                    duration-200 hover:border-brand-500/40
                    sm:p-7
                  "
                >
                  <div
                    className="
                      flex size-12 items-center
                      justify-center rounded-lg
                      bg-brand-500/10
                    "
                  >
                    <Icon
                      aria-hidden
                      className="size-6 text-brand-600"
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-ink-900">
                    {title}
                  </h3>

                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">
                    {description}
                  </p>
                </article>
              )
            )}
          </Reveal>

          <div
            className="
              mt-6 flex flex-col gap-4 rounded-xl
              border border-sand-200 bg-sand-50 p-5
              sm:flex-row sm:items-center
              sm:justify-between sm:p-6
            "
          >
            <div>
              <p className="font-bold text-ink-900">
                Need assistance planning your visit?
              </p>

              <p className="mt-1 text-sm text-ink-600">
                Contact our team for venue and participation
                enquiries.
              </p>
            </div>

            <Link
              href="/contact"
              className="
                group inline-flex shrink-0 items-center
                gap-2 text-sm font-semibold
                text-brand-600 hover:text-brand-700
              "
            >
              Contact our team

              <ArrowRight
                aria-hidden
                className="
                  size-4 transition-transform duration-200
                  motion-safe:group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </Section>

      {/* PARTICIPATION */}

      <Section
        tone="sand"
        labelledBy="participation-title"
      >
        <div className="container-site">
          <Reveal>
            <SectionHeading
              id="participation-title"
              eyebrow="Be part of the expo"
              title="Plan your participation"
              intro="Connect with the poultry and livestock industry at Bhrikuti Mandap, Kathmandu, from 18–20 February 2027."
            />
          </Reveal>

          <Reveal
            delay={0.04}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            {/* Exhibitor registration */}

            <article
              className="
                flex flex-col items-start
                rounded-2xl border border-sand-200
                bg-white p-7 sm:p-9
              "
            >
              <Building2
                aria-hidden
                className="size-8 text-brand-600"
              />

              <p className="tag mt-5">
                For exhibitors
              </p>

              <h3 className="mt-3 text-2xl font-bold text-ink-900">
                Showcase your business
              </h3>

              <p className="mt-3 flex-1 leading-relaxed text-ink-600">
                Present your products, technology and services
                to industry professionals and explore new
                business opportunities in Nepal.
              </p>

              <ButtonLink
                href="/register/exhibitor"
                variant="dark"
                className="mt-7"
              >
                Book a stand
              </ButtonLink>
            </article>

            {/* Visitor registration */}

            <article
              className="
                flex flex-col items-start
                rounded-2xl border border-sand-200
                bg-white p-7 sm:p-9
              "
            >
              <Ticket
                aria-hidden
                className="size-8 text-brand-600"
              />

              <p className="tag mt-5">
                For visitors
              </p>

              <h3 className="mt-3 text-2xl font-bold text-ink-900">
                Discover new opportunities
              </h3>

              <p className="mt-3 flex-1 leading-relaxed text-ink-600">
                Meet leading suppliers, discover innovations
                and build valuable connections across the
                poultry and livestock industry.
              </p>

              <ButtonLink
                href="/register/visitor"
                variant="dark"
                className="mt-7"
              >
                Register to visit
              </ButtonLink>
            </article>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
