/**
 * E-mail templates. Table-based, inline-styled HTML that renders consistently in
 * Gmail, Outlook and Apple Mail, plus a plain-text alternative for every message.
 * All user-supplied values are HTML-escaped.
 */
import { FORM_LABELS, type FormType } from "@/data/form-options";
import { SITE_URL, siteConfig } from "@/config/site";
import { FIELD_LABELS, companyName, formatValue, personName } from "@/lib/submissions/fields";

const C = {
  ink: "#18181b",
  inkSoft: "#34343a",
  muted: "#66666e",
  line: "#e7e7e4",
  sand: "#f4f4f2",
  brand: "#e32b1b",
  brandDark: "#c8231a",
  flame: "#ff5e21",
  white: "#ffffff",
};

const FONT = "Poppins, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const nl2br = (s: string) => escapeHtml(s).replace(/\n/g, "<br>");

export const formatNepalTime = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d) + " (NPT)";

export type EmailContent = { subject: string; html: string; text: string };

type SubmissionLike = {
  submissionId: string;
  formType: FormType;
  data: Record<string, unknown>;
  sourcePage: string;
  createdAt: Date;
};

function button(href: string, label: string, variant: "solid" | "outline" = "solid") {
  const solid = variant === "solid";
  return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:600;line-height:1;text-decoration:none;border-radius:6px;${
    solid ? `background:${C.brandDark};color:${C.white};border:1px solid ${C.brandDark};` : `background:${C.white};color:${C.ink};border:1px solid ${C.ink};`
  }">${escapeHtml(label)}</a>`;
}

function layout({ preheader, body }: { preheader: string; body: string }) {
  const { venue } = siteConfig.event;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(siteConfig.name)}</title>
