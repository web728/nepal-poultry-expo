import type { FormType } from "@/data/form-options";
export const FIELD_LABELS: Record<FormType, [key: string, label: string][]> = {
  exhibitor: [["companyName","Company Name"],["contactPerson","Contact Person"],["designation","Designation"],["phone","Mob / WhatsApp No."],["email","Email Address"],["country","Country"],["productsServices","Products & Services"],["boothSize","Preferred Booth Size"]],
  visitor: [["fullName","Full Name"],["organisation","Company / Organisation"],["designation","Designation"],["phone","Mobile / WhatsApp Number"],["email","Email Address"],["businessCategory","Business / Category"],["country","Country"]],
  contact: [["fullName","Full Name"],["companyName","Company Name"],["country","Country"],["email","Business Email"],["phone","Mobile / WhatsApp"],["areaOfInterest","Area of Interest"],["message","Your Message"]],
  brochure: [["fullName","Full Name"],["companyName","Company Name"],["country","Country"],["email","Business Email"],["phone","Mobile / WhatsApp"],["consent","Privacy Consent"]],
};
export function personName(data: Record<string, unknown>): string { return String(data.fullName ?? data.contactPerson ?? "").trim(); }
export function companyName(data: Record<string, unknown>): string { return String(data.companyName ?? data.organisation ?? "").trim(); }
export function formatValue(value: unknown): string { return value === true ? "Yes" : value === false ? "No" : value == null || value === "" ? "—" : String(value); }
export const SHEET_HEADERS = ["Submitted At (UTC)","Submitted At (IST)","Form Type","Full Name / Contact Person","Company / Organisation","Designation","Email","Mobile / WhatsApp","Country","Preferred Booth Size","Products & Services","Business / Category","Area of Interest","Message","Privacy Consent","Source Page"] as const;
