import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import ProjectGrid from "@/components/ProjectGrid";
import { getSiteContent } from "@/lib/getSiteContent";
import { projectsPage } from "@/lib/pages";

/**
 * Our Projects.
 *
 * THE SAME ARRAY THE LANDING PAGE SCROLLS THROUGH. `content.gallery.slides` is
 * read here unchanged, so the `projects` collection is the single source for
 * both surfaces and a project added in /admin appears on each without being
 * entered twice.
 *
 * The field is on cream: fourteen photographs on navy would be fourteen lit
 * rectangles on a dark ground with no relief between them, and the landing
 * page already establishes cream as the ground the work is examined on.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "Fourteen Vakratunda addresses across Mumbai, the suburbs and Thane — delivered, under construction and upcoming.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const content = await getSiteContent();

  return (
    <PageShell
      nav={content.nav}
      close={{ content: content.finalCta, legal: content.legal }}
    >
      <PageHero content={projectsPage.hero} />

      <PageSection id="projects" ground="cream" size="lg">
        <ProjectGrid
          slides={content.gallery.slides}
          filterLabel={projectsPage.filterLabel}
          allLabel={projectsPage.allLabel}
          emptyMessage={projectsPage.emptyMessage}
          note={projectsPage.note}
        />
      </PageSection>
    </PageShell>
  );
}
