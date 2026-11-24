import Image from "next/image";
import type { ManifestImage } from "@/lib/images";
import { cn } from "@/lib/cn";

/**
 * Photo in a rotated-square ("diamond") frame — the collage motif of the brochure cover.
 * The frame is a rotated box; the image inside is counter-rotated and scaled to fill it.
 */
export function DiamondImage({
  image,
  className,
  sizes = "320px",
  priority = false,
  ring = "ring-white",
}: {
  image: ManifestImage;
  className?: string;
  sizes?: string;
  priority?: boolean;
  ring?: string;
}) {
  return (
    <div className={cn("relative aspect-square", className)}>
      <div className={cn("absolute inset-[14.6%] rotate-45 overflow-hidden rounded-[18%] bg-sand-200 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.45)] ring-[5px]", ring)}>
        <div className="absolute inset-[-21%] -rotate-45">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            loading={priority ? "eager" : "lazy"}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
