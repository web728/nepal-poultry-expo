import "server-only";
import { randomInt } from "node:crypto";
import { MongoServerError } from "mongodb";
import { collections, getMongoClient } from "@/lib/mongodb/client";
import { buildJobs } from "@/lib/queue/outbox";
import { sha256 } from "@/lib/security/request";
import { FORM_CODES } from "@/data/form-options";
import type { SubmissionEnvelope } from "@/lib/validation/schemas";
import type { SubmissionDoc } from "@/types/submission";
const DEDUPE_WINDOW_MS = 600_000;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function newSubmissionId(formType: SubmissionEnvelope["formType"], now = new Date()): string {
  const date = now.toISOString().slice(2,10).replace(/-/g, "");
  const random = Array.from({length:6}, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `NPE-${FORM_CODES[formType]}-${date}-${random}`;
}
export function contentHash(formType: string, data: Record<string,unknown>): string {
  return sha256(JSON.stringify([formType,Object.keys(data).sort().map(k=>[k,String(data[k]??"").toLowerCase().replace(/\s+/g," ").trim()])]));
}
export type CreateResult = { submissionId: string; duplicate: boolean };
export class SubmissionKeyConflict extends Error { constructor(){super("Submission key is already associated with different data");this.name="SubmissionKeyConflict";} }
export async function createSubmission(envelope: SubmissionEnvelope, meta: SubmissionDoc["meta"]): Promise<CreateResult> {
  const {db, submissions, outbox}=await collections();
  const data: Record<string,unknown> = envelope.data;
  const hash=contentHash(envelope.formType,data);
  const exact=sha256(JSON.stringify([envelope.formType,Object.keys(data).sort().map(k=>[k,data[k]])]));
  const now=new Date();
  const keys=db.collection<{_id:string; submissionId:string; fingerprint:string; expiresAt:Date}>("submission_keys");
  const locks=db.collection<{_id:string; touchedAt:Date}>("submission_dedupe_locks");
  const client=await getMongoClient();
  for(let retry=0;retry<4;retry++) {
    const session=client.startSession();
    try {
      return await session.withTransaction(async()=>{
        const prior=await keys.findOne({_id:envelope.idempotencyKey},{session});
        if(prior){if(prior.fingerprint!==exact)throw new SubmissionKeyConflict();return {submissionId:prior.submissionId,duplicate:true};}
        const old=await submissions.findOne({idempotencyKey:envelope.idempotencyKey},{session});
        if(old){if(sha256(JSON.stringify([old.formType,Object.keys(old.data).sort().map(k=>[k,old.data[k]])]))!==exact)throw new SubmissionKeyConflict();return {submissionId:old.submissionId,duplicate:true};}
        // Serialize concurrent identical-content submissions within the transaction.
        await locks.updateOne({_id:hash},{$set:{touchedAt:now}},{upsert:true,session});
        const recent=await submissions.findOne({dedupeHash:hash,createdAt:{$gte:new Date(now.getTime()-DEDUPE_WINDOW_MS)}},{session,projection:{submissionId:1}});
        const submissionId=recent?.submissionId??newSubmissionId(envelope.formType,now);
        if(!recent){
          const doc:SubmissionDoc={submissionId,formType:envelope.formType,data,sourcePage:envelope.sourcePage,status:"received",delivery:{googleSheets:"pending",adminEmailPrimary:"pending",adminEmailSecondary:"pending",userConfirmation:"pending"},idempotencyKey:envelope.idempotencyKey,dedupeHash:hash,meta,createdAt:now,updatedAt:now};
          await submissions.insertOne(doc,{session});
          await outbox.insertMany(buildJobs(doc,now),{session,ordered:true});
        }
        await keys.insertOne({_id:envelope.idempotencyKey,submissionId,fingerprint:exact,expiresAt:new Date(now.getTime()+7*86400000)},{session});
        return {submissionId,duplicate:Boolean(recent)};
      },{readConcern:{level:"snapshot"},writeConcern:{w:"majority"},maxCommitTimeMS:5000});
    } catch(err){if(!(err instanceof MongoServerError && err.code===11000 && retry<3))throw err;}
    finally{await session.endSession();}
  }
  throw new Error("Could not save submission");
}
