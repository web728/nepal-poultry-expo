
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { BrochureLink } from "@/components/forms/BrochureLink";

/** Closing image-free call to action with a charcoal-to-red gradient. */
export function CtaBand({
  title = "Reserve your exhibition space today",
  body,
}: {
  title?: string;
  body?: string;
}) {
  const { event } = siteConfig;

  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-ink-950 py-20 text-white md:py-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(110deg,rgb(14_14_16/0.98)_0%,rgb(14_14_16/0.94)_45%,rgb(165_29_21/0.95)_100%)]"
      />

      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(to_left,black,transparent_70%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 -z-10 size-[32rem] rounded-full border border-white/10"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-28 -z-10 size-[24rem] rounded-full border border-white/10"
      />

      <Reveal className="container-site grid items-end gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="tag [--tag-color:var(--color-flame-400)]">
            {siteConfig.slogan}
          </p>

          <h2
            id="cta-title"
            className="headline mt-5 text-[2rem] sm:text-[2.75rem] lg:text-[3.4rem]"
          >
            {title}
          </h2>

          <p className="mt-5 font-display text-lg font-semibold text-ink-100 sm:text-xl">
            {event.datesLabel}
            <span className="mx-2 text-flame-400">/</span>
            {event.venue.shortName}, {event.venue.city}, {event.venue.country}
          </p>

          {body && (
            <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-200">
              {body}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
          <Link
            href="/register/exhibitor"
            className={buttonClasses({ size: "lg" })}
          >
            Book a Stand
            <ArrowRight aria-hidden className="size-4" />
          </Link>

          <Link
            href="/register/visitor"
            className={buttonClasses({ variant: "light", size: "lg" })}
          >
            Register to Visit
          </Link>

          <BrochureLink
            className={buttonClasses({ variant: "outline-light", size: "lg" })}
          >
            <Download aria-hidden className="size-4" />
            Brochure 2027
          </BrochureLink>
        </div>
      </Reveal>
    </section>
  );
}
