import "server-only";
import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";
import type { OutboxJobDoc, RateLimitDoc, SubmissionDoc } from "@/types/submission";
type MongoCache = {client?:MongoClient;promise?:Promise<MongoClient>;indexes?:Promise<void>};
const g=globalThis as typeof globalThis & {__npeMongo?:MongoCache};
const cache=g.__npeMongo??={};
export class DatabaseNotConfiguredError extends Error {constructor(){super("MONGODB_URI is not configured");this.name="DatabaseNotConfiguredError";}}
export async function getMongoClient():Promise<MongoClient>{
  if(cache.client)return cache.client;
  const uri=env.mongoUri;if(!uri)throw new DatabaseNotConfiguredError();
  if(!cache.promise){const client=new MongoClient(uri,{maxPoolSize:10,minPoolSize:0,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000,retryWrites:true,appName:"nepal-poultry-expo-web"});
    cache.promise=client.connect().then(c=>{cache.client=c;return c;}).catch(async err=>{cache.promise=undefined;await client.close().catch(()=>{});throw err;});}
  return cache.promise;
}
export const COLLECTIONS={submissions:"submissions",outbox:"outbox_jobs",rateLimits:"rate_limits"} as const;
export async function getDb():Promise<Db>{
  const db=(await getMongoClient()).db(env.mongoDbName);
  cache.indexes??=ensureIndexes(db).catch(err=>{cache.indexes=undefined;throw err;});
  await cache.indexes;return db;
}
export async function collections(){const db=await getDb();return {db,submissions:db.collection<SubmissionDoc>(COLLECTIONS.submissions),outbox:db.collection<OutboxJobDoc>(COLLECTIONS.outbox),rateLimits:db.collection<RateLimitDoc>(COLLECTIONS.rateLimits)};}
async function ensureIndexes(db:Db){await Promise.all([
 db.collection("submission_keys").createIndex({expiresAt:1},{expireAfterSeconds:0,name:"ttl_expiresAt"}),
 db.collection("submission_dedupe_locks").createIndex({touchedAt:1},{expireAfterSeconds:86400,name:"ttl_touchedAt"}),
 db.collection(COLLECTIONS.submissions).createIndexes([{key:{submissionId:1},name:"submissionId_unique",unique:true},{key:{idempotencyKey:1},name:"idempotencyKey_unique",unique:true},{key:{dedupeHash:1,createdAt:-1},name:"dedupe_lookup"},{key:{formType:1,createdAt:-1},name:"formType_createdAt"},{key:{status:1,createdAt:-1},name:"status_createdAt"}]),
 db.collection(COLLECTIONS.outbox).createIndexes([{key:{jobKey:1},name:"jobKey_unique",unique:true},{key:{status:1,nextRunAt:1},name:"status_nextRunAt"},{key:{submissionId:1},name:"submissionId"},{key:{status:1,lockedUntil:1},name:"status_lockedUntil"}]),
 db.collection(COLLECTIONS.rateLimits).createIndexes([{key:{expiresAt:1},name:"ttl_expiresAt",expireAfterSeconds:0}])]);}
