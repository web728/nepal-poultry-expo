import { ArrowRight, Newspaper } from "lucide-react";
import { siteConfig } from "@/config/site";
import { galleryImages, photo } from "@/lib/images";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Gallery } from "@/components/gallery/Gallery";
import { FacebookIcon } from "@/components/icons";

export const metadata = pageMetadata({
  title: "Media & Photo Gallery — 2017 Edition",
  description:
    "Photos from Nepal Poultry & Livestock International Expo 2017 at Chitwan Expo Center, Bharatpur: stands, equipment, sessions and awards.",
  path: "/media",
});

export default function MediaPage() {
  const images = galleryImages();
  const past = siteConfig.pastEditions[0];
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Media", path: "/media" },
        ]}
        eyebrow="Media"
        title="Gallery and media"
        intro={`Photographs from the ${past.year} edition — ${past.dates} at ${past.venue}.`}
        image={photo(68)}
      />

      <Section tone="white" labelledBy="gallery-heading">
        <div className="container-site">
          <SectionHeading
            id="gallery-heading"
            eyebrow={`${images.length} photographs`}
            title={`Nepal Poultry & Livestock International Expo ${past.year}`}
            intro="Exhibitor stands, equipment on show, technical sessions and the award ceremony. Select a photo to view it full size."
          />
          <div className="mt-10">
            <Gallery images={images} />
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="press-title">
        <div className="container-site grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between gap-6 border border-sand-300 bg-white p-6 sm:p-8">
            <div>
              <Newspaper aria-hidden className="size-6 text-brand-600" />
              <h2 id="press-title" className="mt-4 text-2xl">
                Media enquiries
              </h2>
              <p className="mt-2 text-ink-600">
                Journalists, trade publications and media partners can contact the organisers for information, interviews and
                accreditation.
              </p>
            </div>
            <ButtonLink href="/contact?interest=media" variant="dark" className="self-start">
              Contact the press team <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
          <div className="flex flex-col justify-between gap-6 border border-sand-300 bg-ink-900 p-6 text-white sm:p-8">
            <div>
              <FacebookIcon className="size-6 text-brand-400" />
              <h2 className="mt-4 text-2xl text-white">Follow the expo</h2>
              <p className="mt-2 text-ink-300">Announcements, dates and updates are posted on the expo&apos;s Facebook page.</p>
            </div>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 self-start border border-white/40 px-5 font-semibold text-white transition-colors hover:bg-white hover:text-ink-900"
            >
              Open Facebook page <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
