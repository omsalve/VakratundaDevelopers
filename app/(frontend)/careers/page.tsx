import type { Metadata } from "next";
import CareersAscent from "@/components/pages/careers/CareersAscent";
import CareersEntry from "@/components/pages/careers/CareersEntry";
import CareersHero from "@/components/pages/careers/CareersHero";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Careers — THE ASCENT.
 *
 * A drawn arch to stand in, a staircase of principles that steps down and
 * across, a slim rail of figures closing the flight, then the open roles and a
 * stepper laid horizontally across the foot of the page.
 *
 * WHY IT IS NOT /investors. Under the old template these two were the same
 * page: `PageHero`, `CardGrid`, `StatRow`, `LedgerList`, `CardGrid`. They now
 * differ on the one axis that matters — what the reader came for. An investor
 * came for the record, so /investors opens on figures set larger than its own
 * title. Somebody considering a job came to picture themselves here, so this
 * page opens on a doorway and keeps its figures deliberately small and late.
 *
 * TWO FIGURES, IN ORDER: a vertical one for the climb, a horizontal one for
 * the walk through the door. Every other set of steps on this site descends;
 * the hiring process is the one that runs across, because it is short and
 * finite and seeing all of it at once is the point.
 *
 * Content: the `careers-page` global over lib/pages/people.ts, shape untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("careers", "/careers");
}

export default async function CareersPage() {
  const { site, page } = await getStandingPage("careers");

  return (
    <PageShell
      page="careers"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <CareersHero content={page.hero} />

      <CareersAscent
        label={page.culture.label}
        heading={page.culture.heading}
        standfirst={page.culture.standfirst}
        items={page.culture.items}
        stats={page.stats}
      />

      <CareersEntry roles={page.roles} process={page.process} />
    </PageShell>
  );
}
