import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { AsideCard, FormPageLayout } from "@/components/layout/FormPageLayout";
import { VisitorForm } from "@/components/forms/VisitorForm";

export const metadata = pageMetadata({
  title: "Visitor Registration",
  description:
    "Register to visit the Nepal Poultry & Livestock International Expo in Kathmandu and receive the confirmed dates and visitor information by e-mail.",
  path: "/register/visitor",
});

export default function VisitorRegistrationPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Visitors", path: "/visitors" },
          { name: "Visitor Registration", path: "/register/visitor" },
        ]}
        eyebrow="Visitor registration"
        title="Register to visit"
        intro="Register once and we will keep you informed — confirmed dates, venue details and visitor information."
      />
      <FormPageLayout
        formTitle="Your details"
        aside={
          <AsideCard title="Who should register">
            <p>Farmers, entrepreneurs, dealers, veterinarians, feed and equipment buyers, researchers and anyone working in poultry and livestock.</p>
            <p className="mt-3">
              <Link href="/visitors" className="font-semibold text-white underline underline-offset-2">
                See why people visit
              </Link>
              .
            </p>
          </AsideCard>
        }
      >
        <VisitorForm />
      </FormPageLayout>
    </>
  );
}
