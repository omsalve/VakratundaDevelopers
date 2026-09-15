import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Sustainability.
 *
 * The landing page's responsibility band, given its full length: the four
 * practices the group builds to, each opened out from its one line into what
 * it actually changes on a site, and the same coda closing them.
 *
 * ONE LEDGER, NOT TWO. This page used to carry a community ledger beside the
 * environmental one, built around Vihaa International School. The school is a
 * joint venture, and it has its own section on the landing page after the
 * ventures; a stake the group holds is not a line in what it owes, so it is
 * not restated here.
 *
 * Content: the `sustainability-page` global over lib/pages/standing.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("sustainability", "/sustainability");
}

export default async function SustainabilityPage() {
  const { site, page } = await getStandingPage("sustainability");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="environment"
        ground="cream"
        size="lg"
        label={page.environment.label}
        heading={page.environment.heading}
        standfirst={page.environment.lead}
      >
        <div className="u-shell">
          <CardGrid items={page.environment.items} columns={2} />

          {/* The same coda the landing page's responsibility band ends on. */}
          <SectionCoda text={page.coda} cta={page.cta} />
        </div>
      </PageSection>
    </PageShell>
  );
}
