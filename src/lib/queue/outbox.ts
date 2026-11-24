import "server-only";
import { randomUUID } from "node:crypto";
import type { Collection } from "mongodb";
import { collections } from "@/lib/mongodb/client";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError, safeErrorMessage } from "@/lib/errors";
import { appendRow } from "@/lib/google-sheets/client";
import { submissionToRow } from "@/lib/google-sheets/row";
import { adminNotification, userConfirmation } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/transport";
import { brochureLink } from "@/lib/brochure/brochure";
import type {
  DeliveryKey,
  JobType,
  OutboxJobDoc,
  SubmissionDoc,
  SubmissionStatus,
} from "@/types/submission";

/**
 * Durable MongoDB outbox.
 *
 * A submission and its integration jobs are written together before the API answers.
 * Jobs are then processed (a) right after the response via `after()`, and (b) by the
 * cron / worker sweep for anything still pending — so nothing depends on a
 * fire-and-forget promise surviving the end of a serverless request.
 *
 * Each job is claimed atomically with a short lease (`lockedUntil`), so two workers can
 * never send the same e-mail or append the same row at the same time. Failures are
 * retried with exponential backoff; after `maxAttempts` the job is marked `dead` and
 * kept for manual recovery (`npm run outbox:retry-dead`).
 */

const LEASE_MS = 90_000;
const MAX_ATTEMPTS = 8;
const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 3 * 3600_000, 6 * 3600_000, 12 * 3600_000, 24 * 3600_000];
/** Jobs waiting on missing credentials are re-checked on this interval… */
const NOT_CONFIGURED_DELAY_MS = 15 * 60_000;
/** …and given up after this long. */
const NOT_CONFIGURED_GIVE_UP_MS = 14 * 24 * 3600_000;

const JOB_DEFS: { key: DeliveryKey; type: JobType }[] = [
  { key: "googleSheets", type: "sheets.append" },
  { key: "adminEmailPrimary", type: "email.admin" },
  { key: "adminEmailSecondary", type: "email.admin" },
  { key: "userConfirmation", type: "email.user" },
];

export function buildJobs(sub: Pick<SubmissionDoc, "submissionId" | "data">, now = new Date()): OutboxJobDoc[] {
  return JOB_DEFS.map(({ key, type }) => ({
    jobKey: `${sub.submissionId}:${key}`,
    submissionId: sub.submissionId,
    deliveryKey: key,
    type,
    payload: key === "userConfirmation" ? { to: String(sub.data.email ?? "") } : {},
    status: "pending",
    attempts: 0,
    claims: 0,
    maxAttempts: MAX_ATTEMPTS,
    nextRunAt: now,
    lockedUntil: null,
    lockedBy: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }));
}

function adminRecipient(key: DeliveryKey): string {
  const to = key === "adminEmailPrimary" ? env.emailToPrimary : env.emailToSecondary;
  if (!to) throw new IntegrationNotConfiguredError(key === "adminEmailPrimary" ? "EMAIL_TO_PRIMARY" : "EMAIL_TO_SECONDARY");
  return to;
}

const messageId = (job: OutboxJobDoc) => `<${job.submissionId}.${job.deliveryKey}@nepalpoultryexpo.com>`;

async function runJob(job: OutboxJobDoc, sub: SubmissionDoc): Promise<"sent" | "skipped"> {
  switch (job.type) {
    case "sheets.append": {
      // Any earlier claim may have appended the row before failing — look before writing again.
      await appendRow(submissionToRow(sub), { checkExisting: (job.claims ?? 1) > 1 });
      return "sent";
    }
    case "email.admin": {
      const content = adminNotification(sub);
      await sendEmail({
        ...content,
        to: adminRecipient(job.deliveryKey),
        replyTo: typeof sub.data.email === "string" ? sub.data.email : undefined,
        messageId: messageId(job),
      });
      return "sent";
    }
    case "email.user": {
      const to = job.payload.to;
      if (!to) return "skipped";
      const brochureUrl = sub.formType === "brochure" ? await brochureLink(sub.submissionId, { absolute: true }) : null;
      await sendEmail({ ...userConfirmation(sub, { brochureUrl }), to, messageId: messageId(job) });
      return "sent";
    }
  }
}

async function refreshSubmissionStatus(
  submissionId: string,
  outbox: Collection<OutboxJobDoc>,
  submissions: Collection<SubmissionDoc>,
) {
  const jobs = await outbox.find({ submissionId }, { projection: { status: 1 } }).toArray();
  const done = jobs.filter((j) => j.status === "done").length;
  const dead = jobs.filter((j) => j.status === "dead").length;
  let status: SubmissionStatus = "processing";
  if (done + dead === jobs.length) status = dead === 0 ? "completed" : done === 0 ? "delivery_failed" : "partially_delivered";
  await submissions.updateOne({ submissionId }, { $set: { status, updatedAt: new Date() } });
}

