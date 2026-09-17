import type { Metadata } from "next";
import SustainabilityHero from "@/components/pages/sustainability/SustainabilityHero";
import SustainabilityStem from "@/components/pages/sustainability/SustainabilityStem";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Sustainability — WHAT GROWS.
 *
 * The page's identity is a stem. It breaks the hero's ground line, runs down
 * the centre of the field, and puts out a curved branch to each of the four
 * practices in turn. Nothing else on this site curves: /about rules a straight
 * line down its left edge and /nri-corner rules a straight border down its
 * middle, because a rope and a border are drawn with a straightedge. A stem is
 * not, and that single difference in how the line is drawn is what separates
 * this page from the two it would otherwise most resemble.
 *
 * IT IS ALSO THE ONLY PAGE ON THE SITE THAT IS SYMMETRICAL. The head is
 * centred, the practices alternate about the stem. Every other page on the
 * site ranges left.
 *
 * LIT, NOT DARK. identity.css gives this page cream from the first pixel, and
 * the landing page's rule that a change of ground is an event is kept: the
 * event is arriving here at all.
 *
 * Content: the `sustainability-page` global over lib/pages/standing.ts, with
 * the CardBand shape in lib/pages/types.ts untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("sustainability", "/sustainability");
}

export default async function SustainabilityPage() {
  const { site, page } = await getStandingPage("sustainability");

  return (
    <PageShell
      page="sustainability"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <SustainabilityHero content={page.hero} />

      <SustainabilityStem
        label={page.environment.label}
        heading={page.environment.heading}
        lead={page.environment.lead}
        items={page.environment.items}
        coda={page.coda}
        cta={page.cta}
      />
    </PageShell>
  );
}
