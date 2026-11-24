import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd, eventSchema } from "@/lib/seo/jsonld";
import { HomeHero } from "@/components/sections/HomeHero";
import { EventFacts } from "@/components/sections/EventFacts";
import { Ticker } from "@/components/ui/Ticker";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { WhyNepal } from "@/components/sections/WhyNepal";
import { SegmentsSection } from "@/components/sections/SegmentsSection";
import { ExhibitVisitSplit } from "@/components/sections/ExhibitVisitSplit";
import { VisitorGroups } from "@/components/sections/VisitorGroups";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { Partners } from "@/components/sections/Partners";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Nepal Poultry & Livestock International Expo 2027 | 18–20 Feb, Kathmandu",
  absoluteTitle: true,
  description:
    "Nepal's international B2B poultry & livestock trade show, 18–20 February 2027 at Bhrikuti Mandap, Kathmandu. Feed, animal health, hatchery, dairy, equipment. Book a stand.",
  path: "/",
});

export default function HomePage() {
  const event = eventSchema();
  return (
    <>
      <HomeHero />
      <EventFacts />
      <Ticker />
      <AboutIntro />
      <WhyNepal />
      <SegmentsSection />
      <ExhibitVisitSplit />
      <VisitorGroups />
      <GalleryPreview />
      <Partners />
      <CtaBand />
      {event && <JsonLd data={event} />}
    </>
  );
}
