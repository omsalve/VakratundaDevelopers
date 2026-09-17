import type { Metadata } from "next";
import ProjectsField from "@/components/pages/projects/ProjectsField";
import ProjectsIndexHero from "@/components/pages/projects/ProjectsIndexHero";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Our Projects — THE INDEX.
 *
 * The page's identity is a catalogue: lit from the first pixel, its contents
 * tallied above the fold, its entries set in a four-beat editorial rhythm
 * against a status rail that never scrolls away. It is the only page on the
 * site with a horizontal axis — the contact sheet leafs sideways as the page
 * scrolls down — and the only one that opens on cream with no hero frame at
 * all.
 *
 * WHY: /about has to argue that fifty years were continuous, so it is a line.
 * This page has to let somebody find one address among many, so it is an
 * index. Neither argument survives being put in the other's layout, which is
 * what the old shared `PageHero` + `PageSection` template did to both.
 *
 * THE SAME ARRAY THE LANDING PAGE SCROLLS. `site.gallery.slides` is read here
 * unchanged, so the `projects` collection is the single source for both
 * surfaces and a project added in /admin appears on each without being entered
 * twice. The chrome around it is still the `projects-page` global, and the
 * shape of both is untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("projects", "/projects");
}

export default async function ProjectsPage() {
  const { site, page } = await getStandingPage("projects");

  return (
    <PageShell
      page="projects"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <ProjectsIndexHero content={page.hero} slides={site.gallery.slides} />

      <ProjectsField
        slides={site.gallery.slides}
        filterLabel={page.filterLabel}
        allLabel={page.allLabel}
        emptyMessage={page.emptyMessage}
        note={page.note}
      />
    </PageShell>
  );
}
