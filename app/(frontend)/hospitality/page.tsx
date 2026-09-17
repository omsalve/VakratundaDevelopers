import type { Metadata } from "next";
import HospitalityCorridor from "@/components/pages/hospitality/HospitalityCorridor";
import HospitalityHero from "@/components/pages/hospitality/HospitalityHero";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Hospitality — THE CORRIDOR.
 *
 * A split opening — copy on one side, the dining room running floor to ceiling
 * and bleeding off the other — then the practice as a typographic spread, then
 * the four spaces travelling SIDEWAYS while the page is scrolled down, then
 * the record on cream.
 *
 * THE PHOTOGRAPH DECIDED THE OPENING. It is shot portrait (941 × 1672), which
 * is the wrong shape for the plates and full-bleed bands every other page uses
 * and exactly the right shape for a column the height of the screen. So the
 * page's one picture is spent there, and the story band below carries none —
 * the same `StoryContent`, re-allocated, with its shape in lib/pages/types.ts
 * untouched.
 *
 * THE CORRIDOR IS THE ONLY SECTION ON THE SITE WHOSE CONTENT MOVES SIDEWAYS.
 * /projects has a strip that leafs horizontally, but that is decoration behind
 * a masthead and every frame in it reappears as a real card below. Here the
 * spaces themselves pass through a held stage, which is what walking a service
 * corridor is — and it is built on `position: sticky` rather than a
 * ScrollTrigger pin, because a pin uses `position: fixed` and this lives inside
 * the transformed <main> that PageShell warns about.
 *
 * It collapses to an ordinary stack below 62rem and under reduced motion. On a
 * touch device a horizontal track fights the browser's own back gesture, and
 * with no tween running the spaces would be stranded outside a clipped stage.
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
      page="hospitality"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <HospitalityHero content={page.hero} image={page.story.image} />

      <HospitalityCorridor
        story={page.story}
        offer={page.offer}
        stats={page.stats}
        coda={page.coda}
        cta={page.cta}
      />
    </PageShell>
  );
}
