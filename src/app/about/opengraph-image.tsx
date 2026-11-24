import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Your gateway to Nepal's poultry & livestock market — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Your gateway to Nepal's poultry & livestock market",
    eyebrow: "About the expo",
    photo: "gallery/2017-chitwan/poultry-74.jpg",
  });
}
