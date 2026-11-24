import { CalendarDays, Lock, MapPin, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Section } from "@/components/ui/Section";

/** Two-column layout for form pages: the form card plus a facts / reassurance sidebar. */
export function FormPageLayout({
  children,
  aside,
  formTitle,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  formTitle: string;
}) {
  const { event } = siteConfig;
  return (
    <Section tone="light" className="pt-10 md:pt-12 lg:pt-14">
      <div className="container-site grid items-start gap-10 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem] xl:gap-14">
        <div className="rounded-xl border border-sand-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgb(0_0_0/0.35)] sm:p-8 lg:p-10">
          <h2 className="headline mb-6 text-xl text-ink-900 sm:text-2xl">{formTitle}</h2>
          {children}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28">
          {aside}
          <div className="overflow-hidden rounded-xl bg-brand-500 text-white">
            <p className="border-b border-white/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em]">The expo</p>
            <ul className="space-y-2.5 px-5 py-4 text-sm font-medium">
              <li className="flex gap-3">
                <CalendarDays aria-hidden className="mt-0.5 size-4 shrink-0" />
                {event.datesLabel}
              </li>
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                {event.venue.name}, {event.venue.city}
              </li>
            </ul>
          </div>
          <div className="space-y-3 px-1 text-xs leading-relaxed text-ink-500">
            <p className="flex gap-2.5">
              <ShieldCheck aria-hidden className="size-4 shrink-0 text-ink-400" />
              Protected by Google reCAPTCHA. Your details are verified and stored securely.
            </p>
            <p className="flex gap-2.5">
              <Lock aria-hidden className="size-4 shrink-0 text-ink-400" />
              <span>
                We use your information only for this expo — see the{" "}
                <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ink-900">
                  Privacy Policy
                </a>
                .
              </span>
            </p>
          </div>
        </aside>
      </div>
    </Section>
  );
}

export function AsideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-brand-500 bg-ink-900 p-5 text-white">
      <p className="text-lg font-bold">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-ink-300">{children}</div>
    </div>
  );
}
