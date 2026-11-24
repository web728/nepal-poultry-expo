import { describe, expect, it } from "vitest";
import {
  brochureFields,
  cleanLine,
  cleanText,
  contactFields,
  exhibitorFields,
  issuesToFieldErrors,
  phoneField,
  submissionEnvelope,
  visitorFields,
} from "@/lib/validation/schemas";
import { COUNTRIES } from "@/data/countries";

const exhibitor = {
  companyName: "Himalayan Feeds Pvt. Ltd.",
  contactPerson: "Sita Sharma",
  designation: "Sales Manager",
  phone: "+977 9841234567",
  email: "Sita@HimalayanFeeds.com ",
  country: "Nepal",
  productsServices: "Layer and broiler feed, premixes",
  boothSize: "",
};

describe("country list", () => {
  it("has no duplicates and includes Nepal", () => {
    expect(new Set(COUNTRIES).size).toBe(COUNTRIES.length);
    expect(COUNTRIES).toContain("Nepal");
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(249);
  });
});

describe("exhibitor schema", () => {
  it("accepts a valid registration and normalises values", () => {
    const r = exhibitorFields.safeParse(exhibitor);
    expect(r.success).toBe(true);
    expect(r.data?.email).toBe("sita@himalayanfeeds.com");
    expect(r.data?.boothSize).toBeUndefined();
  });

  it("reports every missing required field", () => {
    const r = exhibitorFields.safeParse({ ...exhibitor, companyName: "", contactPerson: " ", designation: "", country: "" });
    expect(r.success).toBe(false);
    const errors = issuesToFieldErrors(r.error!.issues);
    expect(Object.keys(errors).sort()).toEqual(["companyName", "contactPerson", "country", "designation"]);
    expect(errors.companyName).toMatch(/required/i);
  });

  it("accepts only listed booth sizes", () => {
    expect(exhibitorFields.safeParse({ ...exhibitor, boothSize: "18 sqm" }).success).toBe(true);
    expect(exhibitorFields.safeParse({ ...exhibitor, boothSize: "15 sqm" }).success).toBe(false);
  });

  it("rejects an unknown country", () => {
    expect(exhibitorFields.safeParse({ ...exhibitor, country: "Atlantis" }).success).toBe(false);
  });
});

describe("phone validation", () => {
  it.each(["+977 9841234567", "+91 98765 43210", "(01) 4412345", "+1-202-555-0143", "9841234567"])("accepts %s", (p) => {
    expect(phoneField.safeParse(p).success).toBe(true);
  });
  it.each(["12345", "+977 98abc4567", "phone", "+1234567890123456"])("rejects %s", (p) => {
    expect(phoneField.safeParse(p).success).toBe(false);
  });
});

describe("email validation", () => {
  it("rejects malformed addresses", () => {
    expect(contactFields.shape.email.safeParse("name@").success).toBe(false);
    expect(contactFields.shape.email.safeParse("name.company.com").success).toBe(false);
  });
});

describe("visitor, contact and brochure schemas", () => {
  it("visitor business category is optional", () => {
    const r = visitorFields.safeParse({
      fullName: "Ram Thapa",
      organisation: "Thapa Poultry Farm",
      designation: "Owner",
      phone: "+977 9812345678",
      email: "ram@example.com",
      businessCategory: "",
      country: "Nepal",
    });
    expect(r.success).toBe(true);
  });

  it("contact requires a known area of interest and a real message", () => {
    const base = {
      fullName: "A B",
      companyName: "Co",
      country: "India",
      email: "a@b.co",
      phone: "+91 9876543210",
      areaOfInterest: "Media",
      message: "We would like to cover the expo.",
    };
    expect(contactFields.safeParse(base).success).toBe(true);
    expect(contactFields.safeParse({ ...base, areaOfInterest: "Sponsorship" }).success).toBe(false);
    expect(contactFields.safeParse({ ...base, message: "hi" }).success).toBe(false);
  });

  it("brochure requires consent", () => {
    const base = { fullName: "A B", companyName: "Co", country: "Nepal", email: "a@b.co", phone: "+977 9841234567" };
    expect(brochureFields.safeParse({ ...base, consent: true }).success).toBe(true);
    const r = brochureFields.safeParse({ ...base, consent: false });
    expect(r.success).toBe(false);
    expect(issuesToFieldErrors(r.error!.issues).consent).toMatch(/agree/i);
  });
});

describe("sanitisation", () => {
  it("strips control characters and collapses whitespace", () => {
    expect(cleanLine("  Acme\u0000   Feeds\t Ltd \n")).toBe("Acme Feeds Ltd");
    expect(cleanText("Line one\r\n\r\n\r\n\r\nLine two\u0007")).toBe("Line one\n\nLine two");
  });
});

describe("submission envelope", () => {
  it("discriminates by form type and requires a reCAPTCHA token", () => {
    const ok = submissionEnvelope.safeParse({
      formType: "exhibitor",
      data: exhibitor,
      recaptchaToken: "x".repeat(40),
      idempotencyKey: "0f8fad5b-d9cb-469f-a165-70867728950e",
      sourcePage: "/register/exhibitor",
    });
    expect(ok.success).toBe(true);

    const noCaptcha = submissionEnvelope.safeParse({
      formType: "exhibitor",
      data: exhibitor,
      recaptchaToken: "",
      idempotencyKey: "0f8fad5b-d9cb-469f-a165-70867728950e",
    });
    expect(noCaptcha.success).toBe(false);

    const wrongShape = submissionEnvelope.safeParse({
      formType: "visitor",
      data: exhibitor,
      recaptchaToken: "x".repeat(40),
      idempotencyKey: "0f8fad5b-d9cb-469f-a165-70867728950e",
    });
    expect(wrongShape.success).toBe(false);
  });

  it("only accepts site-relative source pages", () => {
    const r = submissionEnvelope.safeParse({
      formType: "brochure",
      data: { fullName: "A B", companyName: "Co", country: "Nepal", email: "a@b.co", phone: "+977 9841234567", consent: true },
      recaptchaToken: "x".repeat(40),
      idempotencyKey: "0f8fad5b-d9cb-469f-a165-70867728950e",
      sourcePage: "https://evil.example/phish",
    });
    expect(r.success && r.data.sourcePage).toBe("/");
  });
});
