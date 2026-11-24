import { SITE_URL, siteConfig } from "@/config/site";

type JsonLdValue = Record<string, unknown>;

/** Renders JSON-LD safely (escapes `<` so content can never close the script tag). */
export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${siteConfig.logo.src}`,
      width: siteConfig.logo.width,
      height: siteConfig.logo.height,
    },
    slogan: siteConfig.tagline,
    sameAs: [siteConfig.social.facebook],
    contactPoint: siteConfig.contacts.map((c) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      name: c.name,
      email: c.email,
      telephone: `+${c.phoneDigits}`,
      availableLanguage: ["English", "Nepali", "Hindi"],
    })),
  };
}

export function websiteSchema(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: siteConfig.name,
    alternateName: [siteConfig.shortName, "Nepal Poultry & Livestock Expo"],
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

/**
 * ExhibitionEvent for the upcoming edition — only emitted once real dates are set in
 * siteConfig.event, because Google requires a start date and we never invent one.
 */
export function eventSchema(): JsonLdValue | null {
  const { startDate, endDate, venue } = siteConfig.event;
  if (!startDate || !endDate) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    name: `${siteConfig.name} ${siteConfig.edition}`,
    description: siteConfig.description,
    startDate,
    endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: SITE_URL,
    image: [`${SITE_URL}/opengraph-image`, `${SITE_URL}/images/brand/brochure-cover-preview.jpg`],
    location: {
      "@type": "Place",
      name: venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: venue.city,
        addressCountry: venue.countryCode,
      },
    },
    organizer: siteConfig.organisers.map((o) => ({ "@type": "Organization", name: o.name })),
    sponsor: siteConfig.promoters.map((o) => ({ "@type": "GovernmentOrganization", name: o.name })),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}
