import { withMongoScope, logMongo } from "@/lib/mongodb/client";
import type { NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/security/request";
import { outboxSummary, processOutbox } from "@/lib/queue/outbox";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request.headers)) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers });
  try {
    return await withMongoScope(async () => {
      const stats = await processOutbox({ limit: 50 });
      const queue = await outboxSummary();
      return Response.json({ ok: true, stats, queue }, { headers });
    });
  } catch (err) {
    logMongo("cron-outbox", err);
    return Response.json({ ok: false, error: "Outbox processing failed" }, { status: 500, headers });
  }
}
export const GET = handle;
export const POST = handle;
