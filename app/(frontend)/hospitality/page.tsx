import type { Metadata } from "next";
import BrandStory from "@/components/BrandStory";
import CardGrid from "@/components/CardGrid";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import StatRow from "@/components/StatRow";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Hospitality.
 *
 * The argument, then what it is made of, then the record behind it — which is
 * the order the landing page makes every argument in. BrandStory carries the
 * first, because this is a page about a practice rather than a portfolio, and
 * a practice is a story with one photograph, not a grid.
 *
 * Content: the `hospitality-page` global over lib/pages/living.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("hospitality", "/hospitality");
}

export default async function HospitalityPage() {
  const { site, page } = await getStandingPage("hospitality");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection id="practice" label={page.story.label}>
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
    </PageShell>
  );
}
