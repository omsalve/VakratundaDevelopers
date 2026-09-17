import type { Metadata } from "next";
import AboutHero from "@/components/pages/about/AboutHero";
import AboutStations from "@/components/pages/about/AboutStations";
import AboutThread from "@/components/pages/about/AboutThread";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * About Us — THE UNBROKEN LINE.
 *
 * The page's identity is a single rose line that enters from above the fold,
 * runs down the left edge through every section, breaks exactly once for the
 * pullquote, and carries on through the change of ground into the cream band
 * at the foot. Nothing else on the site does this, and nothing else on this
 * page competes with it.
 *
 * WHY THIS AND NOT SOMETHING ELSE: the one thing /about has to say is that the
 * practice has been continuous since 1973. A hero, two card grids and a coda —
 * which is what this page was, and what every other page was — cannot say that,
 * because a grid has no direction and a page assembled from bands has no
 * through-line. The line is the argument.
 *
 * THE CONTENT IS UNCHANGED. `getStandingPage("about")` reads the same
 * `about-page` global over the same lib/pages/standing.ts fallback, and the
 * shapes in lib/pages/types.ts are untouched — a StoryContent and four
 * CardItems, presented as a threaded story and four stations instead of as a
 * two-column band and a card grid. Nothing has to be re-entered in /admin.
 *
 * A Server Component; the three sections below are client components because
 * each owns its own GSAP scope.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("about", "/about");
}

export default async function AboutPage() {
  const { site, page } = await getStandingPage("about");

  return (
    <PageShell
      page="about"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <AboutHero content={page.hero} />

      <AboutThread content={page.story} />

      <AboutStations
        heading={page.principles.heading}
        standfirst={page.principles.standfirst}
        items={page.principles.items}
      />
    </PageShell>
  );
}
