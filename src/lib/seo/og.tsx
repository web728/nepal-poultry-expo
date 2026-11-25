
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const OG_SIZE = { width: 1200, height: 630 };

// ImageResponse generates PNG directly. No Sharp/native dependency required.
export const OG_CONTENT_TYPE = "image/png";

function getMimeType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };

  return mimeTypes[extension] ?? "application/octet-stream";
}

/** Reads the event logo and converts it into a data URL. */
async function logoDataUrl() {
  const logoPath = path.join(
    process.cwd(),
    "public",
    "logos",
    path.basename(siteConfig.logo.white)
  );

  const file = await readFile(logoPath);
  const mimeType = getMimeType(logoPath);

  return `data:${mimeType};base64,${file.toString("base64")}`;
}

/**
 * Branded 1200x630 social image generated without external photographs.
 * The optional photo property is retained for backward compatibility
 * with existing route callers, but is intentionally not used.
 */
export async function renderOgImage({
  title,
  eyebrow,
  photo: _photo,
}: {
  title: string;
  eyebrow: string;
  photo?: string;
}) {
  const logo = await logoDataUrl();

  const { event } = siteConfig;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(115deg, #0e0e10 0%, #191719 48%, #641e19 100%)",
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -220,
            width: 650,
            height: 650,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -70,
            top: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.07)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(227,43,27,0.17), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 72px 66px",
            width: "100%",
          }}
        >
          {/* Event logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={154} height={110} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Eyebrow */}
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#e32b1b",
                  color: "#ffffff",
                  fontSize: 20,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  padding: "8px 14px",
                }}
              >
                {eyebrow}
              </div>
            </div>

            {/* Main title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 20,
                color: "#ffffff",
                fontSize: 60,
                lineHeight: 1.06,
                fontWeight: 800,
                maxWidth: 940,
                letterSpacing: -1,
                textTransform: "uppercase",
                fontStyle: "italic",
              }}
            >
              {title}
            </div>

            {/* Event information */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 26,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#ff7a45" }}>
                {event.datesLabel}
              </span>

              <span
                style={{
                  color: "#b6b6bd",
                  marginLeft: 14,
                }}
              >
                {`· ${event.venue.shortName}, ${event.venue.city}, ${event.venue.country}`}
              </span>
            </div>
          </div>
        </div>

        {/* Signature bottom accent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 12,
            display: "flex",
            background:
              "linear-gradient(90deg, #e32b1b, #ff5e21, #ffa47e)",
          }}
        />
      </div>
    ),
    {
      ...OG_SIZE,
    }
  );

  const imageBuffer = await image.arrayBuffer();

  return new Response(imageBuffer, {
    headers: {
      "Content-Type": OG_CONTENT_TYPE,
      "Cache-Control":
        "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
