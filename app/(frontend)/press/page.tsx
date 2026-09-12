import type { Metadata } from "next";
import LedgerList from "@/components/LedgerList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import { getSiteContent } from "@/lib/getSiteContent";
import { pressPage as page } from "@/lib/pages";

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
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Press Room",
  description:
    "Coverage of Vakratunda Group's projects, joint ventures and community work, and direct contacts for media enquiries.",
  alternates: { canonical: "/press" },
};

export default async function PressRoomPage() {
  const content = await getSiteContent();

  return (
    <PageShell
      nav={content.nav}
      close={{ content: content.finalCta, legal: content.legal }}
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
