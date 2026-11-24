import type { ObjectId } from "mongodb";
import type { FormType } from "@/data/form-options";

export type SubmissionStatus = "received" | "processing" | "completed" | "partially_delivered" | "delivery_failed";

export type DeliveryState = "pending" | "sent" | "failed" | "skipped";

export type JobType = "sheets.append" | "email.admin" | "email.user";

export type JobStatus = "pending" | "processing" | "done" | "dead";

/** Keys under SubmissionDoc.delivery — one per integration job. */
export type DeliveryKey = "googleSheets" | "adminEmailPrimary" | "adminEmailSecondary" | "userConfirmation";

export interface SubmissionDoc {
  _id?: ObjectId;
  submissionId: string;
  formType: FormType;
  data: Record<string, unknown>;
  sourcePage: string;
  status: SubmissionStatus;
  delivery: Partial<Record<DeliveryKey, DeliveryState>>;
  idempotencyKey: string;
  dedupeHash: string;
  meta: {
    ipHash?: string;
    userAgent?: string;
    recaptchaHostname?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OutboxJobDoc {
  _id?: ObjectId;
  /** `${submissionId}:${deliveryKey}` — unique, prevents a job being queued twice. */
  jobKey: string;
  submissionId: string;
  deliveryKey: DeliveryKey;
  type: JobType;
  payload: { to?: string };
  status: JobStatus;
  /** Completed attempts (success or failure). */
  attempts: number;
  /** Times the job has been claimed by a worker, including claims whose lease expired. */
  claims?: number;
  maxAttempts: number;
  nextRunAt: Date;
  lockedUntil?: Date | null;
  lockedBy?: string | null;
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

export type SubmitResponse =
  | {
      ok: true;
      submissionId: string;
      formType: FormType;
      duplicate?: boolean;
      /** Only for brochure requests, and only when a brochure file is available. */
      brochureUrl?: string | null;
    }
  | {
      ok: false;
      error: string;
      code: "validation" | "captcha" | "rate_limited" | "spam" | "unavailable" | "server_error";
      fieldErrors?: Record<string, string>;
    };
