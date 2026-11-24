import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { photo, type ManifestImage } from "@/lib/images";
import { Section, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

function Tile({ image, className, sizes }: { image: ManifestImage; className?: string; sizes: string }) {
  return (
    <RevealItem className={cn("group relative overflow-hidden bg-sand-200", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={image.blurDataURL}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
    </RevealItem>
  );
}

/** Asymmetric preview of the past-edition photo library, linking to the full gallery. */
export function GalleryPreview() {
  const past = siteConfig.pastEditions[0];
  const [lead, a, b, c, d] = [photo(24), photo(54), photo(41), photo(38), photo(75)];
  return (
    <Section tone="white" labelledBy="gallery-title">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="gallery-title"
            eyebrow="Gallery"
            title={`Scenes from the ${past.year} edition`}
            intro={`${past.dates} at ${past.venue}.`}
          />
          <Link href="/media" className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-ink-900 hover:text-brand-700">
            View all photos
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <RevealGroup className="mt-10 grid auto-rows-[9.5rem] grid-cols-2 gap-2 sm:auto-rows-[12rem] md:grid-cols-4 md:gap-3 lg:auto-rows-[14rem]">
          <Tile image={lead} className="col-span-2 row-span-2" sizes="(min-width: 768px) 50vw, 100vw" />
          <Tile image={a} sizes="(min-width: 768px) 25vw, 50vw" />
          <Tile image={b} sizes="(min-width: 768px) 25vw, 50vw" />
          <Tile image={c} sizes="(min-width: 768px) 25vw, 50vw" />
          <Tile image={d} sizes="(min-width: 768px) 25vw, 50vw" />
        </RevealGroup>
      </div>
    </Section>
  );
}
