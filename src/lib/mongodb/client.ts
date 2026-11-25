import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";
import type { OutboxJobDoc, RateLimitDoc, SubmissionDoc } from "@/types/submission";
type MongoScope = { client?: MongoClient; promise?: Promise<MongoClient>; indexes?: Promise<void> };
const scopes = new AsyncLocalStorage<MongoScope>();
// Only a boolean is shared across requests. Never share a connected client or a pending I/O promise.
let indexesReady = false;
function scope(): MongoScope {
  const current = scopes.getStore();
  if (!current) throw new Error("MongoDB request scope missing");
  return current;
}
export function logMongo(stage: string, err: unknown) {
  const e = err as { name?: unknown; code?: unknown; codeName?: unknown; message?: unknown; cause?: { name?: unknown; code?: unknown; message?: unknown } } | null;
  const safe = (v: unknown) => typeof v === "number" ? v : typeof v === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(v) ? v : undefined;
  const message = String(e?.message ?? "") + " " + String(e?.cause?.message ?? "");
  const hint = /different request|different I\/O context/i.test(message) ? "cross_request_io" : /not implemented|not supported/i.test(message) ? "runtime_unsupported" : /authentication failed|bad auth/i.test(message) ? "authentication" : /timed out|timeout/i.test(message) ? "timeout" : /index.*conflict|already exists with/i.test(message) ? "index_conflict" : undefined;
  console.error(`[npe-db-v3] ${JSON.stringify({stage,name:safe(e?.name),code:safe(e?.code),codeName:safe(e?.codeName),causeName:safe(e?.cause?.name),causeCode:safe(e?.cause?.code),hint})}`);
}
export async function withMongoScope<T>(fn: () => Promise<T>): Promise<T> {
  const state: MongoScope = {};
  return scopes.run(state, async () => {
    try { return await fn(); }
    finally {
      // Close only the client opened by this invocation, including failed connections.
      if (state.client) await state.client.close().catch(err => logMongo("close", err));
    }
  });
}
export class DatabaseNotConfiguredError extends Error {constructor(){super("MONGODB_URI is not configured");this.name="DatabaseNotConfiguredError";}}
export async function getMongoClient():Promise<MongoClient>{
  const cache = scope();
  if(cache.client)return cache.client;
  const uri=env.mongoUri;if(!uri)throw new DatabaseNotConfiguredError();
  if(!cache.promise){const client=new MongoClient(uri,{maxPoolSize:4,minPoolSize:0,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000,retryWrites:true,appName:"nepal-poultry-expo-web"});
    cache.promise=client.connect().then(c=>{cache.client=c;return c;}).catch(async err=>{logMongo("connect",err);cache.promise=undefined;await client.close().catch(()=>{});throw err;});}
  return cache.promise;
}
export const COLLECTIONS={submissions:"submissions",outbox:"outbox_jobs",rateLimits:"rate_limits"} as const;
export async function getDb():Promise<Db>{
  const cache = scope();
  const db=(await getMongoClient()).db(env.mongoDbName);
  if (!indexesReady) {
    cache.indexes ??= ensureIndexes(db).then(() => { indexesReady = true; }).catch(err => { logMongo("ensure-indexes",err); cache.indexes=undefined; throw err; });
    await cache.indexes;
  }
  return db;
}
export async function collections(){const db=await getDb();return {db,submissions:db.collection<SubmissionDoc>(COLLECTIONS.submissions),outbox:db.collection<OutboxJobDoc>(COLLECTIONS.outbox),rateLimits:db.collection<RateLimitDoc>(COLLECTIONS.rateLimits)};}
async function ensureIndexes(db:Db){await Promise.all([
 db.collection("submission_keys").createIndex({expiresAt:1},{expireAfterSeconds:0,name:"ttl_expiresAt"}),
 db.collection("submission_dedupe_locks").createIndex({touchedAt:1},{expireAfterSeconds:86400,name:"ttl_touchedAt"}),
 db.collection(COLLECTIONS.submissions).createIndexes([{key:{submissionId:1},name:"submissionId_unique",unique:true},{key:{idempotencyKey:1},name:"idempotencyKey_unique",unique:true},{key:{dedupeHash:1,createdAt:-1},name:"dedupe_lookup"},{key:{formType:1,createdAt:-1},name:"formType_createdAt"},{key:{status:1,createdAt:-1},name:"status_createdAt"}]),
 db.collection(COLLECTIONS.outbox).createIndexes([{key:{jobKey:1},name:"jobKey_unique",unique:true},{key:{status:1,nextRunAt:1},name:"status_nextRunAt"},{key:{submissionId:1},name:"submissionId"},{key:{status:1,lockedUntil:1},name:"status_lockedUntil"}]),
 db.collection(COLLECTIONS.rateLimits).createIndexes([{key:{expiresAt:1},name:"ttl_expiresAt",expireAfterSeconds:0}])]);}
