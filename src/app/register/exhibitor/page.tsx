import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { AsideCard, FormPageLayout } from "@/components/layout/FormPageLayout";
import { ExhibitorForm } from "@/components/forms/ExhibitorForm";

export const metadata = pageMetadata({
  title: "Exhibitor Registration — Book a Stand",
  description:
    "Register as an exhibitor at the Nepal Poultry & Livestock International Expo. Tell us about your company and products and choose a preferred booth size from 9 sqm.",
  path: "/register/exhibitor",
});

export default function ExhibitorRegistrationPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Exhibitors", path: "/exhibitors" },
          { name: "Exhibitor Registration", path: "/register/exhibitor" },
        ]}
        eyebrow="Exhibitor registration"
        title="Book a stand"
        intro="Register your company to receive stand availability, space options and participation terms from the organisers."
      />
      <FormPageLayout
        formTitle="Company and contact details"
        aside={
          <AsideCard title="What happens next">
            <p>Our exhibitor team reviews your registration and contacts you about available space and terms. Registering does not commit you to a booking.</p>
            <p className="mt-3">
              Still deciding?{" "}
              <Link href="/exhibitors" className="font-semibold text-white underline underline-offset-2">
                Read why companies exhibit
              </Link>
              .
            </p>
          </AsideCard>
        }
      >
        <ExhibitorForm />
      </FormPageLayout>
    </>
  );
}
