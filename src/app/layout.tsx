
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, Inter } from "next/font/google";

import { SITE_URL, siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/jsonld";

import "./globals.css";

// Display font
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Body, navigation and form font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Global SEO metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${siteConfig.name} 2027 | ${siteConfig.event.datesShort}, Kathmandu`,
    template: `%s | ${siteConfig.shortName} 2027`,
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  authors: [
    {
      name: siteConfig.name,
      url: SITE_URL,
    },
  ],

  creator: siteConfig.name,
  publisher: siteConfig.name,

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "business",
};

// Global viewport configuration
export const viewport: Viewport = {
  themeColor: "#e32b1b",
  colorScheme: "light",
};

// Independent of Next.js generated LayoutProps
type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable}`}
    >
      <body className="flex min-h-dvh flex-col">

        {/* Accessibility skip link */}
        <a
          href="#main"
          className="sr-only z-[60] bg-ink-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>

        {/* Global navigation */}
        <SiteHeader />

        {/* Main page content */}
        <main id="main" className="flex-1">
          {children}
        </main>

        {/* Global footer */}
        <SiteFooter />

        {/* Structured SEO data */}
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(),
          ]}
        />

      </body>
    </html>
  );
}
