import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { brochureFilePath, verifyBrochureToken } from "@/lib/brochure/brochure";

export const dynamic = "force-dynamic";
const privateHeaders = {
  "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff",
};
function failure(message: string, status: number) {
  return new Response(message, { status, headers: { ...privateHeaders, "Content-Type": "text/plain; charset=utf-8" } });
}
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!verifyBrochureToken(token)) return failure("This download link is invalid or has expired. Please request the brochure again.", 403);
  const filePath = brochureFilePath();
  if (path.extname(filePath).toLowerCase() !== ".pdf") return failure("The brochure is not available yet.", 404);
  try {
    const file = await readFile(filePath);
    if (!file.length) return failure("The brochure is not available yet.", 404);
    return new Response(new Uint8Array(file), { headers: {
      ...privateHeaders, "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Nepal-Poultry-Livestock-Expo-Brochure.pdf"',
      "Content-Length": String(file.byteLength),
    } });
  } catch { return failure("The brochure is not available yet. Please try again later.", 404); }
}
