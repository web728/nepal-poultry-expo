import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Nepal Poultry & Livestock International Expo 2027 — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Nepal Poultry & Livestock International Expo 2027",
    eyebrow: "18–20 February 2027 · Kathmandu",
    photo: "brand/hero-strip.jpg",
  });
}
