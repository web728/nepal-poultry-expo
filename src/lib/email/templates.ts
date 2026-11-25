import { FORM_LABELS, type FormType } from "@/data/form-options";
import { SITE_URL, siteConfig } from "@/config/site";
import { FIELD_LABELS, formatValue } from "@/lib/submissions/fields";
export type EmailContent = { subject: string; html: string; text: string };
type SubmissionLike = { formType: FormType; data: Record<string, unknown>; createdAt: Date; sourcePage: string };
export function escapeHtml(value: string): string {
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
export const formatNepalTime = (d: Date) => new Intl.DateTimeFormat("en-GB", {timeZone:"Asia/Kathmandu",dateStyle:"medium",timeStyle:"short"}).format(d)+" (NPT)";
const e = escapeHtml;
const domain = () => SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
function render(sub: SubmissionLike, user: boolean, brochureUrl?: string | null): EmailContent {
  const label = FORM_LABELS[sub.formType];
  const heading = user ? `${label} received` : `New ${label}`;
  const details = FIELD_LABELS[sub.formType].map(([key, name]) => [name, key === "consent" && sub.data[key] === true ? "Agreed to the privacy policy" : formatValue(sub.data[key])] as const);
  const rows = details.map(([name,value]) => `<tr><td valign="top" width="38%" style="padding:13px 12px;border-bottom:1px solid #e5e7eb;color:#64646c;font-size:13px">${e(name)}</td><td valign="top" style="padding:13px 12px;border-bottom:1px solid #e5e7eb;color:#18181b;font-size:14px;overflow-wrap:anywhere;word-break:break-word">${e(value).replace(/\n/g,"<br>")}</td></tr>`).join("");
  const download = user && sub.formType === "brochure" && brochureUrl ? new URL(brochureUrl,SITE_URL).toString() : null;
  const note = user && sub.formType === "brochure" && !download ? "The brochure is not currently available for download." : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f4f4f2;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb"><tr><td style="background:#18181b;padding:24px;color:white;border-bottom:4px solid #e32b1b"><img src="${e(new URL(siteConfig.logo.white,SITE_URL).toString())}" width="98" alt="" style="display:block;margin-bottom:14px;border:0"><div style="font-size:19px;font-weight:bold">${e(siteConfig.name)}</div><div style="font-size:12px;color:#d4d4d8;margin-top:6px">${e(domain())}</div></td></tr><tr><td style="padding:24px"><div style="font-size:11px;color:#c8231a;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">${user ? "Confirmation" : "Website form"}</div><h1 style="font-size:24px;line-height:1.3;margin:10px 0;color:#18181b">${e(heading)}</h1><p style="font-size:13px;color:#64646c;margin:0 0 24px">${e(formatNepalTime(sub.createdAt))}</p><table width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb">${rows}</table>${download ? `<p style="font-size:14px;line-height:1.6">Brochure download (valid for 7 days): <a style="color:#c8231a" href="${e(download)}">Download PDF</a></p>` : note ? `<p style="font-size:14px">${e(note)}</p>` : ""}</td></tr><tr><td style="background:#fafaf9;padding:20px 24px;font-size:12px;line-height:1.6;color:#64646c;border-top:1px solid #e5e7eb"><strong style="color:#18181b">${e(siteConfig.name)}</strong><br>${e(siteConfig.event.datesLabel)} · ${e(siteConfig.event.venue.name)}, ${e(siteConfig.event.venue.city)}<br>${e(domain())}</td></tr></table></td></tr></table></body></html>`;
  return {subject:`${siteConfig.shortName} | ${heading}`,html,text:[siteConfig.name,domain(),heading,formatNepalTime(sub.createdAt),"",...details.map(([k,v])=>`${k}: ${v}`),...(download?["",`Brochure download (valid for 7 days): ${download}`]:note?[note]:[])].join("\n")};
}
export function adminNotification(sub: SubmissionLike): EmailContent { return render(sub,false); }
export function userConfirmation(sub: SubmissionLike, opts: {brochureUrl?: string | null} = {}): EmailContent { return render(sub,true,opts.brochureUrl); }
