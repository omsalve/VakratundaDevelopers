import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import LedgerList from "@/components/LedgerList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Awards.
 *
 * THE CERTIFICATIONS ARE THE PAGE'S ARGUMENT, and the ordering says so: three
 * ISO standards and an MCHI-CREDAI membership are audited annually by somebody
 * outside the group, and an award is not. The verifiable half takes the cream —
 * the ground this site uses for evidence — and the citations sit above it.
 *
 * The award entries are placeholders and carry no `href`; see the notice at the
 * head of lib/pages/newsroom.ts. If they were deleted tomorrow this page would
 * still stand up, which is the test the arrangement was built to pass.
 *
 * Content: the `awards-page` global over lib/pages/newsroom.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("awards", "/awards");
}

export default async function AwardsPage() {
  const { site, page } = await getStandingPage("awards");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="recognition"
        label={page.awards.label}
        heading={page.awards.heading}
        standfirst={page.awards.standfirst}
      >
        <div className="u-shell">
          <LedgerList entries={page.awards.entries} note={page.awards.note} />
        </div>
      </PageSection>

      <PageSection
        id="certification"
        ground="cream"
        size="lg"
        label={page.certifications.label}
        heading={page.certifications.heading}
        standfirst={page.certifications.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.certifications.items} columns={2} />
          <SectionCoda text={page.coda} />
        </div>
      </PageSection>
    </PageShell>
  );
}
