"use client";

import { useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import { useSearchParams } from "next/navigation";
import { contactFields } from "@/lib/validation/schemas";
import { AREAS_OF_INTEREST } from "@/data/form-options";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, Select, TextArea, TextInput, describedBy } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";

const INTEREST_PARAM: Record<string, (typeof AREAS_OF_INTEREST)[number]> = {
  exhibiting: "Exhibiting",
  visiting: "Visiting",
  partner: "Association / Partner",
  media: "Media",
  general: "General Enquiry",
};

export function ContactForm() {
  // /contact?interest=media pre-selects the area of interest.
  const interestParam = useSearchParams().get("interest") ?? "";
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({
    formRef,
    captchaRef,
    formType: "contact",
    schema: contactFields,
    initial: {
      fullName: "",
      companyName: "",
      country: "",
      email: "",
      phone: "",
      areaOfInterest: INTEREST_PARAM[interestParam] ?? "",
      message: "",
    },
  });

  if (f.status === "success" && f.result) {
    return (
      <FormSuccess
        title="Message received — thank you."
        message="A member of the organising team will read your enquiry and reply by e-mail or phone. A copy has been sent to your inbox."
        submissionId={f.result.submissionId}
        email={String(f.values.email)}
        actions={[
          { href: "/exhibitors", label: "Exhibitor information" },
          { href: "/visitors", label: "Visitor information" },
        ]}
        onReset={f.reset}
        resetLabel="Send another message"
      />
    );
  }

  const { errors } = f;
  return (
    <form ref={formRef} onSubmit={f.submit} noValidate className="relative space-y-6">
      <Honeypot />
      <p className="text-sm text-ink-500">
        Fields marked <span className="text-brand-700">*</span> are required.
      </p>
      <FormError message={f.formError} />

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="contact-fullName" label="Full Name" required error={errors.fullName}>
          <TextInput {...f.fieldProps("fullName")} autoComplete="name" aria-describedby={describedBy("contact-fullName", errors.fullName)} required />
        </Field>
        <Field id="contact-companyName" label="Company Name" required error={errors.companyName}>
          <TextInput {...f.fieldProps("companyName")} autoComplete="organization" aria-describedby={describedBy("contact-companyName", errors.companyName)} required />
        </Field>
        <Field id="contact-country" label="Country" required error={errors.country}>
          <CountryCombobox
            id="contact-country"
            name="country"
            value={String(f.values.country)}
            onChange={(v) => f.setValue("country", v)}
            onBlur={() => f.blur("country")}
            invalid={Boolean(errors.country)}
            required
            describedBy={describedBy("contact-country", errors.country)}
          />
        </Field>
        <Field id="contact-email" label="Business Email" required error={errors.email}>
          <TextInput
            {...f.fieldProps("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-describedby={describedBy("contact-email", errors.email)}
            required
          />
        </Field>
        <Field id="contact-phone" label="Mobile / WhatsApp" required error={errors.phone} hint="Include the country code, e.g. +977">
          <TextInput
            {...f.fieldProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+977 98XXXXXXXX"
            aria-describedby={describedBy("contact-phone", errors.phone, "hint")}
            required
          />
        </Field>
        <Field id="contact-areaOfInterest" label="Area of Interest" required error={errors.areaOfInterest}>
          <Select
            {...f.fieldProps("areaOfInterest")}
            placeholder="Select an option"
            options={AREAS_OF_INTEREST}
            aria-describedby={describedBy("contact-areaOfInterest", errors.areaOfInterest)}
            required
          />
        </Field>
        <Field id="contact-message" label="Your Message" required error={errors.message} className="md:col-span-2">
          <TextArea {...f.fieldProps("message")} rows={6} maxLength={3000} aria-describedby={describedBy("contact-message", errors.message)} required />
        </Field>
      </div>

      <SubmitRow
        label="Send message"
        submitting={f.submitting}
        captchaRef={captchaRef}
        onToken={f.onCaptchaToken}
        onExpired={f.onCaptchaExpired}
        captchaError={f.captchaError}
        note={
          <>
            We use your details only to answer your enquiry. See our{" "}
            <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ink-900">
              Privacy Policy
            </a>
            .
          </>
        }
      />
    </form>
  );
}
