import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError } from "@/lib/errors";
import type { EmailContent } from "@/lib/email/templates";

const g = globalThis as typeof globalThis & { __npeMailer?: { key: string; transporter: Transporter } };

function transporter(): Transporter {
  const user = env.gmailUser;
  const pass = env.gmailAppPassword;
  if (!user || !pass) throw new IntegrationNotConfiguredError("Gmail SMTP");
  const key = `${user}`;
  if (g.__npeMailer?.key === key) return g.__npeMailer.transporter;
  const t = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  g.__npeMailer = { key, transporter: t };
  return t;
}

export async function sendEmail(
  message: EmailContent & { to: string; replyTo?: string; messageId: string },
): Promise<void> {
  const from = env.gmailUser!;
  await transporter().sendMail({
    from: { name: env.emailFromName, address: from },
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
    // Deterministic Message-ID: a retried send of the same job carries the same ID.
    messageId: message.messageId,
    headers: { "X-Entity-Ref-ID": message.messageId },
  });
}
