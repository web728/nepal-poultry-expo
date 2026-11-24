"use client";

import { useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import Link from "next/link";
import { brochureFields } from "@/lib/validation/schemas";
import { siteConfig } from "@/config/site";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, TextInput, describedBy } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";
import { cn } from "@/lib/cn";

const INITIAL = { fullName: "", companyName: "", country: "", email: "", phone: "", consent: false };

/**
 * Brochure request. The PDF is never linked publicly: a signed, expiring download link
 * is returned only after the request has been validated, verified and stored.
 */
export function BrochureForm({ compact = false }: { compact?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({ formType: "brochure", schema: brochureFields, initial: INITIAL, formRef, captchaRef });

  if (f.status === "success" && f.result) {
    return (
      <FormSuccess
        title="Thank you — your request is confirmed."
        message={
          f.result.brochureUrl
            ? "Your brochure is ready. We have also e-mailed you a personal download link that stays active for 7 days."
            : "We have recorded your request and sent a confirmation to your e-mail."
        }
        brochureUrl={f.result.brochureUrl}
        brochureMissingNote="The brochure for the upcoming edition is being finalised. We will e-mail it to you as soon as it is published."
        submissionId={f.result.submissionId}
        email={String(f.values.email)}
        actions={compact ? undefined : [{ href: "/register/exhibitor", label: "Book a stand" }]}
      />
    );
  }

  const { errors } = f;
  const consentId = "brochure-consent";
  return (
    <form ref={formRef} onSubmit={f.submit} noValidate className="relative space-y-6">
      <Honeypot />
      <FormError message={f.formError} />

      <div className={cn("grid gap-5", !compact && "md:grid-cols-2")}>
        <Field id="brochure-fullName" label="Full Name" required error={errors.fullName}>
          <TextInput {...f.fieldProps("fullName")} autoComplete="name" aria-describedby={describedBy("brochure-fullName", errors.fullName)} required />
        </Field>
        <Field id="brochure-companyName" label="Company Name" required error={errors.companyName}>
          <TextInput {...f.fieldProps("companyName")} autoComplete="organization" aria-describedby={describedBy("brochure-companyName", errors.companyName)} required />
        </Field>
        <Field id="brochure-country" label="Country" required error={errors.country}>
          <CountryCombobox
            id="brochure-country"
            name="country"
            value={String(f.values.country)}
            onChange={(v) => f.setValue("country", v)}
            onBlur={() => f.blur("country")}
            invalid={Boolean(errors.country)}
            required
            describedBy={describedBy("brochure-country", errors.country)}
          />
        </Field>
        <Field id="brochure-email" label="Business Email" required error={errors.email}>
          <TextInput
            {...f.fieldProps("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-describedby={describedBy("brochure-email", errors.email)}
            required
          />
        </Field>
        <Field id="brochure-phone" label="Mobile / WhatsApp" required error={errors.phone} hint="Include the country code, e.g. +977" className={cn(!compact && "md:col-span-2")}>
          <TextInput
            {...f.fieldProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+977 98XXXXXXXX"
            aria-describedby={describedBy("brochure-phone", errors.phone, "hint")}
            required
          />
        </Field>
      </div>

      <div>
        <label htmlFor={consentId} className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink-700">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            checked={Boolean(f.values.consent)}
            onChange={(e) => f.setValue("consent", e.target.checked)}
            onBlur={() => f.blur("consent")}
            aria-invalid={Boolean(errors.consent) || undefined}
            aria-describedby={errors.consent ? `${consentId}-error` : undefined}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-600"
            required
          />
          <span>
            I agree that {siteConfig.name} may use the details I have provided to send me the brochure and to contact me
            about the expo, as described in the{" "}
            <Link href="/privacy-policy" target="_blank" className="font-medium text-ink-900 underline underline-offset-2">
              Privacy Policy
            </Link>
            .<span className="text-brand-700"> *</span>
          </span>
        </label>
        {errors.consent && (
          <p id={`${consentId}-error`} role="alert" className="mt-1.5 pl-8 text-[0.8125rem] font-medium text-danger-600">
            {errors.consent}
          </p>
        )}
      </div>

      <SubmitRow
        label="Get the brochure"
        submitting={f.submitting}
        captchaRef={captchaRef}
        onToken={f.onCaptchaToken}
        onExpired={f.onCaptchaExpired}
        captchaError={f.captchaError}
      />
    </form>
  );
}
