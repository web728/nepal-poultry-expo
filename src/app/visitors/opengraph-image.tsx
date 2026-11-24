import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Meet the poultry & livestock industry in one place — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Meet the poultry & livestock industry in one place",
    eyebrow: "Visitor information",
    photo: "gallery/2017-chitwan/poultry-53.jpg",
  });
}
