export class IntegrationNotConfiguredError extends Error {constructor(integration:string){super(`${integration} is not configured`);this.name="IntegrationNotConfiguredError";}}
// Avoid persisting provider responses which may contain credentials or personal data.
export function safeErrorMessage(error:unknown):string {
  if(error instanceof IntegrationNotConfiguredError)return error.message;
  if(error instanceof Error){const name=/^[A-Za-z][A-Za-z0-9_]{0,60}$/.test(error.name)?error.name:"Error";const code=(error as Error & {code?:unknown}).code;return typeof code==="number"?`${name} (${code})`:name;}
  return "Unknown error";
}
