import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How the Nepal Poultry & Livestock International Expo website collects, uses and protects information submitted through its forms.",
  path: "/privacy-policy",
});

const UPDATED = "21 November 2026";

/*
 * NOTE FOR THE ORGANISERS: this notice describes what the website actually does with
 * form data. It has not been reviewed by a lawyer — please have it checked before launch.
 */
export default function PrivacyPolicyPage() {
  const organisers = siteConfig.organisers.map((o) => o.name).join(" and ");
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ]}
        title="Privacy Policy"
        intro={`Last updated ${UPDATED}`}
      />
      <Section tone="white">
        <article className="container-site max-w-3xl text-[1.0625rem] leading-relaxed text-ink-700 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-ink-900 [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
          <p className="mt-0!">
            This notice explains how {siteConfig.name} (“the expo”, “we”), organised by {organisers}, handles the
            information you give us through this website.
          </p>

          <h2>Information we collect</h2>
          <p>When you use one of our forms we collect the details you enter:</p>
          <ul>
            <li>
              <strong>Exhibitor registration:</strong> company name, contact person, designation, mobile/WhatsApp number,
              e-mail address, country, products and services, and preferred booth size.
            </li>
            <li>
              <strong>Visitor registration:</strong> full name, company or organisation, designation, mobile/WhatsApp
              number, e-mail address, business category and country.
            </li>
            <li>
              <strong>Contact enquiry:</strong> full name, company name, country, business e-mail, mobile/WhatsApp number,
              area of interest and your message.
            </li>
            <li>
              <strong>Brochure request:</strong> full name, company name, country, business e-mail, mobile/WhatsApp
              number and your consent.
            </li>
          </ul>
          <p>
            We also record the page the form was sent from, the time of submission, your browser&apos;s user-agent and a
            one-way scrambled (hashed) version of your IP address. We use these only to prevent spam and abuse; we do not
            store your IP address itself.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>to process your exhibitor or visitor registration and contact you about it;</li>
            <li>to answer your enquiry;</li>
            <li>to send you the brochure you requested;</li>
            <li>to send you information about the expo that relates to your request, such as confirmed dates;</li>
            <li>to protect the website and its forms from spam and automated abuse.</li>
          </ul>
          <p>We do not sell your information or share it with third parties for their own marketing.</p>

          <h2>Where it is stored and who processes it</h2>
          <p>
            Submissions are stored in a secured MongoDB Atlas database, copied to the organisers&apos; Google Sheets
            workbook and sent by e-mail to the organising team through Google&apos;s Gmail service. Access is limited to
            the people who organise the expo. These service providers process the data on our behalf.
          </p>

          <h2>Google reCAPTCHA</h2>
          <p>
            Our forms are protected by Google reCAPTCHA to check that submissions come from a person. reCAPTCHA collects
            hardware and software information, such as device and application data, and sends it to Google for analysis.
            Its use is subject to the Google{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
              Terms of Service
            </a>
            . The reCAPTCHA check only loads on pages that contain a form.
          </p>

          <h2>Cookies</h2>
          <p>
            This website does not use advertising or analytics cookies. Google reCAPTCHA may set its own cookies when a
            form is displayed, as described in Google&apos;s policies.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep submissions for as long as they are needed to organise the expo and follow up on your request, and
            delete them when they are no longer required or when you ask us to.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask to see, correct or delete the information you have sent us, or ask us to stop contacting you, at
            any time. Use the{" "}
            <Link href="/contact" className="font-medium text-brand-700 underline underline-offset-2">
              contact form
            </Link>{" "}
            and select “General Enquiry”, or reply to any e-mail you receive from us.
          </p>

          <h2>Changes to this notice</h2>
          <p>If we change how we handle your information we will update this page and the date at the top.</p>
        </article>
      </Section>
    </>
  );
}
