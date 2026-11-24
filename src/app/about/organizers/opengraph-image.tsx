import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Organisers, promoters and supporters — Nepal Poultry & Livestock International Expo 2027";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Organisers, promoters and supporters",
    eyebrow: "About the organisers",
    photo: "gallery/2017-chitwan/poultry-21.jpg",
  });
}
