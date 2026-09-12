import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import LedgerList from "@/components/LedgerList";
import OfficePanel from "@/components/OfficePanel";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import { getSiteContent } from "@/lib/getSiteContent";
import { contactPage as page } from "@/lib/pages";

/**
 * Contact Us.
 *
 * THREE WAYS IN, IN ORDER OF DIRECTNESS: the channels, which open an email
 * with its subject already set; the form, for a visitor who would rather be
 * asked what to say than compose it; and the office itself.
 *
 * ⚠️ THE FORM COMPOSES, IT DOES NOT POST — the project has no submission
 * endpoint, and a form that silently drops what a society committee writes
 * into it is worse than no form at all. See the notice at the head of
 * components/ContactForm.tsx. Wiring a real one is a Payload collection and a
 * server action, and it should happen before launch.
 *
 * The office email comes from `content.finalCta.contact`, which is the same
 * address the footer publishes and is editable in /admin — so the page cannot
 * end up offering a different address from the one the site closes on.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach Vakratunda Group's office in Bandra East — enquiries about buying, society redevelopment, land and joint development, or working with the group.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <PageShell
      nav={content.nav}
      close={{ content: content.finalCta, legal: content.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="channels"
        label={page.channels.label}
        heading={page.channels.heading}
        standfirst={page.channels.standfirst}
      >
        <div className="u-shell">
          <LedgerList
            entries={page.channels.entries}
            note={page.channels.note}
          />
        </div>
      </PageSection>

      <PageSection id="enquiry" ground="cream" size="lg">
        <ContactForm
          email={content.finalCta.contact.email}
          label={page.form.label}
          heading={page.form.heading}
          standfirst={page.form.standfirst}
          note={page.form.note}
        />
      </PageSection>

      <PageSection
        id="office"
        ground="cream"
        divider
        label={page.office.label}
        heading={page.office.heading}
        standfirst={page.office.standfirst}
      >
        <OfficePanel
          office={page.office}
          email={content.finalCta.contact.email}
        />
      </PageSection>
    </PageShell>
  );
}
