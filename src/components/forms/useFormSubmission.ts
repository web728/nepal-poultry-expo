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

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

/**
 * Shared form state: field values, blur/submit validation with the same Zod schema the
 * API uses, reCAPTCHA token, idempotency key and the POST to /api/submissions.
 */
export function useFormSubmission<S extends z.ZodObject>({
  formType,
  schema,
  initial,
  formRef,
  captchaRef,
}: {
  formType: FormType;
  schema: S;
  initial: Values;
  /** Owned by the form component (so refs never travel through render values). */
  formRef: React.RefObject<HTMLFormElement | null>;
  captchaRef: React.RefObject<RecaptchaHandle | null>;
}) {
  const pathname = usePathname();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | undefined>();
  const [result, setResult] = useState<Extract<SubmitResponse, { ok: true }> | null>(null);
  // One key per form session, created on first submit and reused for retries of the same data.
  const idempotencyKey = useRef<string | null>(null);
  const startedAt = useRef<number>(0);
  const inFlight = useRef(false);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const validateField = useCallback(
    (name: string, nextValues: Values) => {
      const fieldSchema = (schema.shape as Record<string, z.ZodType>)[name];
      if (!fieldSchema) return;
      const parsed = fieldSchema.safeParse(nextValues[name]);
      setErrors((prev) => {
        const next = { ...prev };
        if (parsed.success) delete next[name];
        else next[name] = parsed.error.issues[0]?.message ?? "Invalid value";
        return next;
      });
    },
    [schema],
  );

  const setValue = useCallback(
    (name: string, value: string | boolean) => {
      const next = { ...values, [name]: value };
      setValues(next);
      if (touched[name] || errors[name]) validateField(name, next);
    },
    [values, touched, errors, validateField],
  );

  const blur = useCallback(
    (name: string) => {
      setTouched((t) => ({ ...t, [name]: true }));
      validateField(name, values);
    },
    [validateField, values],
  );

  const focusFirstError = (fieldErrors: Record<string, string>) => {
    const first = Object.keys(values).find((k) => fieldErrors[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`#${formType}-${first}`);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
    if (token) setCaptchaError(undefined);
  }, []);

  const onCaptchaExpired = useCallback(() => {
    setCaptchaError("The check expired — please tick “I’m not a robot” again.");
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current) return;
    setFormError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = issuesToFieldErrors(parsed.error.issues);
      setErrors(fieldErrors);
      setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
      focusFirstError(fieldErrors);
      return;
    }
    if (!captchaToken) {
      setCaptchaError("Please tick “I’m not a robot” before submitting.");
      return;
    }

    inFlight.current = true;
    idempotencyKey.current ??= newKey();
    setStatus("submitting");
    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          data: values,
          recaptchaToken: captchaToken,
          idempotencyKey: idempotencyKey.current,
          sourcePage: pathname,
          elapsedMs: Math.round(performance.now() - startedAt.current),
          website: honeypot,
        }),
      });
      const body = (await res.json().catch(() => null)) as SubmitResponse | null;

      if (body?.ok) {
        setResult(body);
        setStatus("success");
        return;
      }

      // Every failed attempt needs a fresh reCAPTCHA token (tokens are single-use).
      captchaRef.current?.reset();
      setStatus("error");
      if (!body) {
        setFormError("We could not reach the server. Please check your connection and try again.");
      } else if (body.code === "validation" && body.fieldErrors && Object.keys(body.fieldErrors).length) {
        setErrors(body.fieldErrors);
        setFormError(body.error);
        focusFirstError(body.fieldErrors);
      } else if (body.code === "captcha") {
        setCaptchaError(body.error);
      } else {
        setFormError(body.error);
      }
    } catch {
      captchaRef.current?.reset();
      setStatus("error");
      setFormError("We could not reach the server. Please check your connection and try again.");
    } finally {
      inFlight.current = false;
    }
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setFormError(null);
    setResult(null);
    setCaptchaToken(null);
    idempotencyKey.current = null;
    startedAt.current = performance.now();
  };

  const fieldProps = (name: string) => ({
    id: `${formType}-${name}`,
    name,
    value: String(values[name] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValue(name, e.target.value),
    onBlur: () => blur(name),
    invalid: Boolean(errors[name]),
  });

  return {
    values,
    errors,
    status,
    formError,
    result,
    captchaError,
    setValue,
    blur,
    submit,
    reset,
    fieldProps,
    onCaptchaToken,
    onCaptchaExpired,
    submitting: status === "submitting",
  };
}
