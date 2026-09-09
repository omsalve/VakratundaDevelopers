import type { Metadata } from "next";
import BrandStory from "@/components/BrandStory";
import CardGrid from "@/components/CardGrid";
import FinalCTA from "@/components/FinalCTA";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import { getSiteContent } from "@/lib/getSiteContent";
import { aboutPage } from "@/lib/pages";

/**
 * About Us.
 *
 * Three movements and the close, on the landing page's own cadence: the
 * opening frame on navy, the story on navy so the photograph stays lit, then
 * the commitments on cream — the page's one ground change, because the
 * landing page's rule is that the ground changes rarely enough to stay an
 * event. FinalCTA cuts back to navy exactly where it always does.
 *
 * A Server Component: `getSiteContent` supplies the masthead and the close, so
 * a nav link or a contact address edited in /admin changes here too, and none
 * of it is written twice.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description:
    "Vakratunda Group has built in Mumbai since 1973 — 2.1 million sq. ft. delivered, 2,500+ families moved in, and a second generation still signing the drawings.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <PageShell nav={content.nav}>
      <PageHero content={aboutPage.hero} />

      <PageSection
        id="story"
        label="The practice"
        heading={aboutPage.story.heading}
        standfirst={aboutPage.story.standfirst}
      >
        <BrandStory content={aboutPage.story} />
      </PageSection>

      <PageSection
        id="principles"
        ground="cream"
        size="lg"
        heading={aboutPage.principles.heading}
        standfirst={aboutPage.principles.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={aboutPage.principles.items} columns={2} />
        </div>
      </PageSection>

      <FinalCTA content={content.finalCta} legal={content.legal} />
    </PageShell>
  );
}
