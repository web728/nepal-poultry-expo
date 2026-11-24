import "server-only";
import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";
import type { OutboxJobDoc, RateLimitDoc, SubmissionDoc } from "@/types/submission";

type MongoCache = {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
  indexes?: Promise<void>;
};

// Re-use one client per process (and across hot reloads in development).
const globalForMongo = globalThis as typeof globalThis & { __npeMongo?: MongoCache };
const cache: MongoCache = (globalForMongo.__npeMongo ??= {});

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;
  const uri = env.mongoUri;
  if (!uri) throw new DatabaseNotConfiguredError();
  cache.promise ??= new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    retryWrites: true,
    appName: "nepal-poultry-expo-web",
  })
    .connect()
    .then((client) => {
      cache.client = client;
      return client;
    })
    .catch((err) => {
      cache.promise = undefined;
      throw err;
    });
  return cache.promise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const db = client.db(env.mongoDbName);
  cache.indexes ??= ensureIndexes(db).catch((err) => {
    cache.indexes = undefined;
    console.error("[mongodb] index creation failed:", err instanceof Error ? err.message : err);
  });
  await cache.indexes;
  return db;
}

export const COLLECTIONS = {
  submissions: "submissions",
  outbox: "outbox_jobs",
  rateLimits: "rate_limits",
} as const;

export async function collections() {
  const db = await getDb();
  return {
    db,
    submissions: db.collection<SubmissionDoc>(COLLECTIONS.submissions),
    outbox: db.collection<OutboxJobDoc>(COLLECTIONS.outbox),
    rateLimits: db.collection<RateLimitDoc>(COLLECTIONS.rateLimits),
  };
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection(COLLECTIONS.submissions).createIndexes([
      { key: { submissionId: 1 }, name: "submissionId_unique", unique: true },
      { key: { idempotencyKey: 1 }, name: "idempotencyKey_unique", unique: true },
      { key: { dedupeHash: 1, createdAt: -1 }, name: "dedupe_lookup" },
      { key: { formType: 1, createdAt: -1 }, name: "formType_createdAt" },
      { key: { status: 1, createdAt: -1 }, name: "status_createdAt" },
    ]),
    db.collection(COLLECTIONS.outbox).createIndexes([
      { key: { jobKey: 1 }, name: "jobKey_unique", unique: true },
      { key: { status: 1, nextRunAt: 1 }, name: "status_nextRunAt" },
      { key: { submissionId: 1 }, name: "submissionId" },
    ]),
    db.collection(COLLECTIONS.rateLimits).createIndexes([
      { key: { expiresAt: 1 }, name: "ttl_expiresAt", expireAfterSeconds: 0 },
    ]),
  ]);
}
