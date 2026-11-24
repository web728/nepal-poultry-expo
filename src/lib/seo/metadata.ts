import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetaInput = {
  /** Page title without the brand suffix (the root layout template adds it). */
  title: string;
  description: string;
  path: string;
  /** Use the absolute title as-is (home page). */
  absoluteTitle?: boolean;
  noIndex?: boolean;
};

/**
 * Per-page metadata: unique title + description, self-referencing canonical,
 * Open Graph and Twitter tags. Open Graph images come from each route's
 * `opengraph-image.tsx`, which Next.js merges in automatically.
 */
export function pageMetadata({ title, description, path, absoluteTitle, noIndex }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.shortName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}
