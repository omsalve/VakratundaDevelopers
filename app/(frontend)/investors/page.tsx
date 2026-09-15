import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import LedgerList from "@/components/LedgerList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import StatRow from "@/components/StatRow";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Investor Relations.
 *
 * The figures, what stands behind them, then what is actually available and on
 * what terms. The group is private, so the third band is the honest one: every
 * document row carries a state — on request, under NDA — instead of an `href`
 * pointing at a PDF that does not exist, which is what an investor page for a
 * private company usually does.
 *
 * Content: the `investors-page` global over lib/pages/investing.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("investors", "/investors");
}

export default async function InvestorsPage() {
  const { site, page } = await getStandingPage("investors");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection id="record" label={page.statsLabel}>
        <div className="u-shell">
          <StatRow stats={page.stats} />
        </div>
      </PageSection>

      <PageSection
        id="governance"
        ground="cream"
        size="lg"
        label={page.governance.label}
        heading={page.governance.heading}
        standfirst={page.governance.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.governance.items} columns={2} />
        </div>
      </PageSection>

      <PageSection
        id="documents"
        ground="cream"
        divider
        label={page.documents.label}
        heading={page.documents.heading}
        standfirst={page.documents.standfirst}
      >
        <div className="u-shell">
          <LedgerList
            entries={page.documents.entries}
            note={page.documents.note}
          />
          <SectionCoda text={page.coda} cta={page.cta} />
        </div>
      </PageSection>
    </PageShell>
  );
}
