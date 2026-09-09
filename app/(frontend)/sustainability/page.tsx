import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import FigureRow from "@/components/FigureRow";
import FinalCTA from "@/components/FinalCTA";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import { getSiteContent } from "@/lib/getSiteContent";
import { sustainabilityPage as page } from "@/lib/pages";

/**
 * Sustainability.
 *
 * The landing page's responsibility band, given its full length: the same two
 * ledgers in the same order — the ground the work stands on, then the towns it
 * goes up among — and the same coda closing both.
 *
 * THE ORDER IS REVERSED FROM THE LANDING PAGE, and deliberately. There the
 * community band leads and the environment is a footing under it, because the
 * page is arguing that the schools outweigh the practices. A visitor who has
 * navigated to /sustainability has already asked the environmental question,
 * so it is answered first and the community ledger is given equal weight
 * rather than being made the footing of a page it is half of.
 *
 * ONE GROUND CHANGE: the environment ledger takes the cream, as the drawings
 * do on the landing page; the community ledger stays on it; FinalCTA cuts back
 * to navy where it always does.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "IGBC and LEED-aligned building practice, and the schools and commitments Vakratunda Group runs alongside it in the towns it builds in.",
  alternates: { canonical: "/sustainability" },
};

export default async function SustainabilityPage() {
  const content = await getSiteContent();

  return (
    <PageShell nav={content.nav}>
      <PageHero content={page.hero} />

      <PageSection
        id="environment"
        ground="cream"
        size="lg"
        label={page.environment.label}
        heading={{ before: "The ground it ", swash: "stands", after: " on" }}
        standfirst={page.environment.lead}
      >
        <div className="u-shell">
          <CardGrid items={page.environment.items} columns={2} />
        </div>
      </PageSection>

      <PageSection
        id="community"
        ground="cream"
        divider
        label={page.social.label}
        heading={{ before: "The towns it ", swash: "builds", after: " among" }}
        standfirst={page.social.lead}
      >
        <div className="u-shell">
          {/* The evidence, before the ledger that reads off it. */}
          {page.social.figures ? (
            <FigureRow figures={page.social.figures} />
          ) : null}

          <CardGrid items={page.social.items} columns={2} />

          {/* The one sentence that covers both ledgers, so it closes the
              second rather than sitting inside it — the same coda the landing
              page's responsibility band ends on. */}
          <SectionCoda text={page.coda} cta={page.cta} />
        </div>
      </PageSection>

      <FinalCTA content={content.finalCta} legal={content.legal} />
    </PageShell>
  );
}
