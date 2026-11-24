/**
 * Integration test of the submission + outbox pipeline against a real MongoDB
 * (in-memory replica set, so multi-document transactions are exercised too).
 * Google Sheets and SMTP are replaced with spies — everything else is production code.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const appendRow = vi.fn<(row: string[], opts: { checkExisting: boolean }) => Promise<{ appended: boolean }>>(async () => ({ appended: true }));
const sendEmail = vi.fn<(msg: { to: string; subject: string; messageId: string }) => Promise<void>>(async () => {});

vi.mock("@/lib/google-sheets/client", () => ({ appendRow: (...a: Parameters<typeof appendRow>) => appendRow(...a) }));
vi.mock("@/lib/email/transport", () => ({ sendEmail: (...a: Parameters<typeof sendEmail>) => sendEmail(...a) }));

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  process.env.MONGODB_URI = replSet.getUri();
  process.env.MONGODB_DB_NAME = "npe_test";
  process.env.EMAIL_TO_PRIMARY = "primary@organiser.example";
  process.env.EMAIL_TO_SECONDARY = "secondary@organiser.example";
  process.env.BROCHURE_LINK_SECRET = "test";
});

afterAll(async () => {
  const { getMongoClient } = await import("@/lib/mongodb/client");
  await (await getMongoClient()).close();
  await replSet?.stop();
});

const exhibitorEnvelope = (key: string, company = "Himalayan Feeds Pvt. Ltd.") => ({
  formType: "exhibitor" as const,
  data: {
    companyName: company,
    contactPerson: "Sita Sharma",
    designation: "Sales Manager",
    phone: "+977 9841234567",
    email: "sita@himalayanfeeds.example",
    country: "Nepal" as const,
    productsServices: "Layer and broiler feed",
    boothSize: "18 sqm" as const,
  },
  recaptchaToken: "x".repeat(40),
  idempotencyKey: key,
  sourcePage: "/register/exhibitor",
});

async function db() {
  const { collections } = await import("@/lib/mongodb/client");
  return collections();
}

beforeEach(async () => {
  appendRow.mockClear();
  sendEmail.mockClear();
  appendRow.mockImplementation(async () => ({ appended: true }));
  sendEmail.mockImplementation(async () => {});
  process.env.EMAIL_TO_SECONDARY = "secondary@organiser.example";
  const { submissions, outbox } = await db();
  await submissions.deleteMany({});
  await outbox.deleteMany({});
});

describe("createSubmission", () => {
  it("stores the submission and four outbox jobs atomically", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const res = await createSubmission(exhibitorEnvelope("key-aaaaaaaaaaaaaaaa"), { ipHash: "h" });
    expect(res.duplicate).toBe(false);
    expect(res.submissionId).toMatch(/^NPE-EXH-\d{6}-[A-Z0-9]{6}$/);

    const { submissions, outbox } = await db();
    const doc = await submissions.findOne({ submissionId: res.submissionId });
    expect(doc?.status).toBe("received");
    expect(doc?.data.companyName).toBe("Himalayan Feeds Pvt. Ltd.");
    const jobs = await outbox.find({ submissionId: res.submissionId }).toArray();
    expect(jobs.map((j) => j.deliveryKey).sort()).toEqual(["adminEmailPrimary", "adminEmailSecondary", "googleSheets", "userConfirmation"]);
    expect(jobs.every((j) => j.status === "pending")).toBe(true);
  });

  it("returns the original submission for a repeated idempotency key", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const first = await createSubmission(exhibitorEnvelope("key-bbbbbbbbbbbbbbbb"), {});
    const again = await createSubmission(exhibitorEnvelope("key-bbbbbbbbbbbbbbbb"), {});
    expect(again).toEqual({ submissionId: first.submissionId, duplicate: true });
    const { submissions, outbox } = await db();
    expect(await submissions.countDocuments()).toBe(1);
    expect(await outbox.countDocuments()).toBe(4);
  });

  it("treats identical content sent again within minutes as a duplicate", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const first = await createSubmission(exhibitorEnvelope("key-cccccccccccccccc"), {});
    const second = await createSubmission(exhibitorEnvelope("key-dddddddddddddddd"), {});
    expect(second.duplicate).toBe(true);
    expect(second.submissionId).toBe(first.submissionId);
    const third = await createSubmission(exhibitorEnvelope("key-eeeeeeeeeeeeeeee", "Another Company"), {});
    expect(third.duplicate).toBe(false);
  });

  it("handles concurrent double-submits with the same key", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const results = await Promise.all([1, 2, 3].map(() => createSubmission(exhibitorEnvelope("key-ffffffffffffffff"), {})));
    expect(new Set(results.map((r) => r.submissionId)).size).toBe(1);
    const { submissions } = await db();
    expect(await submissions.countDocuments()).toBe(1);
  });
});

describe("processOutbox", () => {
  it("delivers Sheets + both admin e-mails + user confirmation exactly once", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const { processOutbox } = await import("@/lib/queue/outbox");
    const { submissionId } = await createSubmission(exhibitorEnvelope("key-gggggggggggggggg"), {});

    // Two workers racing on the same submission must not double-send.
    const [a, b] = await Promise.all([processOutbox({ submissionId }), processOutbox({ submissionId })]);
    expect(a.sent + b.sent).toBe(4);
    expect(appendRow).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(3);
    const recipients = sendEmail.mock.calls.map((c) => c[0].to).sort();
    expect(recipients).toEqual(["primary@organiser.example", "secondary@organiser.example", "sita@himalayanfeeds.example"]);

    const { submissions } = await db();
    const doc = await submissions.findOne({ submissionId });
    expect(doc?.status).toBe("completed");
    expect(doc?.delivery).toEqual({ googleSheets: "sent", adminEmailPrimary: "sent", adminEmailSecondary: "sent", userConfirmation: "sent" });
  });

  it("retries a temporary failure with backoff and checks for an existing row", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const { processOutbox } = await import("@/lib/queue/outbox");
    const { submissionId } = await createSubmission(exhibitorEnvelope("key-hhhhhhhhhhhhhhhh"), {});
    appendRow.mockImplementationOnce(async () => {
      throw new Error("Google Sheets API 503: backend error");
    });

    const first = await processOutbox({ submissionId });
    expect(first.retried).toBe(1);
    const { outbox, submissions } = await db();
    const job = await outbox.findOne({ jobKey: `${submissionId}:googleSheets` });
    expect(job?.status).toBe("pending");
    expect(job?.attempts).toBe(1);
    expect(job?.nextRunAt.getTime()).toBeGreaterThan(Date.now());
    expect(job?.lastError).toContain("503");
    expect((await submissions.findOne({ submissionId }))?.status).toBe("processing");

    // Not due yet → nothing happens.
    expect((await processOutbox({ submissionId })).claimed).toBe(0);

    await outbox.updateOne({ _id: job!._id }, { $set: { nextRunAt: new Date(Date.now() - 1000) } });
    const second = await processOutbox({ submissionId });
    expect(second.sent).toBe(1);
    expect(appendRow).toHaveBeenLastCalledWith(expect.any(Array), { checkExisting: true });
    expect((await submissions.findOne({ submissionId }))?.status).toBe("completed");
  });

  it("keeps jobs pending (without using attempts) while an integration is not configured", async () => {
    delete process.env.EMAIL_TO_SECONDARY;
    const { createSubmission } = await import("@/lib/submissions/create");
    const { processOutbox } = await import("@/lib/queue/outbox");
    const { submissionId } = await createSubmission(exhibitorEnvelope("key-iiiiiiiiiiiiiiii"), {});
    const stats = await processOutbox({ submissionId });
    expect(stats.sent).toBe(3);
    expect(stats.waiting).toBe(1);
    const { outbox } = await db();
    const job = await outbox.findOne({ jobKey: `${submissionId}:adminEmailSecondary` });
    expect(job?.status).toBe("pending");
    expect(job?.attempts).toBe(0);
    expect(job?.lastError).toMatch(/not configured/);
  });

  it("marks a job dead after its last attempt and keeps it for recovery", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const { processOutbox, requeueDeadJobs } = await import("@/lib/queue/outbox");
    const { submissionId } = await createSubmission(exhibitorEnvelope("key-jjjjjjjjjjjjjjjj"), {});
    const { outbox, submissions } = await db();
    await outbox.updateOne({ jobKey: `${submissionId}:userConfirmation` }, { $set: { maxAttempts: 1 } });
    sendEmail.mockImplementation(async (msg) => {
      if (msg.to.startsWith("sita")) throw new Error("550 mailbox unavailable");
    });

    await processOutbox({ submissionId });
    const job = await outbox.findOne({ jobKey: `${submissionId}:userConfirmation` });
    expect(job?.status).toBe("dead");
    const doc = await submissions.findOne({ submissionId });
    expect(doc?.status).toBe("partially_delivered");
    expect(doc?.delivery.userConfirmation).toBe("failed");

    expect(await requeueDeadJobs()).toBe(1);
    expect((await outbox.findOne({ _id: job!._id }))?.status).toBe("pending");
  });

  it("reclaims a job whose worker died mid-delivery (expired lease)", async () => {
    const { createSubmission } = await import("@/lib/submissions/create");
    const { processOutbox } = await import("@/lib/queue/outbox");
    const { submissionId } = await createSubmission(exhibitorEnvelope("key-kkkkkkkkkkkkkkkk"), {});
    const { outbox } = await db();
    await outbox.updateOne(
      { jobKey: `${submissionId}:googleSheets` },
      { $set: { status: "processing", lockedBy: "crashed-worker", lockedUntil: new Date(Date.now() - 5000) }, $inc: { claims: 1 } },
    );
    await processOutbox({ submissionId });
    const job = await outbox.findOne({ jobKey: `${submissionId}:googleSheets` });
    expect(job?.status).toBe("done");
    // A previous claim existed, so the row is checked for before appending.
    expect(appendRow).toHaveBeenCalledWith(expect.any(Array), { checkExisting: true });
  });
});
