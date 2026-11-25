
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

/** Reads the original background photo without native image processing. */
async function photoDataUrl(imagePath: string) {
  const rel = path
    .normalize(imagePath.replace(/^\/?(images\/)?/, ""))
    .replace(/^(\.\.[\\/])+/, "");

  const absolutePath = path.join(
    process.cwd(),
    "public",
    "images",
    rel
  );

  const file = await readFile(absolutePath);
  const mimeType = getMimeType(absolutePath);

  return `data:${mimeType};base64,${file.toString("base64")}`;
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

/** Branded 1200×630 social image generated directly by Next ImageResponse. */
export async function renderOgImage({
  title,
  eyebrow,
  photo,
}: {
  title: string;
  eyebrow: string;
  photo: string;
}) {
  const [bg, logo] = await Promise.all([
    photoDataUrl(photo),
    logoDataUrl(),
  ]);

  const { event } = siteConfig;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0e0e10",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bg}
          width={1200}
          height={630}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(100deg, rgba(14,14,16,0.97) 0%, rgba(14,14,16,0.9) 48%, rgba(14,14,16,0.5) 100%)",
          }}
        />

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={154} height={110} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
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

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 12,
            display: "flex",
            backgroundImage:
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
