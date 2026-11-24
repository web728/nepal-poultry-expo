import "server-only";
import { randomBytes } from "node:crypto";
import { MongoServerError } from "mongodb";
import { collections, getMongoClient } from "@/lib/mongodb/client";
import { buildJobs } from "@/lib/queue/outbox";
import { sha256 } from "@/lib/security/request";
import { FORM_CODES } from "@/data/form-options";
import type { SubmissionEnvelope } from "@/lib/validation/schemas";
import type { SubmissionDoc } from "@/types/submission";

/** Identical content from the same form within this window is treated as a double submit. */
const DEDUPE_WINDOW_MS = 10 * 60_000;

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

export function newSubmissionId(formType: SubmissionEnvelope["formType"], now = new Date()): string {
  const d = now.toISOString(); // YYYY-MM-DD…
  const ymd = `${d.slice(2, 4)}${d.slice(5, 7)}${d.slice(8, 10)}`;
  const bytes = randomBytes(6);
  const rand = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `NPE-${FORM_CODES[formType]}-${ymd}-${rand}`;
}

/** Stable hash of the submitted content, independent of key order and letter case. */
export function contentHash(formType: string, data: Record<string, unknown>): string {
  const normalised = Object.keys(data)
    .sort()
    .map((k) => `${k}=${String(data[k] ?? "").toLowerCase().replace(/\s+/g, " ").trim()}`)
    .join("|");
  return sha256(`${formType}|${normalised}`);
}

export type CreateResult = { submissionId: string; duplicate: boolean };

function isDuplicateKey(err: unknown): boolean {
  return err instanceof MongoServerError && err.code === 11000;
}

function transactionsUnsupported(err: unknown): boolean {
  // 20 = IllegalOperation ("Transaction numbers are only allowed on a replica set member or mongos")
  return err instanceof MongoServerError && (err.code === 20 || /replica set|Transaction numbers/i.test(err.message));
}

/**
 * Persists a validated submission together with its outbox jobs.
 * Returns only after both are durably written, so the caller can acknowledge the user.
 */
export async function createSubmission(
  envelope: SubmissionEnvelope,
  meta: SubmissionDoc["meta"],
): Promise<CreateResult> {
  const { submissions, outbox } = await collections();
  const data = envelope.data as Record<string, unknown>;

  // 1. Same idempotency key (retry / double click) → same submission.
  const sameKey = await submissions.findOne({ idempotencyKey: envelope.idempotencyKey }, { projection: { submissionId: 1 } });
  if (sameKey) return { submissionId: sameKey.submissionId, duplicate: true };

  // 2. Same content submitted again within a few minutes → same submission.
  const dedupeHash = contentHash(envelope.formType, data);
  const recent = await submissions.findOne(
    { dedupeHash, createdAt: { $gte: new Date(Date.now() - DEDUPE_WINDOW_MS) } },
    { projection: { submissionId: 1 } },
  );
  if (recent) return { submissionId: recent.submissionId, duplicate: true };

  const now = new Date();
  const doc: SubmissionDoc = {
    submissionId: newSubmissionId(envelope.formType, now),
    formType: envelope.formType,
    data,
    sourcePage: envelope.sourcePage,
    status: "received",
    delivery: { googleSheets: "pending", adminEmailPrimary: "pending", adminEmailSecondary: "pending", userConfirmation: "pending" },
    idempotencyKey: envelope.idempotencyKey,
    dedupeHash,
    meta,
    createdAt: now,
    updatedAt: now,
  };
  const jobs = buildJobs(doc, now);

  const client = await getMongoClient();
  const session = client.startSession();
  try {
    // 3. Submission + jobs commit atomically (MongoDB Atlas is always a replica set).
    await session.withTransaction(async () => {
      await submissions.insertOne(doc, { session });
      await outbox.insertMany(jobs, { session, ordered: true });
    });
  } catch (err) {
    if (isDuplicateKey(err)) {
      const existing = await submissions.findOne({ idempotencyKey: envelope.idempotencyKey }, { projection: { submissionId: 1 } });
      if (existing) return { submissionId: existing.submissionId, duplicate: true };
    }
    if (!transactionsUnsupported(err)) throw err;

    // Standalone MongoDB (local development only): write sequentially, undo on failure.
    await submissions.insertOne(doc);
    try {
      await outbox.insertMany(jobs, { ordered: true });
    } catch (jobErr) {
      await submissions.deleteOne({ submissionId: doc.submissionId });
      await outbox.deleteMany({ submissionId: doc.submissionId });
      throw jobErr;
    }
  } finally {
    await session.endSession();
  }

  return { submissionId: doc.submissionId, duplicate: false };
}
