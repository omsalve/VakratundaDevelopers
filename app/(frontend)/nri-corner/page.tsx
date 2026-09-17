import type { Metadata } from "next";
import NriCrossing from "@/components/pages/nri/NriCrossing";
import NriHero from "@/components/pages/nri/NriHero";
import NriQuestions from "@/components/pages/nri/NriQuestions";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * NRI Corner — THE CROSSING.
 *
 * The page's identity is a meridian down the CENTRE of the frame. The opening
 * sits on one side of it; the four stages start on that side and finish on the
 * other; the questions, once the crossing is made, take the full width and the
 * line is gone. A page about buying a home from eight thousand kilometres away
 * is a page about getting across something, and the layout is the crossing.
 *
 * WHY IT LOOKS NOTHING LIKE /about. That page also runs a line — but down the
 * LEFT edge, unbroken, as a rope to follow, because its argument is that
 * nothing has been interrupted since 1973. This line is a border in the middle
 * of the screen that the content has to change sides of. Same palette, same
 * face, same rose hairline, opposite meaning.
 *
 * THE ORDER IS KEPT FROM THE OLD PAGE, and for the old page's reason: the four
 * stages first, then the four questions. A visitor who lands here from another
 * time zone wants to know whether this is possible before they want to know how
 * it is taxed, and a page that opens with an FAQ has decided the opposite.
 *
 * Content: the `nri-page` global over lib/pages/investing.ts, with its shape in
 * lib/pages/types.ts untouched — four CardItems and four FaqItems, presented as
 * a crossing and a disclosure instead of as two card grids.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("nri", "/nri-corner");
}

export default async function NriCornerPage() {
  const { site, page } = await getStandingPage("nri");

  return (
    <PageShell
      page="nri"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <NriHero content={page.hero} />

      <NriCrossing
        label={page.steps.label}
        heading={page.steps.heading}
        standfirst={page.steps.standfirst}
        items={page.steps.items}
      />

      <NriQuestions
        label={page.faqs.label}
        heading={page.faqs.heading}
        standfirst={page.faqs.standfirst}
        items={page.faqs.items}
        disclaimer={page.disclaimer}
        cta={page.cta}
      />
    </PageShell>
  );
}
