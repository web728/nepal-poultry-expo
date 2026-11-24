import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Privacy Policy — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Privacy Policy",
    eyebrow: "Legal",
    photo: "gallery/2017-chitwan/poultry-54.jpg",
  });
}
