import { NextResponse, type NextRequest } from "next/server";

/**
 * Canonical URLs have no trailing slash. Legacy WordPress URLs are redirected by
 * next.config.ts (single hop); everything else ending in "/" is normalised here, so
 * each page is reachable at exactly one URL.
 */
export function proxy(request: NextRequest) {
  // Use the raw request URL: NextURL re-applies trailing-slash settings when serialised.
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url.toString(), 308);
  }
  return NextResponse.next();
}

export const config = {
  // Skip framework assets, API routes, static files and anything with a file extension.
  matcher: ["/((?!_next/|api/|images/|logos/|.*\\.[a-zA-Z0-9]+$).*)"],
};
