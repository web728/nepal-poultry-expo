import type { NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/security/request";
import { outboxSummary, processOutbox } from "@/lib/queue/outbox";
import { safeErrorMessage } from "@/lib/errors";

export const maxDuration = 60;

/**
 * Outbox sweep. Called by Vercel Cron (GET, `Authorization: Bearer $CRON_SECRET`) or by
 * the PM2 worker on a VPS (`npm run worker`). Processes every due job, including jobs
 * whose immediate attempt failed or never ran.
 */
async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request.headers)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const stats = await processOutbox({ limit: 50 });
    const queue = await outboxSummary();
    return Response.json({ ok: true, stats, queue }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(`[cron/outbox] ${safeErrorMessage(err)}`);
    return Response.json({ ok: false, error: "Outbox processing failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
