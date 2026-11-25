import "server-only";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError } from "@/lib/errors";
import type { EmailContent } from "@/lib/email/templates";
import { sendSmtp, type SmtpConfig } from "@/lib/email/smtp-client";

/**
 * Gmail SMTP over Cloudflare's native TCP sockets (see smtp-client.ts).
 * Nodemailer is intentionally not used: its node:net/node:tls transport fails inside Workers.
 * Credentials come from Cloudflare secrets/vars via `env` (GMAIL_USER, GMAIL_APP_PASSWORD).
 */

export function smtpConfig(): SmtpConfig {
  const user = env.gmailUser;
  const pass = env.gmailAppPassword;
  if (!user || !pass) throw new IntegrationNotConfiguredError("Gmail SMTP");
  return { host: "smtp.gmail.com", port: 465, user, pass, timeoutMs: 15_000 };
}

export async function sendEmail(
  message: EmailContent & { to: string; replyTo?: string; messageId: string },
): Promise<void> {
  const cfg = smtpConfig();
  await sendSmtp(cfg, {
    from: { name: env.emailFromName, address: cfg.user },
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
    // Deterministic Message-ID: a retried send of the same job carries the same ID.
    messageId: message.messageId,
    headers: { "X-Entity-Ref-ID": message.messageId },
  });
}