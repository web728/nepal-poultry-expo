import { FORM_LABELS } from "@/data/form-options";
import { companyName, personName } from "@/lib/submissions/fields";
import type { SubmissionDoc } from "@/types/submission";

// Google Sheets writes with RAW, so strings (including phone numbers) stay literal.
function cell(value: unknown): string {
  return value == null ? "" : String(value);
}
const indiaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "short", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});
export function submissionToRow(sub: Pick<SubmissionDoc,"formType"|"data"|"sourcePage"|"createdAt">): string[] {
  const d = sub.data;
  const interest = sub.formType === "exhibitor" ? "Exhibiting" : sub.formType === "visitor" ? "Visiting" : sub.formType === "brochure" ? "Brochure Request" : cell(d.areaOfInterest);
  const message = [
    cell(d.message),
    sub.formType === "exhibitor" && d.productsServices ? `Products & Services: ${cell(d.productsServices)}` : "",
    sub.formType === "exhibitor" && d.boothSize ? `Preferred Booth Size: ${cell(d.boothSize)}` : "",
    sub.formType === "visitor" && d.businessCategory ? `Business / Category: ${cell(d.businessCategory)}` : "",
  ].filter(Boolean).join("\n");
  return [
    indiaTime.format(sub.createdAt) + " (IST)", // A Date
    "Website",                               // B Platform
    FORM_LABELS[sub.formType],                // C Register As
    cell(companyName(d)),                     // D Company Name
    cell(personName(d)),                      // E Contact Person
    cell(d.designation),                      // F Designation
    cell(d.email),                            // G Email Id
    cell(d.phone),                            // H Mobile No.
    cell(d.website),                          // I Website (not collected currently)
    cell(d.address),                          // J Address (not collected currently)
    cell(d.country),                          // K Country
    interest,                                 // L Area of Interest
    cell(d.infoGetFrom),                      // M Info. Get From (not collected currently)
    message,                                  // N Message
    "", "", "", "", "", "",                   // O:T manual CRM fields
  ];
}
