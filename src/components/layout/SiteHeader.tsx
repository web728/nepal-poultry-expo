import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Download, MapPin, Phone } from "lucide-react";
import { mainNav, siteConfig } from "@/config/site";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon } from "@/components/icons";
import { BrochureLink } from "@/components/forms/BrochureLink";

/** Event-facts bar above the main header (tablet and up). */
function UtilityBar() {
  const { event, contacts } = siteConfig;
  const local = contacts[1];
  return (
    <div className="hidden bg-ink-950 text-ink-300 md:block">
      <div className="container-site flex h-9 items-center justify-between text-[0.8125rem]">
        <p className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
            <CalendarDays aria-hidden className="size-3.5 text-flame-400" />
            {event.datesLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden className="size-3.5 text-flame-400" />
            {event.venue.shortName}, {event.venue.city}
          </span>
        </p>
        <div className="flex items-center gap-5">
          <a href={`tel:+${local.phoneDigits}`} className="hidden items-center gap-1.5 transition-colors hover:text-white lg:inline-flex">
            <Phone aria-hidden className="size-3.5" />
            {local.phone}
          </a>
          <BrochureLink className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <Download aria-hidden className="size-3.5" />
            Brochure 2027
          </BrochureLink>
          <a
            href={siteConfig.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nepal Poultry Expo on Facebook"
            className="inline-flex items-center transition-colors hover:text-white"
          >
            <FacebookIcon className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <>
      <UtilityBar />
      <header data-elevate="" className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="container-site flex h-16 items-center justify-between gap-6 lg:h-20">
          <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} ${siteConfig.edition} — home`}>
            <Image
              src={siteConfig.logo.src}
              alt={`${siteConfig.name} logo`}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              loading="eager"
              className="h-12 w-auto lg:h-[60px]"
              sizes="(min-width: 1024px) 84px, 67px"
            />
          </Link>
          <div className="flex items-center gap-4 xl:gap-8">
            <DesktopNav items={mainNav} />
            <div className="hidden items-center gap-2 lg:flex">
              <ButtonLink href="/register/visitor" variant="outline" size="sm" className="hidden xl:inline-flex">
                Register to Visit
              </ButtonLink>
              <ButtonLink href="/register/exhibitor" size="sm">
                Book a Stand
              </ButtonLink>
            </div>
            <MobileNav items={mainNav} />
          </div>
        </div>
      </header>
    </>
  );
}
