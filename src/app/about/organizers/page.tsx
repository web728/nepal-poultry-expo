import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { siteConfig, type Organisation } from "@/config/site";
import { photo } from "@/lib/images";
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

function OrganiserProfile({ org }: { org: Organisation }) {
  return (
    <article className="grid gap-6 border-t border-sand-200 py-10 first:border-t-0 first:pt-0 md:grid-cols-[16rem_1fr] md:gap-12">
      <div className="flex h-28 items-center justify-center rounded-xl border border-sand-200 bg-white px-6">
        {org.logo && <Image src={org.logo.src} alt={`${org.name} logo`} width={org.logo.width} height={org.logo.height} sizes="220px" className="h-14 w-auto max-w-full object-contain" />}
      </div>
      <div>
        <h3 className="text-2xl">{org.name}</h3>
        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-700">{org.description}</p>
      </div>
    </article>
  );
}

function PartnerCard({ org }: { org: Organisation }) {
  return (
    <li className="flex items-center gap-6 rounded-xl border border-sand-200 bg-white p-6">
      <div className="flex size-24 shrink-0 items-center justify-center">
        {org.logo && <Image src={org.logo.src} alt={`${org.name} logo`} width={org.logo.width} height={org.logo.height} sizes="96px" className="max-h-24 w-auto object-contain" />}
      </div>
      <div>
        <h3 className="text-lg">{org.name}</h3>
        <p className="mt-1 text-[0.9375rem] text-ink-600">{org.description}</p>
      </div>
    </li>
  );
}

export default function OrganizersPage() {
  const { organisers, promoters, supporters, concurrentEvent, contacts } = siteConfig;
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About the Expo", path: "/about" },
          { name: "Organisers & Partners", path: "/about/organizers" },
        ]}
        eyebrow="About the organisers"
        title="Organisers, promoters and supporters"
        intro="Who runs the expo, the government programme that promotes it and the industry associations that support it."
      
      />

      <Section tone="white" labelledBy="organisers-title">
        <div className="container-site">
          <Reveal>
            <SectionHeading id="organisers-title" eyebrow="Organised by" title="About the organisers" />
          </Reveal>
          <Reveal delay={0.05} className="mt-10">
            {organisers.map((o) => (
              <OrganiserProfile key={o.name} org={o} />
            ))}
          </Reveal>
        </div>
      </Section>

      <Section tone="sand" labelledBy="partners-heading" id="partners">
        <div className="container-site space-y-12">
          <h2 id="partners-heading" className="sr-only">
            Promoters, supporters and concurrent event
          </h2>
          <Reveal>
            <p className="tag">Promoted by</p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {promoters.map((o) => (
                <PartnerCard key={o.name} org={o} />
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <p className="tag">Supported by</p>
            <p className="mt-3 max-w-2xl text-ink-600">National industry associations that support the expo. They are supporters of the event, not its organisers.</p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {supporters.map((o) => (
                <PartnerCard key={o.name} org={o} />
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <p className="tag">Concurrent event</p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              <PartnerCard org={concurrentEvent} />
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section tone="white" labelledBy="contacts-title">
        <div className="container-site">
          <SectionHeading id="contacts-title" title="Please contact for more info" accent />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {contacts.map((c) => (
              <li key={c.email} className="rounded-xl border-l-4 border-brand-500 bg-sand-50 p-6">
                <p className="text-lg font-bold text-ink-900">{c.name}</p>
                <p className="text-sm text-ink-500">{c.organisation}</p>
                <p className="mt-3 flex flex-col gap-1.5 text-[0.9375rem]">
                  <a href={`tel:+${c.phoneDigits}`} className="inline-flex items-center gap-2 font-medium text-ink-800 hover:text-brand-600">
                    <Phone aria-hidden className="size-4 text-brand-500" /> {c.phone}
                  </a>
                  <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 font-medium text-ink-800 hover:text-brand-600">
                    <Mail aria-hidden className="size-4 text-brand-500" /> {c.email}
                  </a>
                </p>
              </li>
            ))}
          </ul>
          <ButtonLink href="/contact?interest=partner" variant="dark" className="mt-8">
            Partner or media enquiry
          </ButtonLink>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
