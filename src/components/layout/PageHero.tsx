import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ManifestImage } from "@/lib/images";
import { JsonLd, breadcrumbSchema, type Crumb } from "@/lib/seo/jsonld";

/**
 * Inner-page header: charcoal banner over a photograph, technical grid, red glow,
 * kicker, wide uppercase title and the signature red→orange rule along the bottom.
 * Includes the visible breadcrumb + BreadcrumbList JSON-LD.
 */
export function PageHero({
  crumbs,
  title,
  intro,
  eyebrow,
  image,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  intro?: React.ReactNode;
  eyebrow?: string;
  image?: ManifestImage;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white [--tag-color:var(--color-flame-400)]">
      {image && (
        <Image
          src={image.src}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          quality={60}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="-z-30 object-cover"
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-r from-ink-950 via-ink-950/88 to-ink-950/45" />
      <div aria-hidden className="grid-lines absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,black,transparent_75%)]" />
      <div aria-hidden className="absolute -left-48 -top-48 -z-10 size-[34rem] rounded-full bg-brand-500/20 blur-[110px]" />

      <div className="container-site pb-16 pt-8 md:pb-20 lg:pb-24 lg:pt-10">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-300">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={c.path} className="flex items-center gap-1.5">
                  {last ? (
                    <span aria-current="page" className="font-medium text-white">
                      {c.name}
                    </span>
                  ) : (
                    <>
                      <Link href={c.path} className="transition-colors hover:text-white">
                        {c.name}
                      </Link>
                      <ChevronRight aria-hidden className="size-3.5 text-ink-400" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="mt-12 max-w-3xl animate-hero-in motion-reduce:animate-none lg:mt-16">
          {eyebrow && <p className="tag mb-5">{eyebrow}</p>}
          <h1 className="headline text-[2.1rem] sm:text-[2.9rem] lg:text-[3.6rem]">{title}</h1>
          {intro && <div className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-200">{intro}</div>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
      <div aria-hidden className="bg-signature absolute inset-x-0 bottom-0 h-1" />
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </section>
  );
}
