import type { FormType } from "@/data/form-options";

/**
 * Display labels and order of each form's fields — used by the e-mail templates and
 * to map submissions onto the shared "Website Enquiries" Google Sheet.
 */
export const FIELD_LABELS: Record<FormType, [key: string, label: string][]> = {
  exhibitor: [
    ["companyName", "Company Name"],
    ["contactPerson", "Contact Person"],
    ["designation", "Designation"],
    ["phone", "Mob / WhatsApp No."],
    ["email", "Email Address"],
    ["country", "Country"],
    ["productsServices", "Products & Services"],
    ["boothSize", "Preferred Booth Size"],
  ],
  visitor: [
    ["fullName", "Full Name"],
    ["organisation", "Company / Organisation"],
    ["designation", "Designation"],
    ["phone", "Mobile / WhatsApp Number"],
    ["email", "Email Address"],
    ["businessCategory", "Business / Category"],
    ["country", "Country"],
  ],
  contact: [
    ["fullName", "Full Name"],
    ["companyName", "Company Name"],
    ["country", "Country"],
    ["email", "Business Email"],
    ["phone", "Mobile / WhatsApp"],
    ["areaOfInterest", "Area of Interest"],
    ["message", "Your Message"],
  ],
  brochure: [
    ["fullName", "Full Name"],
    ["companyName", "Company Name"],
    ["country", "Country"],
    ["email", "Business Email"],
    ["phone", "Mobile / WhatsApp"],
    ["consent", "Privacy Consent"],
  ],
};

/** Name of the person who submitted, whatever the form calls it. */
export function personName(data: Record<string, unknown>): string {
  return String(data.fullName ?? data.contactPerson ?? "").trim();
}

/** Company / organisation, whatever the form calls it. */
export function companyName(data: Record<string, unknown>): string {
  return String(data.companyName ?? data.organisation ?? "").trim();
}

export function formatValue(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

/** Unified Google Sheet columns — every form maps onto the same header row. */
export const SHEET_HEADERS = [
  "Submission ID",
  "Submitted At (UTC)",
  "Submitted At (Nepal Time)",
  "Form Type",
  "Full Name / Contact Person",
  "Company / Organisation",
  "Designation",
  "Email",
  "Mobile / WhatsApp",
  "Country",
  "Preferred Booth Size",
  "Products & Services",
  "Business / Category",
  "Area of Interest",
  "Message",
  "Privacy Consent",
  "Source Page",
] as const;
