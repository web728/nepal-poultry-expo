import { FORM_LABELS } from "@/data/form-options";
import { companyName, personName } from "@/lib/submissions/fields";
import type { SubmissionDoc } from "@/types/submission";

/** Neutralise spreadsheet formula prefixes (CSV/Excel injection) without altering phone numbers. */
function cell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const s = value === true ? "Yes" : value === false ? "No" : String(value);
  return /^[=@\t\r]/.test(s) ? `'${s}` : s;
}

const nepalTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kathmandu",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Maps any form onto the shared column layout in SHEET_HEADERS. */
export function submissionToRow(sub: Pick<SubmissionDoc, "submissionId" | "formType" | "data" | "sourcePage" | "createdAt">): string[] {
  const d = sub.data;
  return [
    sub.submissionId,
    sub.createdAt.toISOString(),
    nepalTime.format(sub.createdAt),
    FORM_LABELS[sub.formType],
    cell(personName(d)),
    cell(companyName(d)),
    cell(d.designation),
    cell(d.email),
    cell(d.phone),
    cell(d.country),
    cell(d.boothSize),
    cell(d.productsServices),
    cell(d.businessCategory),
    cell(d.areaOfInterest),
    cell(d.message),
    sub.formType === "brochure" ? cell(d.consent) : "",
    cell(sub.sourcePage),
  ];
}
