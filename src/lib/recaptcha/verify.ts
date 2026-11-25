import "server-only";
import { env } from "@/lib/env";
import { SITE_URL } from "@/config/site";
const VERIFY_URL="https://www.google.com/recaptcha/api/siteverify";
export type RecaptchaResult={ok:true;hostname?:string}|{ok:false;reason:"not_configured"|"invalid"|"expired"|"unreachable";codes?:string[]};
export async function verifyRecaptcha(token:string,remoteIp?:string):Promise<RecaptchaResult>{
 const secret=env.recaptchaSecret;if(!secret)return {ok:false,reason:"not_configured"};
 const body=new URLSearchParams({secret,response:token});if(remoteIp)body.set("remoteip",remoteIp);
 try{const res=await fetch(VERIFY_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,cache:"no-store",signal:AbortSignal.timeout(6000)});
 if(!res.ok)return {ok:false,reason:"unreachable"};
 const data=await res.json() as {success?:boolean;hostname?:string;"error-codes"?:string[]};
 const hosts=new Set([new URL(SITE_URL).hostname.toLowerCase(),...env.recaptchaAllowedHostnames].map(h=>h.replace(/^www\./,"")));
 const actual=data.hostname?.toLowerCase().replace(/^www\./,"");
 if(data.success)return actual!==undefined&&hosts.has(actual)?{ok:true,hostname:data.hostname}:{ok:false,reason:"invalid"};
 const codes=data["error-codes"]??[];
 if(codes.includes("invalid-input-secret")||codes.includes("missing-input-secret"))return {ok:false,reason:"not_configured",codes};
 return {ok:false,reason:codes.includes("timeout-or-duplicate")?"expired":"invalid",codes};
 }catch{return {ok:false,reason:"unreachable"};}
}
