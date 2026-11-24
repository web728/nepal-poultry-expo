"use client";

import { useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import { visitorFields } from "@/lib/validation/schemas";
import { siteConfig } from "@/config/site";
import { BUSINESS_CATEGORIES } from "@/data/form-options";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, Select, TextInput, describedBy } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";

const INITIAL = {
  fullName: "",
  organisation: "",
  designation: "",
  phone: "",
  email: "",
  businessCategory: "",
  country: "",
};

export function VisitorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({ formType: "visitor", schema: visitorFields, initial: INITIAL, formRef, captchaRef });

  if (f.status === "success" && f.result) {
    return (
      <FormSuccess
        title="You're registered to visit."
        message={
          <>
            Thank you for registering. See you on {siteConfig.event.datesLabel} at {siteConfig.event.venue.name},{" "}
            {siteConfig.event.venue.city}. We will e-mail you visitor information before the show — keep your reference number for any
            questions.
          </>
        }
        submissionId={f.result.submissionId}
        email={String(f.values.email)}
        actions={[
          { href: "/visitors", label: "Visitor information" },
          { href: "/media", label: "See the 2017 gallery" },
        ]}
        onReset={f.reset}
        resetLabel="Register another visitor"
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
        <Field id="visitor-fullName" label="Full Name" required error={errors.fullName}>
          <TextInput {...f.fieldProps("fullName")} autoComplete="name" aria-describedby={describedBy("visitor-fullName", errors.fullName)} required />
        </Field>
        <Field id="visitor-organisation" label="Company / Organisation" required error={errors.organisation}>
          <TextInput {...f.fieldProps("organisation")} autoComplete="organization" aria-describedby={describedBy("visitor-organisation", errors.organisation)} required />
        </Field>
        <Field id="visitor-designation" label="Designation" required error={errors.designation}>
          <TextInput {...f.fieldProps("designation")} autoComplete="organization-title" aria-describedby={describedBy("visitor-designation", errors.designation)} required />
        </Field>
        <Field id="visitor-phone" label="Mobile / WhatsApp Number" required error={errors.phone} hint="Include the country code, e.g. +977">
          <TextInput
            {...f.fieldProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+977 98XXXXXXXX"
            aria-describedby={describedBy("visitor-phone", errors.phone, "hint")}
            required
          />
        </Field>
        <Field id="visitor-email" label="Email Address" required error={errors.email}>
          <TextInput
            {...f.fieldProps("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-describedby={describedBy("visitor-email", errors.email)}
            required
          />
        </Field>
        <Field id="visitor-businessCategory" label="Business / Category" optional error={errors.businessCategory}>
          <Select
            {...f.fieldProps("businessCategory")}
            placeholder="Select your line of business"
            options={BUSINESS_CATEGORIES}
            aria-describedby={describedBy("visitor-businessCategory", errors.businessCategory)}
          />
        </Field>
        <Field id="visitor-country" label="Country" required error={errors.country} className="md:col-span-2">
          <CountryCombobox
            id="visitor-country"
            name="country"
            value={String(f.values.country)}
            onChange={(v) => f.setValue("country", v)}
            onBlur={() => f.blur("country")}
            invalid={Boolean(errors.country)}
            required
            describedBy={describedBy("visitor-country", errors.country)}
          />
        </Field>
      </div>

      <SubmitRow
        label="Register my visit"
        submitting={f.submitting}
        captchaRef={captchaRef}
        onToken={f.onCaptchaToken}
        onExpired={f.onCaptchaExpired}
        captchaError={f.captchaError}
        note={
          <>
            We use your details to send visitor updates. See our{" "}
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
