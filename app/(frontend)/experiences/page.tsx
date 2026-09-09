import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import FigureRow from "@/components/FigureRow";
import FinalCTA from "@/components/FinalCTA";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import { getSiteContent } from "@/lib/getSiteContent";
import { experiencesPage as page } from "@/lib/pages";

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
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "What living in a Vakratunda development is actually like — the morning walk out, the hour after school, the terrace at eight, and what is standard in every scheme.",
  alternates: { canonical: "/experiences" },
};

export default async function ExperiencesPage() {
  const content = await getSiteContent();

  return (
    <PageShell nav={content.nav}>
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

      <FinalCTA content={content.finalCta} legal={content.legal} />
    </PageShell>
  );
}
