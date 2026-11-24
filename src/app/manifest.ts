import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "browser",
    background_color: "#fbf9f6",
    theme_color: "#0d1a2b",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
