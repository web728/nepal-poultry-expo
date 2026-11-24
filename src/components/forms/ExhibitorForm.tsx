"use client";

import { useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import { exhibitorFields } from "@/lib/validation/schemas";
import { BOOTH_SIZES } from "@/data/form-options";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, Select, TextArea, TextInput, describedBy } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";

const INITIAL = {
  companyName: "",
  contactPerson: "",
  designation: "",
  phone: "",
  email: "",
  country: "",
  productsServices: "",
  boothSize: "",
};

export function ExhibitorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({ formType: "exhibitor", schema: exhibitorFields, initial: INITIAL, formRef, captchaRef });

  if (f.status === "success" && f.result) {
    return (
      <FormSuccess
        title="Thank you — your stand enquiry is in."
        message={
          <>
            Our exhibitor team will review your details and contact you about stand availability, space options and
            participation terms. A confirmation has been sent to your e-mail.
          </>
        }
        submissionId={f.result.submissionId}
        email={String(f.values.email)}
        actions={[
          { href: "/exhibitors", label: "Exhibitor information" },
          { href: "/brochure", label: "Request the brochure" },
        ]}
        onReset={f.reset}
        resetLabel="Register another company"
      />
    );
  }

  const { errors } = f;
  return (
    <form ref={formRef} onSubmit={f.submit} noValidate className="relative space-y-6" aria-describedby="exhibitor-required-note">
      <Honeypot />
      <p id="exhibitor-required-note" className="text-sm text-ink-500">
        Fields marked <span className="text-brand-700">*</span> are required.
      </p>
      <FormError message={f.formError} />

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="exhibitor-companyName" label="Company Name" required error={errors.companyName} className="md:col-span-2">
          <TextInput {...f.fieldProps("companyName")} autoComplete="organization" aria-describedby={describedBy("exhibitor-companyName", errors.companyName)} required />
        </Field>
        <Field id="exhibitor-contactPerson" label="Contact Person" required error={errors.contactPerson}>
          <TextInput {...f.fieldProps("contactPerson")} autoComplete="name" aria-describedby={describedBy("exhibitor-contactPerson", errors.contactPerson)} required />
        </Field>
        <Field id="exhibitor-designation" label="Designation" required error={errors.designation}>
          <TextInput {...f.fieldProps("designation")} autoComplete="organization-title" aria-describedby={describedBy("exhibitor-designation", errors.designation)} required />
        </Field>
        <Field id="exhibitor-phone" label="Mob / WhatsApp No." required error={errors.phone} hint="Include the country code, e.g. +977">
          <TextInput
            {...f.fieldProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+977 98XXXXXXXX"
            aria-describedby={describedBy("exhibitor-phone", errors.phone, "hint")}
            required
          />
        </Field>
        <Field id="exhibitor-email" label="Email Address" required error={errors.email}>
          <TextInput
            {...f.fieldProps("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-describedby={describedBy("exhibitor-email", errors.email)}
            required
          />
        </Field>
        <Field id="exhibitor-country" label="Country" required error={errors.country}>
          <CountryCombobox
            id="exhibitor-country"
            name="country"
            value={String(f.values.country)}
            onChange={(v) => f.setValue("country", v)}
            onBlur={() => f.blur("country")}
            invalid={Boolean(errors.country)}
            required
            describedBy={describedBy("exhibitor-country", errors.country)}
          />
        </Field>
        <Field id="exhibitor-boothSize" label="Preferred Booth Size" optional error={errors.boothSize}>
          <Select {...f.fieldProps("boothSize")} placeholder="Select a booth size" options={BOOTH_SIZES} aria-describedby={describedBy("exhibitor-boothSize", errors.boothSize)} />
        </Field>
        <Field
          id="exhibitor-productsServices"
          label="Products & Services"
          required
          error={errors.productsServices}
          hint="What will you exhibit? e.g. feed additives, poultry equipment, vaccines, processing machinery."
          className="md:col-span-2"
        >
          <TextArea
            {...f.fieldProps("productsServices")}
            rows={5}
            maxLength={2000}
            aria-describedby={describedBy("exhibitor-productsServices", errors.productsServices, "hint")}
            required
          />
        </Field>
      </div>

      <SubmitRow
        label="Submit registration"
        submitting={f.submitting}
        captchaRef={captchaRef}
        onToken={f.onCaptchaToken}
        onExpired={f.onCaptchaExpired}
        captchaError={f.captchaError}
        note={
          <>
            By submitting you agree to be contacted about exhibiting. See our{" "}
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
