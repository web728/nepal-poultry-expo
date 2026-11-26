
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { siteConfig, type Organisation } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Organisers, Promoters & Supporters",
  description:
    "Organised by Futurex Trade Fair & Events and Media Space Solutions; promoted by Nepal's Ministry of Agriculture and Livestock Development; supported by NPF and NFIA.",
  path: "/about/organizers",
});

/* =========================
   Organiser Profile
========================= */

function OrganiserProfile({ org }: { org: Organisation }) {
  const isMediaSpace = /media\s*space/i.test(org.name);
  const isFuturex = /futurex/i.test(org.name);

  return (
    <article className="grid gap-6 border-t border-sand-200 py-10 first:border-t-0 first:pt-0 md:grid-cols-[18rem_1fr] md:items-center md:gap-12">

      {/* Organiser logo */}
      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-sand-200 bg-white px-5 py-4 sm:px-6">

        {org.logo && (
          <Image
            src={org.logo.src}
            alt={`${org.name} logo`}
            width={org.logo.width}
            height={org.logo.height}
            sizes="(max-width: 767px) 85vw, 260px"
            className={
              isMediaSpace
                ? "h-auto max-h-[108px] w-full max-w-[260px] object-contain"
                : isFuturex
                  ? "h-[52px] w-auto max-w-full object-contain"
                  : "h-14 w-auto max-w-full object-contain"
            }
          />
        )}

      </div>

      {/* Organiser information */}
      <div className="min-w-0">
        <h3 className="text-2xl font-bold text-ink-900">
          {org.name}
        </h3>

        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-700">
          {org.description}
        </p>
      </div>

    </article>
  );
}

/* =========================
   Partner Logo Card
========================= */

type PartnerCardProps = {
  org: Organisation;
  variant?: "promoter" | "supporter" | "concurrent";
};

function PartnerCard({
  org,
  variant = "supporter",
}: PartnerCardProps) {
  const isGovernment =
    /government|ministry|agriculture and livestock/i.test(
      org.name
    );

  const isConcurrent = variant === "concurrent";
  const isSupporter = variant === "supporter";

  return (
    <li className="flex min-w-0 items-center justify-center rounded-xl border border-sand-200 bg-white p-5 sm:p-6">

      {/* Partner logo container */}
      <div
        className={
          isGovernment
            ? "flex min-h-[140px] w-full items-center justify-center bg-white px-2 py-3 sm:min-h-[170px]"
            : isConcurrent
              ? "flex h-[180px] w-full items-center justify-center px-3 py-2 sm:h-[210px]"
              : isSupporter
                ? "flex h-[155px] w-full items-center justify-center px-3 py-2 sm:h-[175px]"
                : "flex h-28 w-full items-center justify-center"
        }
      >
        {org.logo && (
          <Image
            src={org.logo.src}
            alt={`${org.name} logo`}
            width={org.logo.width}
            height={org.logo.height}
            sizes={
              isGovernment
                ? "(max-width: 767px) 85vw, 480px"
                : isConcurrent
                  ? "(max-width: 767px) 80vw, 360px"
                  : isSupporter
                    ? "(max-width: 767px) 70vw, 280px"
                    : "112px"
            }
            className={
              isGovernment
                ? "h-auto max-h-[160px] w-full max-w-[480px] object-contain"
                : isConcurrent
                  ? "h-auto max-h-[160px] w-auto max-w-full object-contain sm:max-h-[190px] sm:max-w-[360px]"
                  : isSupporter
                    ? "h-auto max-h-[130px] w-auto max-w-full object-contain sm:max-h-[150px] sm:max-w-[280px]"
                    : "h-auto max-h-28 w-auto max-w-full object-contain"
            }
          />
        )}
      </div>

    </li>
  );
}

/* =========================
   Organisers Page
========================= */

export default function OrganizersPage() {
  const {
    organisers,
    promoters,
    supporters,
    concurrentEvent,
    contacts,
  } = siteConfig;

  return (
    <>
      <PageHero
        crumbs={[
          {
            name: "Home",
            path: "/",
          },
          {
            name: "About the Expo",
            path: "/about",
          },
          {
            name: "Organisers & Partners",
            path: "/about/organizers",
          },
        ]}
        eyebrow="About the organisers"
        title="Organisers, promoters and supporters"
        intro="Who runs the expo, the government programme that promotes it and the industry associations that support it."
      />

      {/* Organisers */}
      <Section tone="white" labelledBy="organisers-title">
        <div className="container-site">

          <Reveal>
            <SectionHeading
              id="organisers-title"
              eyebrow="Organised by"
              title="About the organisers"
            />
          </Reveal>

          <Reveal delay={0.05} className="mt-10">
            {organisers.map((org) => (
              <OrganiserProfile
                key={org.name}
                org={org}
              />
            ))}
          </Reveal>

        </div>
      </Section>

      {/* Promoters, supporters and concurrent event */}
      <Section
        tone="sand"
        labelledBy="partners-heading"
        id="partners"
      >
        <div className="container-site space-y-12">

          <h2 id="partners-heading" className="sr-only">
            Promoters, supporters and concurrent event
          </h2>

          {/* Promoted by */}
          <Reveal>
            <p className="tag">Promoted by</p>

            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {promoters.map((org) => (
                <PartnerCard
                  key={org.name}
                  org={org}
                  variant="promoter"
                />
              ))}
            </ul>
          </Reveal>

          {/* Supported by */}
          <Reveal>
            <p className="tag">Supported by</p>

            <p className="mt-3 max-w-2xl text-ink-600">
              National industry associations that support
              the expo. They are supporters of the event,
              not its organisers.
            </p>

            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {supporters.map((org) => (
                <PartnerCard
                  key={org.name}
                  org={org}
                  variant="supporter"
                />
              ))}
            </ul>
          </Reveal>

          {/* Concurrent event */}
          <Reveal>
            <p className="tag">Concurrent event</p>

            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              <PartnerCard
                org={concurrentEvent}
                variant="concurrent"
              />
            </ul>
          </Reveal>

        </div>
      </Section>

      {/* Contact information */}
      <Section tone="white" labelledBy="contacts-title">
        <div className="container-site">

          <SectionHeading
            id="contacts-title"
            title="Please contact for more info"
            accent
          />

          <ul className="mt-8 grid gap-4 md:grid-cols-2">

            {contacts.map((contact) => (
              <li
                key={contact.email}
                className="min-w-0 rounded-xl border-l-4 border-brand-500 bg-sand-50 p-6"
              >
                <p className="text-lg font-bold text-ink-900">
                  {contact.name}
                </p>

                <p className="text-sm text-ink-500">
                  {contact.organisation}
                </p>

                <p className="mt-3 flex flex-col gap-1.5 text-[0.9375rem]">

                  <a
                    href={`tel:+${contact.phoneDigits}`}
                    className="inline-flex items-center gap-2 font-medium text-ink-800 transition-colors duration-150 hover:text-brand-600"
                  >
                    <Phone
                      aria-hidden
                      className="size-4 shrink-0 text-brand-500"
                    />
                    {contact.phone}
                  </a>

                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 break-all font-medium text-ink-800 transition-colors duration-150 hover:text-brand-600"
                  >
                    <Mail
                      aria-hidden
                      className="size-4 shrink-0 text-brand-500"
                    />
                    {contact.email}
                  </a>

                </p>
              </li>
            ))}

          </ul>

          <ButtonLink
            href="/contact?interest=partner"
            variant="dark"
            className="mt-8"
          >
            Partner or media enquiry
          </ButtonLink>

        </div>
      </Section>

      <CtaBand />
    </>
  );
}
