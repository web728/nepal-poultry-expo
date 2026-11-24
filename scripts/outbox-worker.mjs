#!/usr/bin/env node
/**
 * Outbox worker for VPS / container deployments (run under PM2 next to `next start`).
 *
 * Every OUTBOX_INTERVAL_SECONDS (default 30) it calls the protected sweep endpoint
 * /api/cron/outbox, which delivers every due Google Sheets / e-mail job stored in
 * MongoDB. Calling the endpoint (instead of duplicating the delivery code here) keeps
 * one implementation of the outbox logic.
 *
 *   OUTBOX_WORKER_URL=http://127.0.0.1:3000 CRON_SECRET=... node scripts/outbox-worker.mjs
 */
const base = (process.env.OUTBOX_WORKER_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
const secret = process.env.CRON_SECRET;
const intervalMs = Math.max(10, Number(process.env.OUTBOX_INTERVAL_SECONDS || 30)) * 1000;

if (!secret) {
  console.error("[outbox-worker] CRON_SECRET is not set — refusing to start.");
  process.exit(1);
}

let running = false;
let stopping = false;

async function tick() {
  if (running || stopping) return;
  running = true;
  try {
    const res = await fetch(`${base}/api/cron/outbox`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(55_000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`[outbox-worker] sweep failed: HTTP ${res.status}`, body?.error ?? "");
    } else if (body.stats?.claimed) {
      console.log(`[outbox-worker] ${new Date().toISOString()}`, JSON.stringify(body.stats), "queue:", JSON.stringify(body.queue));
    }
  } catch (err) {
    console.error("[outbox-worker] sweep error:", err instanceof Error ? err.message : err);
  } finally {
    running = false;
  }
}

console.log(`[outbox-worker] polling ${base}/api/cron/outbox every ${intervalMs / 1000}s`);
const timer = setInterval(tick, intervalMs);
tick();

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopping = true;
    clearInterval(timer);
    console.log(`[outbox-worker] ${signal} received, stopping.`);
    const wait = setInterval(() => {
      if (!running) {
        clearInterval(wait);
        process.exit(0);
      }
    }, 200);
  });
}
