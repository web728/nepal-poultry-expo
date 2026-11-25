"use client";
import { useId, useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import { siteConfig } from "@/config/site";
import { BUSINESS_CATEGORIES } from "@/data/form-options";
import { visitorFields } from "@/lib/validation/schemas";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, TextInput, describedBy, Select } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";
export function VisitorForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({ formType: "visitor", schema: visitorFields, initial: { fullName: "", organisation: "", designation: "", phone: "", email: "", businessCategory: "", country: "" }, formRef, captchaRef });
  if (f.status === "success" && f.result) {
    return <FormSuccess title="You're successfully registered." message={<>Thank you for registering. We look forward to welcoming you on <strong>{siteConfig.event.datesLabel}</strong> at {siteConfig.event.venue.name}, {siteConfig.event.venue.city}. Visitor information will be shared by email before the expo.</>} email={String(f.values.email)} actions={[{ href: "/visitors", label: "Visitor information" }, { href: "/media", label: "Explore the expo gallery" }]}
      onReset={f.reset} resetLabel="Register another visitor"
    />;
  }
  const { errors } = f;
  return <form ref={formRef} onSubmit={f.submit} noValidate className="relative space-y-6">
    <Honeypot />
    <p className="text-sm text-ink-500">Fields marked <span className="text-brand-700">*</span> are required.</p>
    <FormError message={f.formError} />
    <div className="grid gap-5 md:grid-cols-2">
      <Field id={id("fullName")} label="Full Name" required error={errors.fullName}>
        <TextInput {...f.fieldProps("fullName")} id={id("fullName")} invalid={Boolean(errors.fullName)} aria-describedby={describedBy(id("fullName"), errors.fullName)} required autoComplete="name" />
      </Field>
      <Field id={id("organisation")} label="Company / Organisation" required error={errors.organisation}>
        <TextInput {...f.fieldProps("organisation")} id={id("organisation")} invalid={Boolean(errors.organisation)} aria-describedby={describedBy(id("organisation"), errors.organisation)} required autoComplete="organization" />
      </Field>
      <Field id={id("designation")} label="Designation" required error={errors.designation}>
        <TextInput {...f.fieldProps("designation")} id={id("designation")} invalid={Boolean(errors.designation)} aria-describedby={describedBy(id("designation"), errors.designation)} required autoComplete="organization-title" />
      </Field>
      <Field id={id("phone")} label="Mobile / WhatsApp Number" required error={errors.phone} hint="Include the country code, e.g. +977">
        <TextInput {...f.fieldProps("phone")} id={id("phone")} invalid={Boolean(errors.phone)} aria-describedby={describedBy(id("phone"), errors.phone, "hint")} required autoComplete="tel" type="tel" inputMode="tel" placeholder="+977 98XXXXXXXX" />
      </Field>
      <Field id={id("email")} label="Email Address" required error={errors.email}>
        <TextInput {...f.fieldProps("email")} id={id("email")} invalid={Boolean(errors.email)} aria-describedby={describedBy(id("email"), errors.email)} required autoComplete="email" type="email" inputMode="email" placeholder="name@company.com" />
      </Field>
      <Field id={id("businessCategory")} label="Business / Category" optional error={errors.businessCategory}>
        <Select {...f.fieldProps("businessCategory")} id={id("businessCategory")} invalid={Boolean(errors.businessCategory)} aria-describedby={describedBy(id("businessCategory"), errors.businessCategory)} options={BUSINESS_CATEGORIES} placeholder="Select your line of business" />
      </Field>
      <Field id={id("country")} label="Country" required error={errors.country} className="md:col-span-2">
        <CountryCombobox id={id("country")} name="country" value={String(f.values.country)} onChange={v => f.setValue("country", v)} onBlur={() => f.blur("country")} invalid={Boolean(errors.country)} required describedBy={describedBy(id("country"), errors.country)} />
      </Field>
    </div>
    <SubmitRow label="Register my visit" submitting={f.submitting} captchaRef={captchaRef} onToken={f.onCaptchaToken} onExpired={f.onCaptchaExpired} captchaError={f.captchaError}
      note={<> We use your details to send visitor updates. See our <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ink-900">Privacy Policy</a>.</>}
    />
  </form>;
}
