import "server-only";
import { createSign } from "node:crypto";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError } from "@/lib/errors";
import { SHEET_HEADERS } from "@/lib/submissions/fields";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const API = "https://sheets.googleapis.com/v4/spreadsheets";
// Final 16-column schema; reject legacy headers until migrated.
export const CLEAN_HEADERS = [...SHEET_HEADERS];
type ServiceAccount = {client_email:string;private_key:string};
let cached: {token:string; expiresAt:number} | undefined;
let pending: Promise<string> | undefined;
async function refreshToken(): Promise<string> {
  const b64=env.googleServiceAccountBase64;
  if (!b64 || !env.googleSheetId) throw new IntegrationNotConfiguredError("Google Sheets");
  const sa=JSON.parse(Buffer.from(b64,"base64").toString("utf8")) as ServiceAccount;
  if (!sa.client_email || !sa.private_key) throw new Error("Invalid Google service account configuration");
  const uri="https://oauth2.googleapis.com/token";
  const now=Math.floor(Date.now()/1000);
  const encode=(obj:object)=>Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned=`${encode({alg:"RS256",typ:"JWT"})}.${encode({iss:sa.client_email,scope:SCOPE,aud:uri,iat:now,exp:now+3600})}`;
  const signature=createSign("RSA-SHA256").update(unsigned).sign(sa.private_key.replace(/\\n/g,"\n"),"base64url");
  const res=await fetch(uri,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:`${unsigned}.${signature}`}),cache:"no-store",signal:AbortSignal.timeout(8000)});
  if (!res.ok) throw new Error(`Google token request failed (${res.status})`);
  const json=await res.json() as {access_token:string;expires_in:number};
  if (!json.access_token) throw new Error("Google token missing");
  cached={token:json.access_token,expiresAt:Date.now()+json.expires_in*1000};
  return cached.token;
}
async function accessToken():Promise<string> {
  if(cached && cached.expiresAt-60000>Date.now()) return cached.token;
  return pending ??= refreshToken().finally(()=>{pending=undefined;});
}
async function sheetsFetch(path:string,init?:RequestInit):Promise<unknown> {
  const token=await accessToken();
  const res=await fetch(`${API}/${encodeURIComponent(env.googleSheetId!)}${path}`,{...init,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},cache:"no-store",signal:AbortSignal.timeout(10000)});
  if(res.status===401) cached=undefined;
  if(!res.ok) throw new Error(`Google Sheets API ${res.status}`);
  return res.json();
}
const tabRange=(range:string)=>encodeURIComponent(`'${env.googleSheetTab.replace(/'/g,"''")}'!${range}`);
async function ensureHeaderRow(){
  if(CLEAN_HEADERS.length!==16) throw new Error("Expected 16 clean sheet columns");
  const result=await sheetsFetch(`/values/${tabRange("1:1")}`) as {values?:string[][]};
  const existing=result.values?.[0]??[];
  if(!existing.length){await sheetsFetch(`/values/${tabRange("A1:P1")}?valueInputOption=RAW`,{method:"PUT",body:JSON.stringify({values:[CLEAN_HEADERS]})});return;}
  if(existing.length!==CLEAN_HEADERS.length || existing.some((v,i)=>v!==CLEAN_HEADERS[i])) throw new Error("Sheet header mismatch: migrate the old reference column before retrying");
}
export async function rowExists(row:readonly string[]):Promise<boolean>{
  const res=await sheetsFetch(`/values/${tabRange("A2:P")}?valueRenderOption=UNFORMATTED_VALUE`) as {values?:unknown[][]};
  return (res.values??[]).some(r=>row.every((v,i)=>String(r[i]??"")===v));
}
export async function appendRow(row:string[],{checkExisting}:{checkExisting:boolean}){
  if(row.length!==16) throw new Error("Unexpected sheet row length");
  await ensureHeaderRow();
  if(checkExisting && await rowExists(row)) return {appended:false as const};
  await sheetsFetch(`/values/${tabRange("A1:P")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,{method:"POST",body:JSON.stringify({values:[row]})});
  return {appended:true as const};
}
