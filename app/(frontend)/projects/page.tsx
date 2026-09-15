import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import ProjectGrid from "@/components/ProjectGrid";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Our Projects.
 *
 * THE SAME ARRAY THE LANDING PAGE SCROLLS THROUGH. `site.gallery.slides` is
 * read here unchanged, so the `projects` collection is the single source for
 * both surfaces and a project added in /admin appears on each without being
 * entered twice. The chrome around it is the `projects-page` global.
 *
 * The field is on cream: fourteen photographs on navy would be fourteen lit
 * rectangles on a dark ground with no relief between them, and the landing
 * page already establishes cream as the ground the work is examined on.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("projects", "/projects");
}

export default async function ProjectsPage() {
  const { site, page } = await getStandingPage("projects");

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection id="projects" ground="cream" size="lg">
        <ProjectGrid
          slides={site.gallery.slides}
          filterLabel={page.filterLabel}
          allLabel={page.allLabel}
          emptyMessage={page.emptyMessage}
          note={page.note}
        />
      </PageSection>
    </PageShell>
  );
}
