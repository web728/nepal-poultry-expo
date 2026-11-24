#!/usr/bin/env node
/**
 * Local MongoDB (single-node replica set, so transactions work) for development and
 * end-to-end testing without an Atlas cluster. Data is kept in .dev-mongo-data/ so
 * test submissions survive restarts; delete that folder to start fresh.
 *
 *   npm run dev:db      → MONGODB_URI=mongodb://127.0.0.1:27117/?replicaSet=rs0 in .env.local
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const port = Number(process.env.DEV_MONGO_PORT || 27117);
const dbPath = path.resolve(import.meta.dirname, "..", ".dev-mongo-data");
mkdirSync(dbPath, { recursive: true });

const replSet = await MongoMemoryReplSet.create({
  replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ port, ip: "127.0.0.1", dbPath }],
});

console.log(`[dev-mongo] ready: mongodb://127.0.0.1:${port}/?replicaSet=rs0 (data: ${dbPath})`);

const stop = async () => {
  await replSet.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
