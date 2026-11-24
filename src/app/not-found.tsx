import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/exhibitors", label: "Exhibitor information" },
  { href: "/visitors", label: "Visitor information" },
  { href: "/media", label: "Photo gallery" },
  { href: "/contact", label: "Contact the organisers" },
];

export default function NotFound() {
  return (
    <section className="bg-sand-50">
      <div className="container-site grid min-h-[60vh] items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-brand-700">Error 404</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">This page could not be found</h1>
          <p className="mt-4 max-w-lg text-lg text-ink-600">
            The link may be out of date — the expo website has moved to a new structure. Try one of these pages instead.
          </p>
          <ButtonLink href="/" className="mt-8">
            Back to the homepage
          </ButtonLink>
        </div>
        <ul className="divide-y divide-sand-200 border-y border-sand-200">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex items-center justify-between py-4 text-lg font-medium text-ink-900 hover:text-brand-700">
                {l.label}
                <ArrowRight aria-hidden className="size-5 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-700" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
