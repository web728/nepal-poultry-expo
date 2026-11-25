"use client";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
export const inputClass = (invalid?: boolean) => cn(
  "block w-full rounded-md border bg-white px-3.5 text-base text-ink-900 placeholder:text-ink-400 sm:text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-150 disabled:opacity-60",
  "focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/15",
  invalid ? "border-danger-600 focus:border-danger-600 focus:ring-danger-600/15" : "border-ink-200 hover:border-ink-300"
);
export function Field({ id, label, required, optional, hint, error, className, children }: {
  id: string; label: string; required?: boolean; optional?: boolean; hint?: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return <div className={cn("min-w-0", className)}>
    <label htmlFor={id} className="mb-2 flex items-baseline gap-1 text-sm font-medium text-ink-900">
      {label}{required && <span aria-hidden className="text-brand-700">*</span>}{optional && <span className="font-normal text-ink-500">(optional)</span>}
    </label>
    {children}
    {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-danger-600">{error}</p>}
  </div>;
}
export function describedBy(id: string, error?: string, hint?: string) {
  return [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
}
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput({ invalid, className, ...props }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputClass(invalid), "h-12", className)} {...props} />;
});
type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ invalid, className, ...props }, ref) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} className={cn(inputClass(invalid), "min-h-32 resize-y py-3 leading-relaxed", className)} {...props} />;
});
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; placeholder: string; options: readonly string[] };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, className, placeholder, options, value, ...props }, ref) {
  return <div className="relative"><select ref={ref} value={value} aria-invalid={invalid || undefined} className={cn(inputClass(invalid), "h-12 cursor-pointer appearance-none pr-10", !value && "text-ink-400", className)} {...props}>
    <option value="">{placeholder}</option>{options.map(o => <option key={o} value={o} className="text-ink-900">{o}</option>)}
  </select><ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" /></div>;
});
