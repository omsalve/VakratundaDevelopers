import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import LedgerList from "@/components/LedgerList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import StatRow from "@/components/StatRow";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Careers.
 *
 * WHAT THE JOB IS LIKE COMES BEFORE WHAT IS OPEN. A careers page that opens on
 * a vacancy list is written for the person already applying; this one is
 * written for the engineer who is good at their current job and has not
 * decided to leave it, which is the person worth reaching.
 *
 * The disciplines are placeholders standing in for live vacancies, and each
 * one routes to a real address at the office rather than to a tracking system
 * the group does not run — see the notice at the head of lib/pages/people.ts.
 *
 * Content: the `careers-page` global over lib/pages/people.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("careers", "/careers");
}

export default async function CareersPage() {
  const { site, page } = await getStandingPage("careers");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="culture"
        label={page.culture.label}
        heading={page.culture.heading}
        standfirst={page.culture.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.culture.items} columns={2} />
        </div>
      </PageSection>

      <PageSection id="scale" divider>
        <div className="u-shell">
          <StatRow stats={page.stats} />
        </div>
      </PageSection>

      <PageSection
        id="roles"
        ground="cream"
        size="lg"
        label={page.roles.label}
        heading={page.roles.heading}
        standfirst={page.roles.standfirst}
      >
        <div className="u-shell">
          <LedgerList entries={page.roles.entries} note={page.roles.note} />
        </div>
      </PageSection>

      <PageSection
        id="process"
        ground="cream"
        divider
        label={page.process.label}
        heading={page.process.heading}
        standfirst={page.process.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.process.items} columns={3} />
        </div>
      </PageSection>
    </PageShell>
  );
}
