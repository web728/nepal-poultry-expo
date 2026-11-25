import "server-only";
import { env } from "@/lib/env";
import { IntegrationNotConfiguredError } from "@/lib/errors";
import type { EmailContent } from "@/lib/email/templates";
import { sendSmtp, type SmtpConfig } from "@/lib/email/smtp-client";

export function smtpConfig(): SmtpConfig {
  const user = env.gmailUser;
  const pass = env.gmailAppPassword;
  if (!user || !pass) throw new IntegrationNotConfiguredError("Gmail SMTP");
  return { host: "smtp.gmail.com", port: 465, user, pass: pass.replace(/\s/g, ""), timeoutMs: 8000 };
}
export async function sendEmail(message: EmailContent & { to: string; replyTo?: string; messageId: string }): Promise<void> {
  const cfg = smtpConfig();
  await sendSmtp(cfg, { from: { name: env.emailFromName, address: cfg.user }, to: message.to,
    replyTo: message.replyTo, subject: message.subject, text: message.text, html: message.html, messageId: message.messageId });
}
