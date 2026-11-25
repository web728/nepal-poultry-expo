import "server-only";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Recaptcha-Revision": "runtime-v2" };
export function GET() {
  // Dynamic lookup avoids Next.js build-time substitution.
  const read = (name: string) => process.env[name]?.trim();
  const siteKey = read("RECAPTCHA_SITE_KEY") || read("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
  if (!siteKey) return Response.json({ ok: false, code: "missing_site_key" }, { status: 503, headers });
  // Only the public site key is returned. Never return the secret key.
  return Response.json({ ok: true, siteKey }, { headers });
}
