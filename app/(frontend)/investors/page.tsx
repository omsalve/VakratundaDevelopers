import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import FinalCTA from "@/components/FinalCTA";
import LedgerList from "@/components/LedgerList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import StatRow from "@/components/StatRow";
import { getSiteContent } from "@/lib/getSiteContent";
import { investorsPage as page } from "@/lib/pages";

/**
 * Investor Relations.
 *
 * The figures, what stands behind them, then what is actually available and on
 * what terms. The group is private, so the third band is the honest one: every
 * document row carries a state — on request, under NDA — instead of an `href`
 * pointing at a PDF that does not exist, which is what an investor page for a
 * private company usually does.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Investor Relations",
  description:
    "Vakratunda Group's delivery record, governance and joint venture standing — 2.1 million sq. ft. delivered since 1973, triple ISO certified, MCHI-CREDAI member.",
  alternates: { canonical: "/investors" },
};

export default async function InvestorsPage() {
  const content = await getSiteContent();

  return (
    <PageShell nav={content.nav}>
      <PageHero content={page.hero} />

      <PageSection id="record" label="The record">
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
          <SectionCoda
            text="Everything above is supplied by a named person, in a conversation, with the assumptions attached to it."
            cta={page.cta}
          />
        </div>
      </PageSection>

      <FinalCTA content={content.finalCta} legal={content.legal} />
    </PageShell>
  );
}
