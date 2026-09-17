import type { Metadata } from "next";
import ExperiencesHero from "@/components/pages/experiences/ExperiencesHero";
import ExperiencesHours from "@/components/pages/experiences/ExperiencesHours";
import ExperiencesStandard from "@/components/pages/experiences/ExperiencesStandard";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Experiences — THE HOURS.
 *
 * THE CONTENT ALREADY KNEW WHAT THIS PAGE WAS. Every moment's `eyebrow` is a
 * clock time — 07:40, and so on — and the old page set those as a small caps
 * label in the corner of a card in a two-column grid, which is the one
 * arrangement that throws away the fact that they are times at all.
 *
 * So the day is the page: four full-bleed photographs, each with its hour set
 * over it at display scale, alternating sides, with the ground lifting from
 * the night of the opening through the middle of the day and falling away
 * again. It is the ONLY page on the site where type sits over a photograph —
 * everywhere else a photograph is a plate with its caption underneath — and
 * that one rule is what makes it unmistakable at a glance.
 *
 * Then the ground changes once, to cream, for the specification: what is true
 * of every home whatever hour it is, set as a ruled schedule with no
 * photography and nothing moving. After four lit frames on deep navy that
 * reads as the lights coming up.
 *
 * FIGURES ARE PAIRED BY POSITION AND NEITHER SIDE IS ASSUMED — a moment with
 * no photograph is set as a typographic band rather than borrowing a frame
 * that is not evidence of it.
 *
 * Content: the `experiences-page` global over lib/pages/living.ts, shape
 * untouched.
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

      <ExperiencesHours
        label={page.day.label}
        heading={page.day.heading}
        standfirst={page.day.standfirst}
        items={page.day.items}
        figures={page.day.figures}
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
