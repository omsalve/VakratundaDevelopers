import type { Metadata } from "next";
import AwardsCabinet from "@/components/pages/awards/AwardsCabinet";
import AwardsHero from "@/components/pages/awards/AwardsHero";
import AwardsLedger from "@/components/pages/awards/AwardsLedger";
import AwardsSpotlight from "@/components/pages/awards/AwardsSpotlight";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Awards — THE CABINET.
 *
 * The deepest ground on the site (navy-900, set in identity.css), a slowly
 * turning drawn seal behind the opening, four certifications as seals in a
 * case, and the citations out on cream below.
 *
 * THE WHOLE ROUTE IS THE LIT CASE. `AwardsSpotlight` tracks the pointer across
 * every screen of it rather than over one band in the middle, which is what a
 * cabinet does — you move, and the light on the glass moves with you. It sits
 * outside <main> and lights all three sections; see the component.
 *
 * THE ORDER IS REVERSED FROM THE OLD PAGE, deliberately. It used to lead with
 * the award citations. The page's own closing line — "An award celebrates a
 * good year. A certificate is earned again every year" — argues the opposite,
 * and the old route comment claimed the certifications were "the page's
 * argument" while the layout put them second. They now lead.
 *
 * ⚠️ THE AWARD ENTRIES ARE PLACEHOLDERS and carry no `href`; see the notice at
 * the head of lib/pages/newsroom.ts. The arrangement is built so that if they
 * were deleted tomorrow the page would still open on four verifiable standings
 * and still stand up — which is the test the old ordering claimed to pass and
 * this one actually does.
 *
 * Content: the `awards-page` global over lib/pages/newsroom.ts, shape
 * untouched — a LedgerBand and four CardItems.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("awards", "/awards");
}

export default async function AwardsPage() {
  const { site, page } = await getStandingPage("awards");

  return (
    <PageShell
      page="awards"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <AwardsSpotlight />

      <AwardsHero content={page.hero} />

      <AwardsCabinet
        label={page.certifications.label}
        heading={page.certifications.heading}
        standfirst={page.certifications.standfirst}
        items={page.certifications.items}
      />

      <AwardsLedger band={page.awards} coda={page.coda} />
    </PageShell>
  );
}
