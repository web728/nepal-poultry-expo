"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { FormType } from "@/data/form-options";
import { issuesToFieldErrors } from "@/lib/validation/schemas";
import type { RecaptchaHandle } from "@/components/forms/Recaptcha";
import type { SubmitResponse } from "@/types/submission";

type Values = Record<string, string | boolean>;
type Status = "idle" | "submitting" | "success" | "error";
type PublicSuccess = { ok: true; formType: FormType; duplicate?: boolean; brochureUrl?: string | null };
type PublicResponse = PublicSuccess | Extract<SubmitResponse, { ok: false }>;
const newKey = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export function useFormSubmission<S extends z.ZodObject>({ formType, schema, initial, formRef, captchaRef }: {
  formType: FormType;
  schema: S;
  initial: Values;
  formRef: React.RefObject<HTMLFormElement | null>;
  captchaRef: React.RefObject<RecaptchaHandle | null>;
}) {
  const pathname = usePathname();
  const [values, setValues] = useState<Values>(initial);
  const valuesRef = useRef<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const token = useRef<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | undefined>();
  const [result, setResult] = useState<PublicSuccess | null>(null);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const startedAt = useRef(0);
  const inFlight = useRef(false);
  const mounted = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    startedAt.current = performance.now();
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);

  const validateField = useCallback((name: string, nextValues: Values) => {
    const fieldSchema = (schema.shape as Record<string, z.ZodType>)[name];
    if (!fieldSchema) return;
    const parsed = fieldSchema.safeParse(nextValues[name]);
    setErrors(prev => {
      const next = { ...prev };
      if (parsed.success) delete next[name];
      else next[name] = parsed.error.issues[0]?.message ?? "Invalid value";
      return next;
    });
  }, [schema]);

  const setValue = useCallback((name: string, value: string | boolean) => {
    if (inFlight.current) return;
    const next = { ...valuesRef.current, [name]: value };
    valuesRef.current = next;
    setValues(next);
    if (touched[name] || errors[name]) validateField(name, next);
  }, [touched, errors, validateField]);

  const blur = useCallback((name: string) => {
    setTouched(t => ({ ...t, [name]: true }));
    validateField(name, valuesRef.current);
  }, [validateField]);

  const focusFirstError = (fieldErrors: Record<string, string>) => {
    const first = Object.keys(valuesRef.current).find(k => fieldErrors[k]);
    if (!first) return;
    // Country uses a hidden named input, so prefer the visible combobox.
    const el = Array.from(formRef.current?.querySelectorAll<HTMLElement>("input:not([type=hidden]), select, textarea, [role=combobox]") ?? [])
      .find(node => node.getAttribute("name") === first || node.id.endsWith(`-${first}`));
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ behavior: "auto", block: "center" });
  };

  const onCaptchaToken = useCallback((value: string | null) => {
    token.current = value;
    if (value) setCaptchaError(undefined);
  }, []);
  const onCaptchaExpired = useCallback(() => {
    token.current = null;
    setCaptchaError("The check expired — please tick ‘I’m not a robot’ again.");
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current || status === "success") return;
    setFormError(null);
    const snapshot = { ...valuesRef.current };
    const parsed = schema.safeParse(snapshot);
    if (!parsed.success) {
      const fieldErrors = issuesToFieldErrors(parsed.error.issues);
      setErrors(fieldErrors);
      setTouched(Object.fromEntries(Object.keys(snapshot).map(k => [k, true])));
      focusFirstError(fieldErrors);
      return;
    }
    const captchaToken = token.current;
    if (!captchaToken) {
      setCaptchaError("Please tick ‘I’m not a robot’ before submitting.");
      return;
    }
    setErrors({});
    setCaptchaError(undefined);
    const fingerprint = JSON.stringify(parsed.data);
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: newKey() };
    inFlight.current = true;
    setStatus("submitting");
    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({ formType, data: snapshot, recaptchaToken: captchaToken,
          idempotencyKey: attempt.current.key, sourcePage: pathname,
          elapsedMs: Math.round(performance.now() - startedAt.current), website: honeypot }),
      });
      const body = await res.json().catch(() => null) as PublicResponse | null;
      if (!mounted.current) return;
      if (res.ok && body?.ok === true) {
        token.current = null;
        setResult({ ok: true, formType, duplicate: body.duplicate, brochureUrl: body.brochureUrl });
        setStatus("success");
        return;
      }
      token.current = null;
      captchaRef.current?.reset();
      setStatus("error");
      if (!body || body.ok !== false) {
        setFormError("We could not confirm your submission. Please try again.");
      } else if (body.code === "validation" && body.fieldErrors && Object.keys(body.fieldErrors).length) {
        setErrors(body.fieldErrors);
        setTouched(Object.fromEntries(Object.keys(snapshot).map(k => [k, true])));
        setFormError(body.error);
        focusFirstError(body.fieldErrors);
      } else if (body.code === "captcha") setCaptchaError(body.error);
      else setFormError(body.error);
    } catch {
      if (!mounted.current) return;
      token.current = null;
      captchaRef.current?.reset();
      setStatus("error");
      setFormError("We could not confirm your submission. Please check your connection and try again.");
    } finally {
      clearTimeout(timeout);
      controller.current = null;
      inFlight.current = false;
    }
  };

  const reset = () => {
    if (inFlight.current) return;
    valuesRef.current = initial;
    setValues(initial); setErrors({}); setTouched({}); setStatus("idle");
    setFormError(null); setResult(null); setCaptchaError(undefined);
    token.current = null; attempt.current = null;
    captchaRef.current?.reset();
    startedAt.current = performance.now();
  };

  const fieldProps = (name: string) => ({
    id: `${formType}-${name}`, name, value: String(values[name] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValue(name, e.target.value),
    onBlur: () => blur(name), invalid: Boolean(errors[name]), disabled: status === "submitting",
  });
  return { values, errors, status, formError, result, captchaError, setValue, blur, submit, reset,
    fieldProps, onCaptchaToken, onCaptchaExpired, submitting: status === "submitting" };
}
