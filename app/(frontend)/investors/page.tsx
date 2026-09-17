import type { Metadata } from "next";
import InvestorsRecord from "@/components/pages/investors/InvestorsRecord";
import InvestorsStatement from "@/components/pages/investors/InvestorsStatement";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Investor Relations — THE STATEMENT.
 *
 * The only page on the site whose opening is data. The figures are ruled
 * across the full width directly under the title and are set LARGER than it,
 * which is the correct hierarchy for a statement of account and the inverse of
 * every other page here. Then governance as a ruled schedule, and the
 * documents as a filing list.
 *
 * WHY NO CARDS ANYWHERE. This page previously ran `StatRow`, then a `CardGrid`
 * of governance commitments, then a `LedgerList` — the same three components
 * in the same order as /careers. An investor reads a register: terms in the
 * left column, what they mean in the right, ruled, scannable straight down.
 * Four floating cards make four independent claims of equal weight, which is
 * the wrong shape for a set of undertakings.
 *
 * THE FIGURES COUNT UP FROM THE MARKUP. `countUp` reads the value already in
 * the HTML and restores the authored string when it finishes, so the real
 * figure is what is served, indexed, and shown under reduced motion.
 *
 * Content: the `investors-page` global over lib/pages/investing.ts, shape
 * untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("investors", "/investors");
}

export default async function InvestorsPage() {
  const { site, page } = await getStandingPage("investors");

  return (
    <PageShell
      page="investors"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <InvestorsStatement
        content={page.hero}
        statsLabel={page.statsLabel}
        stats={page.stats}
      />

      <InvestorsRecord
        governance={page.governance}
        documents={page.documents}
        coda={page.coda}
        cta={page.cta}
      />
    </PageShell>
  );
}
