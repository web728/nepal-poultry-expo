import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Book a stand — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Book a stand",
    eyebrow: "Exhibitor registration",
    photo: "gallery/2017-chitwan/poultry-62.jpg",
  });
}
