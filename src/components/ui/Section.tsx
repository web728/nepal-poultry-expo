import { cn } from "@/lib/cn";

type Tone = "white" | "light" | "sand" | "dark" | "darker" | "red";

const tones: Record<Tone, string> = {
  white: "bg-white text-ink-900",
  light: "bg-sand-50 text-ink-900",
  sand: "bg-sand-100 text-ink-900",
  dark: "bg-ink-900 text-white [--tag-color:var(--color-flame-400)]",
  darker: "bg-ink-950 text-white [--tag-color:var(--color-flame-400)]",
  red: "bg-brand-500 text-white",
};

export function Section({
  tone = "white",
  className,
  children,
  id,
  labelledBy,
  spacing = "default",
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  id?: string;
  labelledBy?: string;
  spacing?: "default" | "compact" | "none";
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative",
        tones[tone],
        spacing === "default" && "py-16 md:py-24 lg:py-28",
        spacing === "compact" && "py-12 md:py-14",
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * Brochure-style section heading: a red label tag, then an ExtraBold Italic uppercase
 * headline ("CONNECTING INDUSTRY. CREATING OPPORTUNITIES."), then optional intro copy.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  intro,
  align = "left",
  tone = "light",
  accent = false,
  className,
  as: Heading = "h2",
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  /** Short bold uppercase line under the headline ("AN ESTABLISHED INDUSTRY…"). */
  subtitle?: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Red headline, as used for "WHO SHOULD EXHIBIT?" in the brochure. */
  accent?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("tag mb-5", dark && "[--tag-color:var(--color-flame-400)]", align === "center" && "justify-center")}>{eyebrow}</p>}
      <Heading
        id={id}
        className={cn(
          "headline text-[1.9rem] sm:text-[2.4rem] lg:text-[2.9rem]",
          accent ? (dark ? "text-gradient" : "text-brand-500") : dark ? "text-white" : "text-ink-900",
        )}
      >
        {title}
      </Heading>
      {subtitle && (
        <p className={cn("mt-4 text-[0.9375rem] font-semibold uppercase tracking-[0.08em] sm:text-base", dark ? "text-ink-200" : "text-ink-700")}>
          {subtitle}
        </p>
      )}
      {intro && <div className={cn("mt-5 text-[1rem] leading-relaxed sm:text-[1.0625rem]", dark ? "text-ink-300" : "text-ink-600")}>{intro}</div>}
    </div>
  );
}
