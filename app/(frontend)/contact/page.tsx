import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import LedgerList from "@/components/LedgerList";
import OfficePanel from "@/components/OfficePanel";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

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
 * The office email comes from `site.finalCta.contact`, which is the same
 * address the footer publishes and is editable in /admin — so the page cannot
 * end up offering a different address from the one the site closes on.
 *
 * Content: the `contact-page` global over lib/pages/people.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contact", "/contact");
}

export default async function ContactPage() {
  const { site, page } = await getStandingPage("contact");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
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
          email={site.finalCta.contact.email}
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
          email={site.finalCta.contact.email}
        />
      </PageSection>
    </PageShell>
  );
}
