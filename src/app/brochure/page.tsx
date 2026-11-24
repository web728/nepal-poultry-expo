import Image from "next/image";
import { Check } from "lucide-react";
import { img } from "@/lib/images";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { BrochureForm } from "@/components/forms/BrochureForm";

export const metadata = pageMetadata({
  title: "Download the Expo Brochure 2027",
  description:
    "Download the Nepal Poultry & Livestock International Expo 2027 brochure: about the expo, why Nepal, who should exhibit, visitor profile, why exhibit and organiser contacts.",
  path: "/brochure",
});

const INSIDE = [
  "About the expo and why Nepal",
  "Industry figures",
  "Who should exhibit — six product sectors",
  "Target trade visitor profile",
  "Why exhibit",
  "Organisers and contacts",
];

export default function BrochurePage() {
  const cover = img("brand/brochure-cover-preview.jpg");
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Exhibitors", path: "/exhibitors" },
          { name: "Brochure", path: "/brochure" },
        ]}
        eyebrow="Expo brochure 2027"
        title="Download the expo brochure"
        intro="Fill in your details and the download opens as soon as your request is confirmed. We also e-mail you a personal link."
      />
      <FormPageLayout
        formTitle="Where should we send it?"
        aside={
          <div className="rounded-xl border border-sand-200 bg-white p-5">
            <div className="relative mx-auto aspect-[774/1094] w-40 overflow-hidden rounded-md shadow-[0_18px_40px_-20px_rgb(0_0_0/0.55)] ring-1 ring-sand-200">
              <Image src={cover.src} alt="Cover of the Nepal Poultry & Livestock International Expo 2027 brochure" fill sizes="160px" placeholder="blur" blurDataURL={cover.blurDataURL} className="object-cover" />
            </div>
            <p className="mt-5 text-sm font-bold uppercase tracking-wide text-ink-900">Inside the brochure</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {INSIDE.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-500" />
                  {i}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-500">PDF · 4 pages · about 7.8 MB</p>
          </div>
        }
      >
        <BrochureForm />
      </FormPageLayout>
    </>
  );
}
