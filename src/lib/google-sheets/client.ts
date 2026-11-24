import "server-only";
import { createSign } from "node:crypto";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError } from "@/lib/errors";
import { SHEET_HEADERS } from "@/lib/submissions/fields";

/**
 * Minimal Google Sheets v4 client using a service account (JWT bearer flow), with no
 * extra dependencies. The Base64 service-account JSON is decoded on the server only.
 */

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const API = "https://sheets.googleapis.com/v4/spreadsheets";

const tokenCache = globalThis as typeof globalThis & {
  __npeSheetsToken?: { token: string; expiresAt: number };
  __npeSheetsHeaderChecked?: string;
};

function serviceAccount(): ServiceAccount {
  const b64 = env.googleServiceAccountBase64;
  if (!b64 || !env.googleSheetId) throw new IntegrationNotConfiguredError("Google Sheets");
  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_BASE64 is not valid Base64-encoded JSON");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service account JSON is missing client_email or private_key");
  }
  return { ...parsed, private_key: parsed.private_key.replace(/\\n/g, "\n") };
}

async function accessToken(): Promise<string> {
  const cached = tokenCache.__npeSheetsToken;
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token;

  const sa = serviceAccount();
  const tokenUri = sa.token_uri ?? "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: sa.client_email,
    scope: SCOPE,
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Google token request failed (${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache.__npeSheetsToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function sheetsFetch(path: string, init?: RequestInit) {
  const token = await accessToken();
  const res = await fetch(`${API}/${env.googleSheetId}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    // Google error bodies contain no credentials; keep only status + message.
    let message = res.statusText;
    try {
      message = ((await res.json()) as { error?: { message?: string } }).error?.message ?? message;
    } catch {}
    throw new Error(`Google Sheets API ${res.status}: ${message}`);
  }
  return res.json();
}

const tabRange = (range: string) => encodeURIComponent(`'${env.googleSheetTab.replace(/'/g, "''")}'!${range}`);

/** Writes the header row once if the tab's first row is empty. */
async function ensureHeaderRow() {
  const key = `${env.googleSheetId}:${env.googleSheetTab}`;
  if (tokenCache.__npeSheetsHeaderChecked === key) return;
  const res = (await sheetsFetch(`/values/${tabRange("1:1")}`)) as { values?: string[][] };
  if (!res.values?.[0]?.length) {
    await sheetsFetch(`/values/${tabRange("A1")}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [SHEET_HEADERS] }),
    });
  }
  tokenCache.__npeSheetsHeaderChecked = key;
}

/** True if a row for this submission ID already exists (column A) — used on retries. */
export async function rowExists(submissionId: string): Promise<boolean> {
  const res = (await sheetsFetch(`/values/${tabRange("A:A")}?majorDimension=COLUMNS`)) as { values?: string[][] };
  return (res.values?.[0] ?? []).includes(submissionId);
}

/**
 * Appends one row. `checkExisting` is set on retries so a row written by an attempt that
 * later failed to record its success is never duplicated.
 */
export async function appendRow(row: string[], { checkExisting }: { checkExisting: boolean }) {
  await ensureHeaderRow();
  if (checkExisting && (await rowExists(row[0]))) return { appended: false as const };
  await sheetsFetch(`/values/${tabRange("A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [row] }),
  });
  return { appended: true as const };
}
