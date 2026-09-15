import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import FigureRow from "@/components/FigureRow";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Experiences.
 *
 * THE PHOTOGRAPHS LEAD, and the page is arranged so they can: the day band
 * opens with four frames and reads its argument off them, rather than setting
 * four claims and illustrating each one. On a page about what a building feels
 * like, type that arrives before the picture is a caption written in advance.
 *
 * The second band has no photographs and takes none. What is standard in every
 * scheme is a set of decisions, not a set of rooms — and this site's rule is
 * that a filled shape is evidence, so a band with no evidence shows none.
 *
 * Content: the `experiences-page` global over lib/pages/living.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("experiences", "/experiences");
}

export default async function ExperiencesPage() {
  const { site, page } = await getStandingPage("experiences");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="day"
        label={page.day.label}
        heading={page.day.heading}
        standfirst={page.day.standfirst}
      >
        <div className="u-shell">
          <FigureRow figures={page.day.figures} />
          <CardGrid items={page.day.items} columns={2} />
        </div>
      </PageSection>

      <PageSection
        id="standard"
        ground="cream"
        size="lg"
        label={page.standard.label}
        heading={page.standard.heading}
        standfirst={page.standard.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.standard.items} columns={2} />
          <SectionCoda text={page.coda} cta={page.cta} />
        </div>
      </PageSection>
    </PageShell>
  );
}
