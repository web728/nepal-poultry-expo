import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "light" | "outline" | "outline-light" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-full transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_10px_24px_-12px_rgb(227_43_27/0.85)] hover:bg-brand-600 hover:shadow-[0_14px_30px_-12px_rgb(227_43_27/0.9)] focus-visible:outline-brand-500",
  dark: "bg-ink-900 text-white hover:bg-ink-700 focus-visible:outline-ink-900",
  light: "bg-white text-ink-900 hover:bg-sand-100 focus-visible:outline-white",
  outline: "border-[1.5px] border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white",
  "outline-light": "border-[1.5px] border-white/60 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-ink-900",
  link: "text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline px-0! h-auto! shadow-none!",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-[3.25rem] px-7 text-[0.9375rem]",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClasses({ variant, size, className })} {...props} />;
});
