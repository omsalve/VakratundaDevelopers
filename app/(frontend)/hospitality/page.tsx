import type { Metadata } from "next";
import BrandStory from "@/components/BrandStory";
import CardGrid from "@/components/CardGrid";
import FinalCTA from "@/components/FinalCTA";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import StatRow from "@/components/StatRow";
import { getSiteContent } from "@/lib/getSiteContent";
import { hospitalityPage as page } from "@/lib/pages";

/**
 * Hospitality.
 *
 * The argument, then what it is made of, then the record behind it — which is
 * the order the landing page makes every argument in. BrandStory carries the
 * first, because this is a page about a practice rather than a portfolio, and
 * a practice is a story with one photograph, not a grid.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hospitality",
  description:
    "Food and beverage space inside Vakratunda's own developments — designed into the podium at structural stage and run to the standard of the building above it.",
  alternates: { canonical: "/hospitality" },
};

export default async function HospitalityPage() {
  const content = await getSiteContent();

  return (
    <PageShell nav={content.nav}>
      <PageHero content={page.hero} />

      <PageSection id="practice" label="The practice">
        <BrandStory content={page.story} />
      </PageSection>

      <PageSection
        id="offer"
        ground="cream"
        size="lg"
        label={page.offer.label}
        heading={page.offer.heading}
        standfirst={page.offer.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.offer.items} columns={2} />
        </div>
      </PageSection>

      <PageSection id="record" ground="cream" divider>
        <div className="u-shell">
          <StatRow stats={page.stats} />
          <SectionCoda text={page.coda} cta={page.cta} />
        </div>
      </PageSection>

      <FinalCTA content={content.finalCta} legal={content.legal} />
    </PageShell>
  );
}