</head>
<body style="margin:0;padding:0;background:${C.sand};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.sand};">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.white};border:1px solid ${C.line};">
    <tr><td style="background:${C.ink};padding:22px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="middle"><img src="${SITE_URL}${siteConfig.logo.white}" width="98" height="70" alt="${escapeHtml(siteConfig.name)}" style="display:block;border:0;outline:none;"></td>
        <td valign="middle" align="right" style="font-family:${FONT};font-size:12px;line-height:1.5;letter-spacing:1px;text-transform:uppercase;color:#b6b6bd;">${escapeHtml(siteConfig.event.datesLabel)}<br><strong style="color:${C.white};">${escapeHtml(siteConfig.event.venue.shortName)}, ${escapeHtml(siteConfig.event.venue.city)}</strong></td>
      </tr></table>
    </td></tr>
    <tr><td style="height:5px;line-height:5px;font-size:0;background:${C.brand};background-image:linear-gradient(90deg,${C.brand},${C.flame});">&nbsp;</td></tr>
    ${body}
    <tr><td style="padding:24px 32px;background:${C.ink};font-family:${FONT};font-size:12px;line-height:1.6;color:#b6b6bd;">
      <strong style="color:${C.white};font-size:13px;">${escapeHtml(siteConfig.name)} ${siteConfig.edition}</strong><br>
      ${escapeHtml(siteConfig.event.datesLabel)} &middot; ${escapeHtml(venue.name)}, ${escapeHtml(venue.city)}, ${escapeHtml(venue.country)}<br>
      Organised by ${siteConfig.organisers.map((o) => escapeHtml(o.name)).join(" &amp; ")}<br>
      ${siteConfig.contacts.map((c) => `${escapeHtml(c.name)} &middot; ${escapeHtml(c.phone)} &middot; <a href="mailto:${escapeHtml(c.email)}" style="color:#ffffff;text-decoration:none;">${escapeHtml(c.email)}</a>`).join("<br>")}<br>
      <a href="${SITE_URL}" style="color:${C.flame};text-decoration:none;">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function detailsTable(sub: SubmissionLike) {
  const rows = FIELD_LABELS[sub.formType]
    .map(([key, label]) => {
      const raw = formatValue(sub.data[key]);
      const value = key === "consent" && sub.data[key] === true ? "Agreed to the privacy policy" : raw;
      const isEmail = key === "email" && raw !== "—";
      const valueHtml = isEmail
        ? `<a href="mailto:${escapeHtml(raw)}" style="color:${C.brandDark};text-decoration:none;">${escapeHtml(raw)}</a>`
        : nl2br(value);
      return `<tr>
        <td valign="top" style="padding:11px 14px 11px 0;width:38%;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:13px;color:${C.muted};">${escapeHtml(label)}</td>
        <td valign="top" style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;color:${C.ink};font-weight:500;">${valueHtml}</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">${rows}</table>`;
}

function detailsText(sub: SubmissionLike) {
  return FIELD_LABELS[sub.formType]
    .map(([key, label]) => `${label}: ${formatValue(sub.data[key])}`)
    .join("\n");
}

/** Notification to the organising team (sent to both configured recipients). */
export function adminNotification(sub: SubmissionLike): EmailContent {
  const label = FORM_LABELS[sub.formType];
  const name = personName(sub.data);
  const company = companyName(sub.data);
  const email = String(sub.data.email ?? "");
  const phoneDigits = String(sub.data.phone ?? "").replace(/\D/g, "");
  const received = formatNepalTime(sub.createdAt);
  const sourceUrl = `${SITE_URL}${sub.sourcePage}`;

  const body = `
    <tr><td style="padding:30px 32px 8px;font-family:${FONT};">
      <div style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:${C.brandDark};">${escapeHtml(label)}</div>
      <h1 style="margin:8px 0 6px;font-size:22px;line-height:1.3;color:${C.ink};font-weight:700;">${escapeHtml(company || name)}</h1>
      <div style="font-size:14px;color:${C.inkSoft};">${escapeHtml(name)}${company && name ? ` &middot; ${escapeHtml(company)}` : ""}</div>
    </td></tr>
    <tr><td style="padding:16px 32px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.sand};">
        <tr>
          <td style="padding:12px 14px;font-family:${FONT};font-size:12px;color:${C.muted};">Submission ID<br><strong style="font-size:14px;color:${C.ink};letter-spacing:0.3px;">${escapeHtml(sub.submissionId)}</strong></td>
          <td style="padding:12px 14px;font-family:${FONT};font-size:12px;color:${C.muted};">Received<br><strong style="font-size:14px;color:${C.ink};">${escapeHtml(received)}</strong></td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 32px 8px;">${detailsTable(sub)}</td></tr>
    <tr><td style="padding:8px 32px 4px;font-family:${FONT};font-size:12px;color:${C.muted};">Submitted from <a href="${escapeHtml(sourceUrl)}" style="color:${C.inkSoft};">${escapeHtml(sub.sourcePage)}</a></td></tr>
    <tr><td style="padding:20px 32px 32px;">
      ${email ? button(`mailto:${email}?subject=${encodeURIComponent(`Re: your ${label.toLowerCase()} (${sub.submissionId})`)}`, `Reply to ${name || "sender"}`) : ""}
      ${phoneDigits ? `&nbsp; ${button(`https://wa.me/${phoneDigits}`, "WhatsApp", "outline")}` : ""}
    </td></tr>`;

  return {
    subject: `[${label}] ${company || name} — ${sub.submissionId}`,
    html: layout({ preheader: `${label} from ${name}${company ? `, ${company}` : ""}`, body }),
    text: [
      `${label} — ${siteConfig.name}`,
      "",
      `Submission ID: ${sub.submissionId}`,
      `Received: ${received}`,
      `Source page: ${sourceUrl}`,
      "",
      detailsText(sub),
    ].join("\n"),
  };
}

const NEXT_STEPS: Record<FormType, string> = {
  exhibitor:
    "Our exhibitor team will review your details and contact you about stand availability, space options and participation terms.",
  visitor:
    `Your visitor registration has been recorded. We look forward to welcoming you on ${siteConfig.event.datesLabel} at ${siteConfig.event.venue.name}, ${siteConfig.event.venue.city}, and will e-mail you visitor information before the show.`,
  contact: "A member of the organising team will read your message and reply to you by e-mail or phone.",
  brochure: "Thank you for your interest in exhibiting or visiting. Our team may follow up to help with any questions.",
};

/** Confirmation to the person who submitted the form. */
export function userConfirmation(sub: SubmissionLike, opts: { brochureUrl?: string | null } = {}): EmailContent {
  const label = FORM_LABELS[sub.formType];
  const first = personName(sub.data).split(" ")[0] || "there";
  const lower = label.toLowerCase();

  const brochureBlock =
    sub.formType === "brochure"
      ? opts.brochureUrl
        ? `<tr><td style="padding:4px 32px 8px;">${button(opts.brochureUrl, "Download the brochure")}
             <p style="margin:10px 0 0;font-family:${FONT};font-size:12px;color:${C.muted};">This personal link stays active for 7 days.</p></td></tr>`
        : `<tr><td style="padding:4px 32px 8px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.inkSoft};">The brochure for the upcoming edition is being finalised — we will e-mail it to you as soon as it is published.</td></tr>`
      : "";

  const body = `
    <tr><td style="padding:32px 32px 6px;font-family:${FONT};">
      <div style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:${C.brandDark};">${escapeHtml(label)} received</div>
      <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:${C.ink};font-weight:700;">Thank you, ${escapeHtml(first)}.</h1>
    </td></tr>
    <tr><td style="padding:12px 32px 8px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.inkSoft};">
      We have received your ${escapeHtml(lower)} for the ${escapeHtml(siteConfig.name)}. ${escapeHtml(NEXT_STEPS[sub.formType])}
    </td></tr>
    ${brochureBlock}
    <tr><td style="padding:16px 32px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.sand};"><tr>
        <td style="padding:12px 14px;font-family:${FONT};font-size:12px;color:${C.muted};">Your reference<br><strong style="font-size:14px;color:${C.ink};letter-spacing:0.3px;">${escapeHtml(sub.submissionId)}</strong></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:18px 32px 4px;font-family:${FONT};font-size:13px;font-weight:600;color:${C.ink};">What you sent us</td></tr>
    <tr><td style="padding:6px 32px 24px;">${detailsTable(sub)}</td></tr>
    <tr><td style="padding:0 32px 32px;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">
      If any of these details are wrong, simply reply to this e-mail. You are receiving this message because this address was entered on ${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}.
    </td></tr>`;

  const textBrochure =
    sub.formType === "brochure"
      ? opts.brochureUrl
        ? `\nDownload the brochure (link active for 7 days):\n${opts.brochureUrl}\n`
        : "\nThe brochure for the upcoming edition is being finalised — we will e-mail it to you as soon as it is published.\n"
      : "";

  return {
    subject: `We've received your ${lower} — ${siteConfig.shortName}`,
    html: layout({ preheader: `Reference ${sub.submissionId}. ${NEXT_STEPS[sub.formType]}`, body }),
    text: [
      `Thank you, ${first}.`,
      "",
      `We have received your ${lower} for the ${siteConfig.name}. ${NEXT_STEPS[sub.formType]}`,
      textBrochure,
      `Your reference: ${sub.submissionId}`,
      "",
      "What you sent us:",
      detailsText(sub),
      "",
      siteConfig.name,
      SITE_URL,
    ].join("\n"),
  };
}
