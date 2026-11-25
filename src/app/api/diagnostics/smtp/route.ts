import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { probeSmtp } from "@/lib/email/smtp-client";
import { smtpConfig } from "@/lib/email/transport";
import { safeErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * Diagnostic: opens a TLS socket to smtp.gmail.com:465 via cloudflare:sockets, runs EHLO + AUTH + QUIT.
 * Sends no mail. Protected by CRON_SECRET: call with `Authorization: Bearer <CRON_SECRET>`.
 * Delete this route once e-mail delivery is confirmed.
 */
export async function GET(req: Request) {
  const secret = env.cronSecret;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const res = await probeSmtp(smtpConfig());
    return NextResponse.json({ ...res, host: "smtp.gmail.com", port: 465 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: safeErrorMessage(err) }, { status: 502 });
  }
}