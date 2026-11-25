"use client";
import { useId, useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import { useSearchParams } from "next/navigation";
import { AREAS_OF_INTEREST } from "@/data/form-options";
import { contactFields } from "@/lib/validation/schemas";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, TextInput, describedBy, Select, TextArea } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";
const INTEREST_PARAM: Record<string, (typeof AREAS_OF_INTEREST)[number]> = { exhibiting: "Exhibiting", visiting: "Visiting", partner: "Association / Partner", media: "Media", general: "General Enquiry" };
export function ContactForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const interestParam = useSearchParams().get("interest") ?? "";
  const f = useFormSubmission({ formType: "contact", schema: contactFields, initial: { fullName: "", companyName: "", country: "", email: "", phone: "", areaOfInterest: INTEREST_PARAM[interestParam] ?? "", message: "" }, formRef, captchaRef });
  if (f.status === "success" && f.result) {
    return <FormSuccess title="Thank you for contacting us." message="Your enquiry has been received. Our organising team will get in touch with you shortly." email={String(f.values.email)} actions={[{ href: "/exhibitors", label: "Exhibitor information" }, { href: "/visitors", label: "Visitor information" }]}
      onReset={f.reset} resetLabel="Send another message"
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
      <Field id={id("companyName")} label="Company Name" required error={errors.companyName}>
        <TextInput {...f.fieldProps("companyName")} id={id("companyName")} invalid={Boolean(errors.companyName)} aria-describedby={describedBy(id("companyName"), errors.companyName)} required autoComplete="organization" />
      </Field>
      <Field id={id("country")} label="Country" required error={errors.country}>
        <CountryCombobox id={id("country")} name="country" value={String(f.values.country)} onChange={v => f.setValue("country", v)} onBlur={() => f.blur("country")} invalid={Boolean(errors.country)} required describedBy={describedBy(id("country"), errors.country)} />
      </Field>
      <Field id={id("email")} label="Business Email" required error={errors.email}>
        <TextInput {...f.fieldProps("email")} id={id("email")} invalid={Boolean(errors.email)} aria-describedby={describedBy(id("email"), errors.email)} required autoComplete="email" type="email" inputMode="email" placeholder="name@company.com" />
      </Field>
      <Field id={id("phone")} label="Mobile / WhatsApp" required error={errors.phone} hint="Include the country code, e.g. +977">
        <TextInput {...f.fieldProps("phone")} id={id("phone")} invalid={Boolean(errors.phone)} aria-describedby={describedBy(id("phone"), errors.phone, "hint")} required autoComplete="tel" type="tel" inputMode="tel" placeholder="+977 98XXXXXXXX" />
      </Field>
      <Field id={id("areaOfInterest")} label="Area of Interest" required error={errors.areaOfInterest}>
        <Select {...f.fieldProps("areaOfInterest")} id={id("areaOfInterest")} invalid={Boolean(errors.areaOfInterest)} aria-describedby={describedBy(id("areaOfInterest"), errors.areaOfInterest)} required options={AREAS_OF_INTEREST} placeholder="Select an option" />
      </Field>
      <Field id={id("message")} label="Your Message" required error={errors.message} className="md:col-span-2">
        <TextArea {...f.fieldProps("message")} id={id("message")} invalid={Boolean(errors.message)} aria-describedby={describedBy(id("message"), errors.message)} required rows={6} maxLength={3000} />
      </Field>
    </div>
    <SubmitRow label="Send message" submitting={f.submitting} captchaRef={captchaRef} onToken={f.onCaptchaToken} onExpired={f.onCaptchaExpired} captchaError={f.captchaError}
      note={<> We use your details to answer your enquiry. See our <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ink-900">Privacy Policy</a>.</>}
    />
  </form>;
}
