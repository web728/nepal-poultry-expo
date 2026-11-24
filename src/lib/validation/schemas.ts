/**
 * Form schemas shared by the browser (field-level feedback) and the API route
 * (authoritative validation). All string input is trimmed, whitespace-collapsed and
 * stripped of control characters before validation.
 */
import { z } from "zod";
import { COUNTRIES } from "@/data/countries";
import { AREAS_OF_INTEREST, BOOTH_SIZES, BUSINESS_CATEGORIES, FORM_TYPES } from "@/data/form-options";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Normalise a single-line value: strip control chars, collapse whitespace, trim. */
export function cleanLine(value: string): string {
  return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
}

/** Normalise multi-line text: keep line breaks, collapse runs of blank lines. */
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARS, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const line = (label: string, max = 120, min = 2) =>
  z
    .string({ error: `${label} is required.` })
    .transform(cleanLine)
    .pipe(
      z
        .string()
        .min(1, `${label} is required.`)
        .min(min, `${label} looks too short.`)
        .max(max, `${label} must be ${max} characters or fewer.`),
    );

const text = (label: string, max: number, min: number) =>
  z
    .string({ error: `${label} is required.` })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(1, `${label} is required.`)
        .min(min, `Please add a little more detail (at least ${min} characters).`)
        .max(max, `${label} must be ${max} characters or fewer.`),
    );

export const emailField = z
  .string({ error: "Email address is required." })
  .transform((v) => cleanLine(v).toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Email address is required.")
      .max(254, "Email address is too long.")
      .pipe(z.email("Enter a valid email address, e.g. name@company.com.")),
  );

/** International phone numbers: optional leading +, 7–15 digits (E.164 limit), common separators. */
export const phoneField = z
  .string({ error: "Mobile / WhatsApp number is required." })
  .transform(cleanLine)
  .pipe(
    z
      .string()
      .min(1, "Mobile / WhatsApp number is required.")
      .max(32, "Phone number is too long.")
      .refine((v) => /^\+?[\d\s\-().]+$/.test(v), "Use digits only, with an optional + and country code.")
      .refine((v) => {
        const digits = v.replace(/\D/g, "").length;
        return digits >= 7 && digits <= 15;
      }, "Enter a valid number with country code, e.g. +977 98XXXXXXXX."),
  );

export const countryField = z.enum(COUNTRIES, { error: "Please select your country." });

export const exhibitorFields = z.object({
  companyName: line("Company name", 160),
  contactPerson: line("Contact person", 100),
  designation: line("Designation", 100),
  phone: phoneField,
  email: emailField,
  country: countryField,
  productsServices: text("Products & services", 2000, 3),
  boothSize: z
    .union([z.enum(BOOTH_SIZES), z.literal("")])
    .optional()
    .transform((v) => v || undefined),
});

export const visitorFields = z.object({
  fullName: line("Full name", 100),
  organisation: line("Company / organisation", 160),
  designation: line("Designation", 100),
  phone: phoneField,
  email: emailField,
  businessCategory: z
    .union([z.enum(BUSINESS_CATEGORIES), z.literal("")])
    .optional()
    .transform((v) => v || undefined),
  country: countryField,
});

export const contactFields = z.object({
  fullName: line("Full name", 100),
  companyName: line("Company name", 160),
  country: countryField,
  email: emailField,
  phone: phoneField,
  areaOfInterest: z.enum(AREAS_OF_INTEREST, { error: "Please choose an area of interest." }),
  message: text("Your message", 3000, 10),
});

export const brochureFields = z.object({
  fullName: line("Full name", 100),
  companyName: line("Company name", 160),
  country: countryField,
  email: emailField,
  phone: phoneField,
  consent: z.literal(true, { error: "Please confirm you agree so we can send the brochure." }),
});

export const fieldSchemas = {
  exhibitor: exhibitorFields,
  visitor: visitorFields,
  contact: contactFields,
  brochure: brochureFields,
} as const;

export type ExhibitorData = z.output<typeof exhibitorFields>;
export type VisitorData = z.output<typeof visitorFields>;
export type ContactData = z.output<typeof contactFields>;
export type BrochureData = z.output<typeof brochureFields>;

export type FormDataByType = {
  exhibitor: ExhibitorData;
  visitor: VisitorData;
  contact: ContactData;
  brochure: BrochureData;
};

const envelopeBase = {
  recaptchaToken: z.string().min(20, "Please complete the “I’m not a robot” check.").max(4000),
  idempotencyKey: z
    .string()
    .regex(/^[A-Za-z0-9-]{16,64}$/, "Invalid submission key."),
  sourcePage: z
    .string()
    .max(200)
    .transform((v) => (v.startsWith("/") ? cleanLine(v) : "/"))
    .default("/"),
  /** Milliseconds the form was open before submit (measured in the browser). */
  elapsedMs: z.number().nonnegative().optional(),
  /** Honeypot — must stay empty. */
  website: z.string().max(200).optional(),
};

export const submissionEnvelope = z.discriminatedUnion("formType", [
  z.object({ formType: z.literal("exhibitor"), data: exhibitorFields, ...envelopeBase }),
  z.object({ formType: z.literal("visitor"), data: visitorFields, ...envelopeBase }),
  z.object({ formType: z.literal("contact"), data: contactFields, ...envelopeBase }),
  z.object({ formType: z.literal("brochure"), data: brochureFields, ...envelopeBase }),
]);

export type SubmissionEnvelope = z.output<typeof submissionEnvelope>;

export const formTypeSchema = z.enum(FORM_TYPES);

/** Flatten Zod issues into { field: firstMessage } for the UI. */
export function issuesToFieldErrors(issues: readonly z.core.$ZodIssue[], prefix?: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.map(String);
    if (prefix && path[0] === prefix) path.shift();
    const key = path[0] ?? "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