export type OutboxRunStats = { claimed: number; sent: number; retried: number; waiting: number; dead: number };

/**
 * Claims and processes due jobs. Pass `submissionId` to work only on one submission
 * (used straight after a form is accepted).
 */
export async function processOutbox({
  limit = 25,
  submissionId,
  workerId = `w-${randomUUID().slice(0, 8)}`,
}: { limit?: number; submissionId?: string; workerId?: string } = {}): Promise<OutboxRunStats> {
  const { outbox, submissions } = await collections();
  const stats: OutboxRunStats = { claimed: 0, sent: 0, retried: 0, waiting: 0, dead: 0 };
  const touched = new Set<string>();

  for (let i = 0; i < limit; i++) {
    const now = new Date();
    const job = await outbox.findOneAndUpdate(
      {
        ...(submissionId ? { submissionId } : {}),
        $or: [
          { status: "pending", nextRunAt: { $lte: now } },
          { status: "processing", lockedUntil: { $lt: now } }, // lease expired (crashed worker)
        ],
      },
      {
        $set: { status: "processing", lockedBy: workerId, lockedUntil: new Date(now.getTime() + LEASE_MS), updatedAt: now },
        $inc: { claims: 1 },
      },
      { sort: { nextRunAt: 1 }, returnDocument: "after" },
    );
    if (!job) break;
    stats.claimed++;
    touched.add(job.submissionId);

    const sub = await submissions.findOne({ submissionId: job.submissionId });
    const owned = { _id: job._id, lockedBy: workerId };

    if (!sub) {
      await outbox.updateOne(owned, {
        $set: { status: "dead", lastError: "Submission not found", lockedUntil: null, updatedAt: new Date() },
      });
      stats.dead++;
      continue;
    }

    try {
      const result = await runJob(job, sub);
      const finished = new Date();
      await outbox.updateOne(owned, {
        $set: { status: "done", completedAt: finished, lockedUntil: null, lastError: null, updatedAt: finished },
        $inc: { attempts: 1 },
      });
      await submissions.updateOne(
        { submissionId: sub.submissionId },
        { $set: { [`delivery.${job.deliveryKey}`]: result, updatedAt: finished } },
      );
      stats.sent++;
    } catch (err) {
      const failedAt = new Date();
      const message = safeErrorMessage(err);

      if (err instanceof IntegrationNotConfiguredError) {
        const giveUp = failedAt.getTime() - job.createdAt.getTime() > NOT_CONFIGURED_GIVE_UP_MS;
        await outbox.updateOne(owned, {
          $set: {
            status: giveUp ? "dead" : "pending",
            nextRunAt: new Date(failedAt.getTime() + NOT_CONFIGURED_DELAY_MS),
            lockedUntil: null,
            lastError: message,
            updatedAt: failedAt,
          },
        });
        if (giveUp) {
          await submissions.updateOne({ submissionId: sub.submissionId }, { $set: { [`delivery.${job.deliveryKey}`]: "failed" } });
          stats.dead++;
        } else {
          stats.waiting++;
        }
        continue;
      }

      const attempts = job.attempts + 1;
      const exhausted = attempts >= job.maxAttempts;
      await outbox.updateOne(owned, {
        $set: {
          status: exhausted ? "dead" : "pending",
          nextRunAt: new Date(failedAt.getTime() + BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)]),
          lockedUntil: null,
          lastError: message,
          updatedAt: failedAt,
        },
        $inc: { attempts: 1 },
      });
      if (exhausted) {
        await submissions.updateOne({ submissionId: sub.submissionId }, { $set: { [`delivery.${job.deliveryKey}`]: "failed" } });
        stats.dead++;
      } else {
        stats.retried++;
      }
      console.error(`[outbox] ${job.jobKey} attempt ${attempts} failed: ${message}`);
    }
  }

  for (const id of touched) await refreshSubmissionStatus(id, outbox, submissions);
  return stats;
}

/** Puts dead jobs back in the queue (manual recovery after fixing credentials). */
export async function requeueDeadJobs(): Promise<number> {
  const { outbox } = await collections();
  const res = await outbox.updateMany(
    { status: "dead" },
    { $set: { status: "pending", attempts: 0, nextRunAt: new Date(), lastError: null, updatedAt: new Date() } },
  );
  return res.modifiedCount;
}

export async function outboxSummary() {
  const { outbox } = await collections();
  const rows = await outbox.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();
  return Object.fromEntries(rows.map((r) => [r._id, r.count]));
}
