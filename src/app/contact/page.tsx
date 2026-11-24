import { Suspense } from "react";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { ContactForm } from "@/components/forms/ContactForm";
import { FacebookIcon } from "@/components/icons";

export const metadata = pageMetadata({
  title: "Contact the Organisers",
  description:
    "Contact the Nepal Poultry & Livestock International Expo 2027 team — Futurex (New Delhi) and Media Space Solutions (Kathmandu) — about exhibiting, visiting, partnerships or media.",
  path: "/contact",
});

function ContactDetails() {
  const { contacts, event, social } = siteConfig;
  return (
    <div className="space-y-4">
      {contacts.map((c) => (
        <div key={c.email} className="rounded-xl border-l-4 border-brand-500 bg-white p-5 shadow-[0_14px_30px_-26px_rgb(0_0_0/0.5)]">
          <p className="font-bold text-ink-900">{c.name}</p>
          <p className="text-xs text-ink-500">{c.organisation}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`tel:+${c.phoneDigits}`} className="inline-flex items-center gap-2 font-medium text-ink-800 hover:text-brand-600">
                <Phone aria-hidden className="size-4 text-brand-500" /> {c.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${c.phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-ink-800 hover:text-brand-600"
              >
                <MessageCircle aria-hidden className="size-4 text-brand-500" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 break-all font-medium text-ink-800 hover:text-brand-600">
                <Mail aria-hidden className="size-4 shrink-0 text-brand-500" /> {c.email}
              </a>
            </li>
          </ul>
        </div>
      ))}
      <div className="rounded-xl border border-sand-200 bg-white p-5 text-sm text-ink-700">
        <p className="flex gap-3">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-500" />
          <span>
            {event.venue.name}
            <br />
            {event.venue.city}, {event.venue.country}
            <br />
            <a href={event.venue.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
              View map <ExternalLink aria-hidden className="size-3" />
            </a>
          </span>
        </p>
        <p className="mt-3 flex gap-3">
          <FacebookIcon className="mt-0.5 size-4 shrink-0 text-brand-500" />
          <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
            facebook.com/NepalPoultryExpo
          </a>
        </p>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div aria-hidden className="grid animate-pulse gap-5 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[4.75rem] rounded-md bg-sand-100" />
      ))}
      <div className="h-40 rounded-md bg-sand-100 md:col-span-2" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        eyebrow="Contact"
        title="Please contact for more info"
        intro="Questions about exhibiting, visiting, partnerships or media coverage? Call, WhatsApp or e-mail the organisers directly, or send a message below."
      />
      <FormPageLayout formTitle="Send an enquiry" aside={<ContactDetails />}>
        <Suspense fallback={<FormSkeleton />}>
          <ContactForm />
        </Suspense>
      </FormPageLayout>
    </>
  );
}
