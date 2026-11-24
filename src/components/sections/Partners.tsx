import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig, type Organisation } from "@/config/site";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

function LogoTile({ org, tall = false }: { org: Organisation; tall?: boolean }) {
  return (
    <li className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-sand-200 bg-white px-5 py-5 text-center">
      {org.logo && (
        <Image
          src={org.logo.src}
          alt={`${org.name} logo`}
          width={org.logo.width}
          height={org.logo.height}
          sizes="220px"
          className={tall ? "h-16 w-auto" : "h-11 w-auto max-w-[200px] object-contain"}
        />
      )}
      <span className="text-[0.8125rem] leading-snug text-ink-600">{org.name}</span>
    </li>
  );
}

function Group({ label, orgs, tall, cols }: { label: string; orgs: Organisation[]; tall?: boolean; cols: string }) {
  return (
    <div>
      <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
        <span aria-hidden className="h-px w-6 bg-brand-500" /> {label}
      </h3>
      <ul className={`mt-4 grid gap-3 ${cols}`}>
        {orgs.map((o) => (
          <LogoTile key={o.name} org={o} tall={tall} />
        ))}
      </ul>
    </div>
  );
}

/** Promoted by / Supported by / Organised by / Concurrent event — exactly as on the brochure. */
export function Partners({ showLink = true }: { showLink?: boolean }) {
  const { promoters, supporters, organisers, concurrentEvent } = siteConfig;
  return (
    <Section tone="sand" labelledBy="partners-title" id="partners">
      <div className="container-site">
        <h2 id="partners-title" className="sr-only">
          Promoters, supporters and organisers
        </h2>
        <Reveal className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <Group label="Promoted by" orgs={[...promoters]} tall cols="grid-cols-1" />
          <Group label="Supported by" orgs={[...supporters]} tall cols="sm:grid-cols-2" />
        </Reveal>
        <Reveal delay={0.06} className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <Group label="Organised by" orgs={[...organisers]} cols="sm:grid-cols-2" />
          <Group label="Concurrent event" orgs={[concurrentEvent]} cols="grid-cols-1" />
        </Reveal>
        {showLink && (
          <Link href="/about/organizers" className="group mt-8 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-900 hover:text-brand-600">
            About the organisers and partners
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </Section>
  );
}
