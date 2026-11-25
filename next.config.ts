
import type { NextConfig } from "next";

/** Old WordPress URLs → new routes (permanent). */
const legacyRedirects = [
  ["/about-expo", "/about"],
  ["/about-organizers", "/about/organizers"],
  ["/exhibitors-information", "/exhibitors"],
  ["/exhibitors-registration", "/register/exhibitor"],
  ["/visitors-information", "/visitors"],
  ["/visitors-registration", "/register/visitor"],
  ["/gallery", "/media"],
  ["/home", "/"],
] as const;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Disable Cache Components for Cloudflare Workers runtime compatibility.
  cacheComponents: false,
  partialPrefetching: false,

  poweredByHeader: false,
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [32, 48, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  outputFileTracingIncludes: {
    "/api/brochure/download": ["./private/brochure/**/*"],
    "/api/submissions": ["./private/brochure/**/*"],
    "/api/cron/outbox": ["./private/brochure/**/*"],
  },

  async redirects() {
    return legacyRedirects.flatMap(([source, destination]) => [
      { source, destination, permanent: true },
      { source: `${source}/`, destination, permanent: true },
    ]);
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) =>
  m.initOpenNextCloudflareForDev()
);
