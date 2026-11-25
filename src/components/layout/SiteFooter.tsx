
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { footerNav, siteConfig } from "@/config/site";
import { FacebookIcon } from "@/components/icons";

function currentYear() {
  return new Date().getFullYear();
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="eyebrow text-ink-400">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-[0.9375rem] text-ink-200 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Orange "Please contact for more info" band, as on the back page of the brochure. */
function ContactBand() {
  return (
    <section
      aria-labelledby="footer-contact-title"
      className="border-t-4 border-flame-500 bg-gradient-to-r from-brand-600 to-brand-500 text-white"
    >
      <div className="container-site grid gap-6 py-8 md:grid-cols-[auto_1fr_1fr] md:items-center md:gap-10">
        <h2 id="footer-contact-title" className="leading-tight">
          <span className="block text-sm font-bold uppercase tracking-wide">
            Please contact
          </span>
          <span className="headline block text-3xl">for more info</span>
        </h2>

        {siteConfig.contacts.map((c) => (
          <div key={c.email} className="border-white/40 md:border-l md:pl-10">
            <p className="font-bold">{c.name}</p>
            <p className="text-sm text-white">{c.organisation}</p>

            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem]">
              <a
                href={`tel:+${c.phoneDigits}`}
                className="inline-flex items-center gap-1.5 font-medium hover:underline"
              >
                <Phone aria-hidden className="size-4" /> {c.phone}
              </a>

              <a
                href={`mailto:${c.email}`}
                className="inline-flex items-center gap-1.5 font-medium hover:underline"
              >
                <Mail aria-hidden className="size-4" /> {c.email}
              </a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function SiteFooter() {
  const year = currentYear();

  const {
    event,
    organisers,
    supporters,
    promoters,
    concurrentEvent,
  } = siteConfig;

  return (
    <footer>
      <ContactBand />

      <div className="bg-ink-950 text-ink-300">
        <div className="container-site grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-16">
          <div className="max-w-sm">
            <Image
              src={siteConfig.logo.white}
              alt={`${siteConfig.name} logo`}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              className="h-20 w-auto"
              sizes="112px"
            />

            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-300">
              {siteConfig.tagline}. {siteConfig.positioning}
            </p>

            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm text-ink-200 transition-colors hover:text-white"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md border border-white/15">
                <FacebookIcon />
              </span>
              Follow on Facebook
            </a>
          </div>

          <FooterLinks title="Explore" links={footerNav.explore} />

          <FooterLinks
            title="Participate"
            links={footerNav.participate}
          />

          <div>
            <h2 className="eyebrow text-ink-400">Event</h2>

            <ul className="mt-4 space-y-3 text-[0.9375rem] text-ink-200">
              <li className="flex gap-3">
                <CalendarDays
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-flame-400"
                />
                {event.datesLabel}
              </li>

              <li className="flex gap-3">
                <MapPin
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-flame-400"
                />
                <a
                  href={event.venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {event.venue.name}, {event.venue.city},{" "}
                  {event.venue.country}
                </a>
              </li>
            </ul>

            <p className="mt-6 text-sm leading-relaxed text-ink-400">
              Organised by{" "}
              <span className="text-ink-200">
                {organisers.map((o) => o.name).join(" and ")}
              </span>
            </p>

            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              Concurrent event:{" "}
              <span className="text-ink-200">
                {concurrentEvent.name}
              </span>
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-site flex flex-col gap-3 py-6 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {siteConfig.name}. All rights reserved.
            </p>

            <ul className="flex gap-6">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Contact{" "}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
