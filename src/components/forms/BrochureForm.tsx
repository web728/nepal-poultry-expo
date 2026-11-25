"use client";
import { useId, useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { brochureFields } from "@/lib/validation/schemas";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, TextInput, describedBy } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";
export function BrochureForm({ compact = false }: { compact?: boolean }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({ formType: "brochure", schema: brochureFields, initial: { fullName: "", companyName: "", country: "", email: "", phone: "", consent: false }, formRef, captchaRef });
  if (f.status === "success" && f.result) {
    return <FormSuccess title="Thank you for your request." message={f.result.brochureUrl ? "Your brochure is ready to download. You will also receive a personal download link by email." : "Your brochure request has been received successfully."} email={String(f.values.email)} actions={compact ? undefined : [{ href: "/register/exhibitor", label: "Book a stand" }]}
      brochureUrl={f.result.brochureUrl} brochureMissingNote="The upcoming expo brochure is being finalised. We will email it to you once it is available."
    />;
  }
  const { errors } = f;
  return <form ref={formRef} onSubmit={f.submit} noValidate className="relative space-y-6">
    <Honeypot />
    <p className="text-sm text-ink-500">Fields marked <span className="text-brand-700">*</span> are required.</p>
    <FormError message={f.formError} />
    <div className={cn("grid gap-5", !compact && "md:grid-cols-2")}>
      <Field id={id("fullName")} label="Full Name" required error={errors.fullName}>
        <TextInput {...f.fieldProps("fullName")} id={id("fullName")} invalid={Boolean(errors.fullName)} aria-describedby={describedBy(id("fullName"), errors.fullName)} required autoComplete="name" />
      </Field>
      <Field id={id("companyName")} label="Company Name" required error={errors.companyName}>
        <TextInput {...f.fieldProps("companyName")} id={id("companyName")} invalid={Boolean(errors.companyName)} aria-describedby={describedBy(id("companyName"), errors.companyName)} required autoComplete="organization" />
      </Field>
      <Field id={id("country")} label="Country" required error={errors.country}>
        <CountryCombobox id={id("country")} name="country" value={String(f.values.country)} onChange={v => f.setValue("country", v)} onBlur={() => f.blur("country")} invalid={Boolean(errors.country)} required describedBy={describedBy(id("country"), errors.country)} />
      </Field>
      <Field id={id("email")} label="Business Email" required error={errors.email}>
        <TextInput {...f.fieldProps("email")} id={id("email")} invalid={Boolean(errors.email)} aria-describedby={describedBy(id("email"), errors.email)} required autoComplete="email" type="email" inputMode="email" placeholder="name@company.com" />
      </Field>
      <Field id={id("phone")} label="Mobile / WhatsApp" required error={errors.phone} hint="Include the country code, e.g. +977" className={cn(!compact && "md:col-span-2")}>
        <TextInput {...f.fieldProps("phone")} id={id("phone")} invalid={Boolean(errors.phone)} aria-describedby={describedBy(id("phone"), errors.phone, "hint")} required autoComplete="tel" type="tel" inputMode="tel" placeholder="+977 98XXXXXXXX" />
      </Field>
    </div>
    <div>
      <label htmlFor={id("consent")} className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink-700">
        <input id={id("consent")} name="consent" type="checkbox" checked={Boolean(f.values.consent)} onChange={e => f.setValue("consent", e.target.checked)} onBlur={() => f.blur("consent")} aria-invalid={Boolean(errors.consent) || undefined} aria-describedby={errors.consent ? `${id("consent")}-error` : undefined} className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-600" required />
        <span>I agree that {siteConfig.name} may use the details I have provided to send me the brochure and to contact me about the expo, as described in the <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 underline underline-offset-2">Privacy Policy</Link>.<span className="text-brand-700"> *</span></span>
      </label>
      {errors.consent && <p id={`${id("consent")}-error`} role="alert" className="mt-1.5 pl-8 text-xs font-medium text-danger-600">{errors.consent}</p>}
    </div>
    <SubmitRow label="Get the brochure" submitting={f.submitting} captchaRef={captchaRef} onToken={f.onCaptchaToken} onExpired={f.onCaptchaExpired} captchaError={f.captchaError}
    />
  </form>;
}
