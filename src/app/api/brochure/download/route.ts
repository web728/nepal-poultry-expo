import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { brochureFilePath, verifyBrochureToken } from "@/lib/brochure/brochure";

/** Streams the brochure PDF for a valid, unexpired signed link issued after a brochure request. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyBrochureToken(token);
  if (!verified) {
    return new Response("This download link is invalid or has expired. Please request the brochure again.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  let file: Buffer;
  try {
    file = await readFile(brochureFilePath());
  } catch {
    return new Response("The brochure is not available yet. We will e-mail it to you once it is published.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const ext = path.extname(brochureFilePath()).toLowerCase();
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": ext === ".pdf" ? "application/pdf" : "application/octet-stream",
      "Content-Disposition": `attachment; filename="Nepal-Poultry-Livestock-Expo-Brochure${ext || ".pdf"}"`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
