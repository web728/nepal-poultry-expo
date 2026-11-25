import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { MongoServerError, type Db, type ClientSession } from "mongodb";
import { getDb } from "@/lib/mongodb/client";
import { env } from "@/lib/env";
import { hmac } from "@/lib/security/request";
import { sendEmail } from "@/lib/email/transport";
import { brochureOtpEmail } from "@/lib/email/templates";

const OTP_MS = 300_000;
const SESSION_MS = 900_000;
const RESEND_MS = 60_000;
const MAX_ATTEMPTS = 5;
export class OtpError extends Error {
  constructor(message: string, public status = 400) { super(message); this.name = "OtpError"; }
}
type Verification = {
  _id: string; challenge: string; codeHash?: string; attempts: number;
  resendAt: Date; expiresAt: Date; status: "sending" | "pending" | "verified" | "consumed";
  tokenHash?: string; consumedBy?: string; fingerprint?: string;
};
function digest(value: string) {
  if (!env.otpSecret || env.otpSecret.length < 32) throw new OtpError("Email verification is temporarily unavailable.", 503);
  return hmac(value, env.otpSecret);
}
export const emailKey = (email: string) => digest(`email:${email}`);
let otpIndexReady = false;
const store = (db: Db) => db.collection<Verification>("email_verifications");
export async function issueOtp(email: string) {
  const db = await getDb();
  const col = store(db);
  if (!otpIndexReady) {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expiresAt" });
    otpIndexReady = true;
  }
  const _id = emailKey(email);
  const challenge = randomBytes(24).toString("hex");
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = Date.now();
  try {
    await col.updateOne({ _id, resendAt: { $lte: new Date(now) } }, {
      $set: { challenge, codeHash: digest(`code:${_id}:${challenge}:${code}`), attempts: 0, status: "sending", resendAt: new Date(now + RESEND_MS), expiresAt: new Date(now + OTP_MS) },
      $unset: { tokenHash: "", consumedBy: "", fingerprint: "" },
    }, { upsert: true });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) throw new OtpError("Please wait 60 seconds before requesting another code.", 429);
    throw err;
  }
  try {
    await sendEmail({ ...brochureOtpEmail(code), to: email, messageId: `<${randomBytes(24).toString("hex")}@nepalpoultryexpo.com>` });
  } catch {
    // An SMTP failure may be ambiguous. Preserve the cooldown; never claim delivery.
    throw new OtpError("We could not confirm that the code was sent. Please try again in 60 seconds.", 503);
  }
  const sent = await col.updateOne({ _id, challenge, status: "sending" }, { $set: { status: "pending", expiresAt: new Date(Date.now() + OTP_MS), resendAt: new Date(Date.now() + RESEND_MS) } });
  if (!sent.matchedCount) throw new OtpError("Please request a new code.");
  return { challenge, retryAfterSeconds: 60, expiresInSeconds: 300 };
}
export async function verifyOtp(email: string, challenge: string, code: string) {
  const col = store(await getDb());
  const _id = emailKey(email);
  const codeHash = digest(`code:${_id}:${challenge}:${code}`);
  const token = randomBytes(32).toString("hex");
  const filter = { _id, challenge, status: "pending" as const, expiresAt: { $gt: new Date() }, attempts: { $lt: MAX_ATTEMPTS } };
  const verified = await col.updateOne({ ...filter, codeHash }, { $set: { status: "verified", tokenHash: digest(`token:${token}`), expiresAt: new Date(Date.now() + SESSION_MS) }, $unset: { codeHash: "" } });
  if (verified.matchedCount) return { verificationToken: token, expiresInSeconds: 900 };
  const wrong = await col.findOneAndUpdate({ ...filter, codeHash: { $ne: codeHash } }, { $inc: { attempts: 1 } }, { returnDocument: "after" });
  if (wrong && wrong.attempts < MAX_ATTEMPTS) throw new OtpError(`Incorrect code. ${MAX_ATTEMPTS - wrong.attempts} attempts remaining.`);
  throw new OtpError("Code expired or too many attempts. Request a new code.");
}
export async function consumeBrochureVerification(db: Db, session: ClientSession, email: string, token: string, key: string, fingerprint: string) {
  const col = store(db);
  const filter = { _id: emailKey(email), tokenHash: digest(`token:${token}`), expiresAt: { $gt: new Date() } };
  const consumed = await col.updateOne({ ...filter, status: "verified" }, { $set: { status: "consumed", consumedBy: key, fingerprint } }, { session });
  if (consumed.matchedCount) return;
  // A network retry of the exact same submission may reuse its own consumed token.
  const prior = await col.findOne({ ...filter, status: "consumed", consumedBy: key, fingerprint }, { session, projection: { _id: 1 } });
  if (!prior) throw new OtpError("Email verification expired or was already used. Please verify again.");
}
