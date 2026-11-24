import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { adminNotification, escapeHtml, userConfirmation } from "@/lib/email/templates";
import { submissionToRow } from "@/lib/google-sheets/row";
import { SHEET_HEADERS } from "@/lib/submissions/fields";
import type { FormType } from "@/data/form-options";

const createdAt = new Date("2026-11-21T08:15:00Z");

const samples: Record<FormType, Record<string, unknown>> = {
  exhibitor: {
    companyName: "Himalayan Feeds <b>Pvt</b> Ltd",
    contactPerson: "Sita Sharma",
    designation: "Sales Manager",
    phone: "+977 9841234567",
    email: "sita@himalayanfeeds.com",
    country: "Nepal",
    productsServices: "Layer feed\nBroiler feed\n<script>alert(1)</script>",
    boothSize: "18 sqm",
  },
  visitor: {
    fullName: "Ram Thapa",
    organisation: "Thapa Poultry Farm",
    designation: "Owner",
    phone: "+977 9812345678",
    email: "ram@example.com",
    businessCategory: "Poultry farming",
    country: "Nepal",
  },
  contact: {
    fullName: "Anita Rai",
    companyName: "Agri News Nepal",
    country: "Nepal",
    email: "anita@agrinews.example",
    phone: "+977 9800000000",
    areaOfInterest: "Media",
    message: "=HYPERLINK(\"http://evil\")",
  },
  brochure: {
    fullName: "John Smith",
    companyName: "Global Poultry Equipment",
    country: "United Kingdom",
    email: "john@gpe.example",
    phone: "+44 20 7946 0958",
    consent: true,
  },
};

const sub = (formType: FormType) => ({
  submissionId: `NPE-${{ exhibitor: "EXH", visitor: "VIS", contact: "ENQ", brochure: "BRO" }[formType]}-261121-ABCDEF`,
  formType,
  data: samples[formType],
  sourcePage: formType === "contact" ? "/contact" : `/register/${formType}`,
  createdAt,
});

describe("google sheet rows", () => {
  it.each(["exhibitor", "visitor", "contact", "brochure"] as const)("maps %s onto the shared columns", (t) => {
    const row = submissionToRow(sub(t));
    expect(row).toHaveLength(SHEET_HEADERS.length);
    expect(row[0]).toBe(sub(t).submissionId);
    expect(row[1]).toBe(createdAt.toISOString());
    expect(row[9]).toBe(samples[t].country);
  });

  it("neutralises spreadsheet formulas but keeps phone numbers intact", () => {
    const row = submissionToRow(sub("contact"));
    expect(row[14].startsWith("'=")).toBe(true);
    expect(row[8]).toBe("+977 9800000000");
  });
});

describe("e-mail templates", () => {
  it("escapes user input in HTML", () => {
    const { html, text, subject } = adminNotification(sub("exhibitor"));
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain(escapeHtml("<script>alert(1)</script>"));
    expect(html).toContain("NPE-EXH-261121-ABCDEF");
    expect(text).toContain("Products & Services: Layer feed");
    expect(subject).toContain("Exhibitor Registration");
  });

  it("includes the brochure link only when one is provided", () => {
    const withLink = userConfirmation(sub("brochure"), { brochureUrl: "https://www.nepalpoultryexpo.com/api/brochure/download?token=t" });
    expect(withLink.html).toContain("Download the brochure");
    const without = userConfirmation(sub("brochure"), { brochureUrl: null });
    expect(without.html).not.toContain("Download the brochure");
    expect(without.html).toContain("being finalised");
  });

  it("writes HTML previews for visual review (.email-previews/)", () => {
    const dir = path.resolve(__dirname, "..", ".email-previews");
    mkdirSync(dir, { recursive: true });
    for (const t of ["exhibitor", "visitor", "contact", "brochure"] as const) {
      writeFileSync(path.join(dir, `admin-${t}.html`), adminNotification(sub(t)).html);
      writeFileSync(
        path.join(dir, `user-${t}.html`),
        userConfirmation(sub(t), { brochureUrl: t === "brochure" ? "https://www.nepalpoultryexpo.com/api/brochure/download?token=example" : null }).html,
      );
    }
    expect(true).toBe(true);
  });
});
