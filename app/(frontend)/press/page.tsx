import type { Metadata } from "next";
import LedgerList from "@/components/LedgerList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Press Room.
 *
 * Two ledgers: what has been written, and how to reach someone who can answer.
 * The second is what a journalist on a deadline actually came for, so it is on
 * the cream — the ground this site uses when it wants something examined — and
 * every row in it is a live address rather than a form.
 *
 * The coverage entries are placeholders and carry no `href`; see the notice at
 * the head of lib/pages/newsroom.ts.
 *
 * Content: the `press-page` global over lib/pages/newsroom.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("press", "/press");
}

export default async function PressRoomPage() {
  const { site, page } = await getStandingPage("press");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="coverage"
        label={page.coverage.label}
        heading={page.coverage.heading}
        standfirst={page.coverage.standfirst}
      >
        <div className="u-shell">
          <LedgerList entries={page.coverage.entries} note={page.coverage.note} />
        </div>
      </PageSection>

      <PageSection
        id="enquiries"
        ground="cream"
        size="lg"
        heading={page.enquiries.heading}
        standfirst={page.enquiries.standfirst}
      >
        <div className="u-shell">
          <LedgerList entries={page.enquiries.entries} />
        </div>
      </PageSection>
    </PageShell>
  );
}
