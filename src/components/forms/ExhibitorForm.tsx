"use client";
import { useId, useRef } from "react";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import { BOOTH_SIZES } from "@/data/form-options";
import { exhibitorFields } from "@/lib/validation/schemas";
import { useFormSubmission } from "@/components/forms/useFormSubmission";
import { Field, TextInput, describedBy, Select, TextArea } from "@/components/forms/fields";
import { CountryCombobox } from "@/components/forms/CountryCombobox";
import { FormError, FormSuccess, Honeypot, SubmitRow } from "@/components/forms/FormShell";
export function ExhibitorForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const f = useFormSubmission({ formType: "exhibitor", schema: exhibitorFields, initial: { companyName: "", contactPerson: "", designation: "", phone: "", email: "", country: "", boothSize: "", productsServices: "" }, formRef, captchaRef });
  if (f.status === "success" && f.result) {
    return <FormSuccess title="Thank you for your interest." message="Your exhibitor registration has been received. Our team will contact you regarding stand availability and participation options." email={String(f.values.email)} actions={[{ href: "/exhibitors", label: "Exhibitor information" }, { href: "/brochure", label: "Request the brochure" }]}
      onReset={f.reset} resetLabel="Register another company"
    />;
  }
  const { errors } = f;
  return <form ref={formRef} onSubmit={f.submit} noValidate className="relative space-y-6">
    <Honeypot />
    <p className="text-sm text-ink-500">Fields marked <span className="text-brand-700">*</span> are required.</p>
    <FormError message={f.formError} />
    <div className="grid gap-5 md:grid-cols-2">
      <Field id={id("companyName")} label="Company Name" required error={errors.companyName} className="md:col-span-2">
        <TextInput {...f.fieldProps("companyName")} id={id("companyName")} invalid={Boolean(errors.companyName)} aria-describedby={describedBy(id("companyName"), errors.companyName)} required autoComplete="organization" />
      </Field>
      <Field id={id("contactPerson")} label="Contact Person" required error={errors.contactPerson}>
        <TextInput {...f.fieldProps("contactPerson")} id={id("contactPerson")} invalid={Boolean(errors.contactPerson)} aria-describedby={describedBy(id("contactPerson"), errors.contactPerson)} required autoComplete="name" />
      </Field>
      <Field id={id("designation")} label="Designation" required error={errors.designation}>
        <TextInput {...f.fieldProps("designation")} id={id("designation")} invalid={Boolean(errors.designation)} aria-describedby={describedBy(id("designation"), errors.designation)} required autoComplete="organization-title" />
      </Field>
      <Field id={id("phone")} label="Mob / WhatsApp No." required error={errors.phone} hint="Include the country code, e.g. +977">
        <TextInput {...f.fieldProps("phone")} id={id("phone")} invalid={Boolean(errors.phone)} aria-describedby={describedBy(id("phone"), errors.phone, "hint")} required autoComplete="tel" type="tel" inputMode="tel" placeholder="+977 98XXXXXXXX" />
      </Field>
      <Field id={id("email")} label="Email Address" required error={errors.email}>
        <TextInput {...f.fieldProps("email")} id={id("email")} invalid={Boolean(errors.email)} aria-describedby={describedBy(id("email"), errors.email)} required autoComplete="email" type="email" inputMode="email" placeholder="name@company.com" />
      </Field>
      <Field id={id("country")} label="Country" required error={errors.country}>
        <CountryCombobox id={id("country")} name="country" value={String(f.values.country)} onChange={v => f.setValue("country", v)} onBlur={() => f.blur("country")} invalid={Boolean(errors.country)} required describedBy={describedBy(id("country"), errors.country)} />
      </Field>
      <Field id={id("boothSize")} label="Preferred Booth Size" optional error={errors.boothSize}>
        <Select {...f.fieldProps("boothSize")} id={id("boothSize")} invalid={Boolean(errors.boothSize)} aria-describedby={describedBy(id("boothSize"), errors.boothSize)} options={BOOTH_SIZES} placeholder="Select a booth size" />
      </Field>
      <Field id={id("productsServices")} label="Products & Services" required error={errors.productsServices} hint="What will you exhibit? e.g. feed additives, poultry equipment, vaccines, processing machinery." className="md:col-span-2">
        <TextArea {...f.fieldProps("productsServices")} id={id("productsServices")} invalid={Boolean(errors.productsServices)} aria-describedby={describedBy(id("productsServices"), errors.productsServices, "hint")} required rows={5} maxLength={2000} />
      </Field>
    </div>
    <SubmitRow label="Submit registration" submitting={f.submitting} captchaRef={captchaRef} onToken={f.onCaptchaToken} onExpired={f.onCaptchaExpired} captchaError={f.captchaError}
      note={<> By submitting you agree to be contacted about exhibiting. See our <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ink-900">Privacy Policy</a>.</>}
    />
  </form>;
}
