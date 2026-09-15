import type { Metadata } from "next";
import BrandStory from "@/components/BrandStory";
import CardGrid from "@/components/CardGrid";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * About Us.
 *
 * Three movements and the close, on the landing page's own cadence: the
 * opening frame on navy, the story on navy so the photograph stays lit, then
 * the commitments on cream — the page's one ground change, because the
 * landing page's rule is that the ground changes rarely enough to stay an
 * event. The shell closes over it in navy exactly where the close always
 * did.
 *
 * A Server Component: the page reads the `about-page` global over the copy in
 * lib/pages/standing.ts, and the masthead and the close from `home`, so a nav
 * link or a contact address edited in /admin changes here too, and none of it
 * is written twice.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("about", "/about");
}

export default async function AboutPage() {
  const { site, page } = await getStandingPage("about");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="story"
        label={page.story.label}
        heading={page.story.heading}
        standfirst={page.story.standfirst}
      >
        <BrandStory content={page.story} />
      </PageSection>

      <PageSection
        id="principles"
        ground="cream"
        size="lg"
        heading={page.principles.heading}
        standfirst={page.principles.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.principles.items} columns={2} />
        </div>
      </PageSection>
    </PageShell>
  );
}
