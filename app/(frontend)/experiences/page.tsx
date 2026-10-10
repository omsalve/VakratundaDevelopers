import type { Metadata } from "next";
import ExperiencesHero from "@/components/pages/experiences/ExperiencesHero";
import ExperiencesPostcards from "@/components/pages/experiences/ExperiencesPostcards";
import ExperiencesSpaces from "@/components/pages/experiences/ExperiencesSpaces";
import ExperiencesStandard from "@/components/pages/experiences/ExperiencesStandard";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Experiences — POSTCARDS FROM HOME.
 *
 * The page is a stack of postcards, all from the same golden hour. It opens on
 * the first one held up to the light — the roof pool on its cream stock, the
 * headline lettered across the sky. Then the pile: six moments a home is
 * built for, each a card whose front is the photograph with its one-word name
 * lettered over it and whose back is the copy, stamped with the group's mark
 * and postmarked Mumbai, since 1973. The visitor deals through it by hand;
 * nothing is driven by the scroll. Under it, the rack: every other space the
 * residents share, a card each, at the shape of its own photograph.
 *
 * It is still the ONLY page on the site where type sits over a photograph —
 * everywhere else a photograph is a plate with its caption underneath — and
 * the postcard is where that device comes from.
 *
 * Then the ground changes once, to cream, for the specification: what is true
 * of every home whatever the moment, set as a ruled schedule with no
 * photography and nothing moving. After the cards on the night ground it
 * reads as the lights coming up.
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
      page="experiences"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <ExperiencesHero content={page.hero} />

      <ExperiencesPostcards
        label={page.day.label}
        heading={page.day.heading}
        standfirst={page.day.standfirst}
        items={page.day.items}
        figures={page.day.figures}
      />

      <ExperiencesSpaces
        label={page.spaces.label}
        heading={page.spaces.heading}
        standfirst={page.spaces.standfirst}
        figures={page.spaces.figures}
      />

      <ExperiencesStandard
        label={page.standard.label}
        heading={page.standard.heading}
        standfirst={page.standard.standfirst}
        items={page.standard.items}
        coda={page.coda}
        cta={page.cta}
      />
    </PageShell>
  );
}
