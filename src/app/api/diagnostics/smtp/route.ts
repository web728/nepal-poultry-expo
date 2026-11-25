import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { probeSmtp } from "@/lib/email/smtp-client";
import { smtpConfig } from "@/lib/email/transport";
import { isAuthorizedCron } from "@/lib/security/request";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
// Diagnostic only. Remove after confirming SMTP delivery.
export async function GET(req: Request) {
  if (!env.cronSecret || !isAuthorizedCron(req.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  try {
    const res = await probeSmtp(smtpConfig());
    // Do not expose SMTP server transcripts or credentials.
    const ok = typeof res === "object" && res !== null && "ok" in res ? res.ok === true : true;
    return NextResponse.json({ ok, host: "smtp.gmail.com", port: 465 }, { status: ok ? 200 : 502, headers });
  } catch {
    console.error("[smtp] Connection or authentication probe failed");
    return NextResponse.json({ ok: false, error: "SMTP probe failed" }, { status: 502, headers });
  }
}
