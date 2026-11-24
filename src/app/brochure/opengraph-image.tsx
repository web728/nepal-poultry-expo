import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Download the expo brochure 2027 — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Download the expo brochure 2027",
    eyebrow: "Expo brochure",
    photo: "brand/modern-livestock-and-poultry-farm.jpg",
  });
}
