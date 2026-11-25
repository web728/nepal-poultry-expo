import "server-only";
import {MongoServerError} from "mongodb";
import {collections} from "@/lib/mongodb/client";
export async function rateLimit(key:string,{limit,windowSeconds}:{limit:number;windowSeconds:number}):Promise<{allowed:boolean;retryAfterSeconds:number}>{
  const now=Date.now(), windowMs=windowSeconds*1000;
  const bucket=Math.floor(now/windowMs), expiresAt=new Date((bucket+1)*windowMs);
  const _id=`${key}:${bucket}`;
  const {rateLimits}=await collections();
  let doc;
  try {doc=await rateLimits.findOneAndUpdate({_id},{$inc:{count:1},$setOnInsert:{expiresAt}},{upsert:true,returnDocument:"after"});}
  catch(err){if(!(err instanceof MongoServerError&&err.code===11000))throw err;doc=await rateLimits.findOneAndUpdate({_id},{$inc:{count:1}},{returnDocument:"after"});}
  if(!doc)throw new Error("Rate limiter unavailable");
  return {allowed:doc.count<=limit,retryAfterSeconds:Math.max(1,Math.ceil((expiresAt.getTime()-now)/1000))};
}
