import "server-only";
import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import {isIP} from "node:net";
import {env} from "@/lib/env";
export function getClientIp(headers:Headers):string|undefined {
  // Production assumes the app is reachable only through Cloudflare's trusted ingress.
  const candidate=headers.get("cf-connecting-ip")?.trim() || (!env.isProduction ? headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() : undefined);
  return candidate && isIP(candidate) ? candidate : undefined;
}
export function hashIp(ip:string|undefined):string|undefined {if(!ip)return undefined;const salt=env.ipHashSalt;if(!salt)throw new Error("IP hash secret not configured");return createHmac("sha256",salt).update(ip).digest("hex").slice(0,32);}
export function sha256(value:string):string{return createHash("sha256").update(value).digest("hex");}
export function hmac(value:string,secret:string):string{return createHmac("sha256",secret).update(value).digest("base64url");}
export function safeEqual(a:string,b:string):boolean{const ab=Buffer.from(a),bb=Buffer.from(b);return ab.length===bb.length&&timingSafeEqual(ab,bb);}
export function isAuthorizedCron(headers:Headers):boolean{const secret=env.cronSecret;return Boolean(secret&&safeEqual(headers.get("authorization")??"",`Bearer ${secret}`));}
