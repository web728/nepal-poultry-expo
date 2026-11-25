import type { ObjectId } from "mongodb";
import type { FormType } from "@/data/form-options";
export type SubmissionStatus = "received" | "processing" | "completed" | "partially_delivered" | "delivery_failed";
export type DeliveryState = "pending" | "sent" | "failed" | "skipped";
export type JobType = "sheets.append" | "email.admin" | "email.user";
export type JobStatus = "pending" | "processing" | "done" | "dead";
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
  meta: { ipHash?: string; userAgent?: string; recaptchaHostname?: string };
  createdAt: Date;
  updatedAt: Date;
}
export interface OutboxJobDoc {
  _id?: ObjectId;
  jobKey: string;
  submissionId: string;
  deliveryKey: DeliveryKey;
  type: JobType;
  payload: { to?: string };
  status: JobStatus;
  attempts: number;
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
export interface RateLimitDoc { _id: string; count: number; expiresAt: Date; }
export type SubmitResponse = { ok: true; formType: FormType; duplicate?: boolean; brochureUrl?: string | null } | { ok: false; error: string; code: "validation" | "otp" | "captcha" | "rate_limited" | "spam" | "unavailable" | "server_error"; fieldErrors?: Record<string,string> };
