import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { collections } from "@/lib/mongodb/client";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError, safeErrorMessage } from "@/lib/errors";
import { appendRow } from "@/lib/google-sheets/client";
import { submissionToRow } from "@/lib/google-sheets/row";
import { adminNotification, userConfirmation } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/transport";
import { brochureLink } from "@/lib/brochure/brochure";
import type { DeliveryKey, JobType, OutboxJobDoc, SubmissionDoc, SubmissionStatus } from "@/types/submission";
const LEASE_MS=120000, MAX_ATTEMPTS=8;
const BACKOFF_MS=[60000,300000,900000,3600000,10800000,21600000,43200000,86400000];
const JOB_DEFS:{key:DeliveryKey;type:JobType}[]=[{key:"googleSheets",type:"sheets.append"},{key:"adminEmailPrimary",type:"email.admin"},{key:"adminEmailSecondary",type:"email.admin"},{key:"userConfirmation",type:"email.user"}];
export function buildJobs(sub:Pick<SubmissionDoc,"submissionId"|"data">,now=new Date()):OutboxJobDoc[]{return JOB_DEFS.map(({key,type})=>({jobKey:`${sub.submissionId}:${key}`,submissionId:sub.submissionId,deliveryKey:key,type,payload:key==="userConfirmation"?{to:String(sub.data.email??"")}:{},status:"pending",attempts:0,claims:0,maxAttempts:MAX_ATTEMPTS,nextRunAt:now,lockedUntil:null,lockedBy:null,lastError:null,createdAt:now,updatedAt:now,completedAt:null}));}
function adminRecipient(key:DeliveryKey):string{const to=key==="adminEmailPrimary"?env.emailToPrimary:env.emailToSecondary;if(!to)throw new IntegrationNotConfiguredError(key==="adminEmailPrimary"?"EMAIL_TO_PRIMARY":"EMAIL_TO_SECONDARY");return to;}
// Protocol-required Message-ID is opaque and stable across retries; never contains the submission ID.
const messageId=(job:OutboxJobDoc)=>`<${createHash("sha256").update(String(job.jobKey)).digest("hex")}@nepalpoultryexpo.com>`;
async function runJob(job:OutboxJobDoc,sub:SubmissionDoc):Promise<"sent"|"skipped">{
 switch(job.type){
 case "sheets.append": await appendRow(submissionToRow(sub),{checkExisting:(job.claims??1)>1});return "sent";
 case "email.admin": await sendEmail({...adminNotification(sub),to:adminRecipient(job.deliveryKey),replyTo:typeof sub.data.email==="string"?sub.data.email:undefined,messageId:messageId(job)});return "sent";
 case "email.user": {const to=job.payload.to;if(!to)return "skipped";const brochureUrl=sub.formType==="brochure"?await brochureLink(sub.submissionId,{absolute:true}):null;await sendEmail({...userConfirmation(sub,{brochureUrl}),to,messageId:messageId(job)});return "sent";}
 }
}
export type OutboxRunStats={claimed:number;sent:number;retried:number;waiting:number;dead:number};
export async function processOutbox({limit=25,submissionId,workerId=`w-${randomUUID()}`}:{limit?:number;submissionId?:string;workerId?:string}={}):Promise<OutboxRunStats>{
 const {outbox,submissions}=await collections();const stats:OutboxRunStats={claimed:0,sent:0,retried:0,waiting:0,dead:0};
 const touched=new Set<string>();let remaining=Math.max(0,Math.min(50,limit));
 // Parallel independent jobs, bounded batch. Stop claiming after the first wave for immediate requests.
 const deadline=Date.now()+(submissionId?1000:20000);
 async function worker(){while(remaining>0 && Date.now()<deadline){remaining--;const now=new Date();const owner=`${workerId}-${randomUUID()}`;
 const job=await outbox.findOneAndUpdate({...(submissionId?{submissionId}:{}),$or:[{status:"pending",nextRunAt:{$lte:now}},{status:"processing",lockedUntil:{$lt:now}}]},{$set:{status:"processing",lockedBy:owner,lockedUntil:new Date(now.getTime()+LEASE_MS),updatedAt:now},$inc:{claims:1}},{sort:{nextRunAt:1},returnDocument:"after"});
 if(!job)return;stats.claimed++;touched.add(job.submissionId);const owned={_id:job._id,lockedBy:owner,status:"processing" as const};
 const sub=await submissions.findOne({submissionId:job.submissionId});
 if(!sub){await outbox.updateOne(owned,{$set:{status:"dead",lastError:"Submission not found",lockedUntil:null,lockedBy:null,updatedAt:new Date()}});stats.dead++;continue;}
 let result:"sent"|"skipped";
 try{result=await runJob(job,sub);}catch(err){const failedAt=new Date();const missing=err instanceof IntegrationNotConfiguredError;const attempts=job.attempts+1;const dead=missing?failedAt.getTime()-job.createdAt.getTime()>14*86400000:attempts>=job.maxAttempts;
 const update=await outbox.updateOne(owned,{$set:{status:dead?"dead":"pending",nextRunAt:new Date(failedAt.getTime()+(missing?900000:BACKOFF_MS[Math.min(attempts-1,BACKOFF_MS.length-1)])),lockedUntil:null,lockedBy:null,lastError:safeErrorMessage(err),updatedAt:failedAt},$inc:{attempts:missing?0:1}});
 if(update.modifiedCount){if(dead){stats.dead++;await submissions.updateOne({submissionId:sub.submissionId},{$set:{[`delivery.${job.deliveryKey}`]:"failed"}});}else if(missing)stats.waiting++;else stats.retried++;}continue;}
 const finished=new Date();const update=await outbox.updateOne(owned,{$set:{status:"done",completedAt:finished,lockedUntil:null,lockedBy:null,lastError:null,updatedAt:finished},$inc:{attempts:1}});
 if(update.modifiedCount){stats.sent++;await submissions.updateOne({submissionId:sub.submissionId},{$set:{[`delivery.${job.deliveryKey}`]:result,updatedAt:finished}});}
 }}
 const settled=await Promise.allSettled(Array.from({length:Math.min(4,remaining)},()=>worker()));
 for(const id of touched){const jobs=await outbox.find({submissionId:id},{projection:{status:1}}).toArray();const done=jobs.filter(j=>j.status==="done").length,dead=jobs.filter(j=>j.status==="dead").length;let status:SubmissionStatus="processing";if(jobs.length===JOB_DEFS.length&&done+dead===jobs.length)status=dead===0?"completed":done===0?"delivery_failed":"partially_delivered";await submissions.updateOne({submissionId:id},{$set:{status,updatedAt:new Date()}});}
 const failure=settled.find(r=>r.status==="rejected");if(failure?.status==="rejected")throw failure.reason;return stats;
}
export async function requeueDeadJobs():Promise<number>{const {outbox}=await collections();const res=await outbox.updateMany({status:"dead"},{$set:{status:"pending",attempts:0,nextRunAt:new Date(),lastError:null,lockedBy:null,lockedUntil:null,updatedAt:new Date()}});return res.modifiedCount;}
export async function outboxSummary(){const {outbox}=await collections();const rows=await outbox.aggregate<{_id:string;count:number}>([{$group:{_id:"$status",count:{$sum:1}}}]).toArray();return Object.fromEntries(rows.map(r=>[r._id,r.count]));}
