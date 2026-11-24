#!/usr/bin/env node
/**
 * Outbox maintenance from the command line (reads MONGODB_URI / MONGODB_DB_NAME).
 *
 *   node --env-file=.env.local scripts/outbox-admin.mjs status       # job counts + recent failures
 *   node --env-file=.env.local scripts/outbox-admin.mjs retry-dead   # re-queue failed ("dead") jobs
 */
import { MongoClient } from "mongodb";

const [command = "status"] = process.argv.slice(2);
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Tip: node --env-file=.env.local scripts/outbox-admin.mjs status");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME || "nepal_poultry_expo");
const outbox = db.collection("outbox_jobs");

try {
  if (command === "status") {
    const counts = await outbox.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();
    console.log("Outbox jobs by status:");
    for (const c of counts) console.log(`  ${c._id.padEnd(10)} ${c.count}`);
    const failing = await outbox
      .find({ $or: [{ status: "dead" }, { lastError: { $ne: null }, status: "pending" }] })
      .sort({ updatedAt: -1 })
      .limit(15)
      .project({ jobKey: 1, status: 1, attempts: 1, lastError: 1, nextRunAt: 1 })
      .toArray();
    if (failing.length) {
      console.log("\nRecent problems:");
      for (const j of failing) console.log(`  [${j.status}] ${j.jobKey} attempts=${j.attempts} next=${j.nextRunAt?.toISOString?.()} — ${j.lastError}`);
    }
  } else if (command === "retry-dead") {
    const res = await outbox.updateMany(
      { status: "dead" },
      { $set: { status: "pending", attempts: 0, nextRunAt: new Date(), lastError: null, updatedAt: new Date() } },
    );
    console.log(`Re-queued ${res.modifiedCount} job(s). They will be delivered on the next worker / cron sweep.`);
  } else {
    console.error(`Unknown command "${command}". Use "status" or "retry-dead".`);
    process.exitCode = 1;
  }
} finally {
  await client.close();
}
