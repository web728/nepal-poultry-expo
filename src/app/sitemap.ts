import type { MetadataRoute } from "next";
import { SITE_URL, siteConfig } from "@/config/site";

/** Every indexable route, with a priority hint that mirrors the navigation hierarchy. */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/exhibitors", priority: 0.9, changeFrequency: "monthly" },
  { path: "/register/exhibitor", priority: 0.9, changeFrequency: "monthly" },
  { path: "/visitors", priority: 0.9, changeFrequency: "monthly" },
  { path: "/register/visitor", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about/organizers", priority: 0.6, changeFrequency: "yearly" },
  { path: "/media", priority: 0.7, changeFrequency: "monthly" },
  { path: "/brochure", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${siteConfig.contentUpdated}T00:00:00Z`);
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === "/" ? "/" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
