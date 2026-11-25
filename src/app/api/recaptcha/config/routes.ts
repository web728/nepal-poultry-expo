
import "server-only";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Recaptcha-Revision": "runtime-v3",
};

export async function GET() {
  const siteKey =
    process.env.RECAPTCHA_SITE_KEY?.trim() ||
    process.env["NEXT_PUBLIC_RECAPTCHA_SITE_KEY"]?.trim();

  if (!siteKey) {
    console.error(
      "[recaptcha] Missing public site key configuration"
    );

    return Response.json(
      {
        ok: false,
        code: "missing_site_key",
        error: "RECAPTCHA_SITE_KEY is not configured.",
      },
      { status: 503, headers }
    );
  }

  return Response.json(
    {
      ok: true,
      siteKey,
    },
    { status: 200, headers }
  );
}
