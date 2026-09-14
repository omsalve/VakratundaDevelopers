import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import PostGrid from "@/components/PostGrid";
import { getBlogPosts } from "@/lib/getBlogPosts";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Blogs.
 *
 * THE FIELD IS ProjectGrid'S, NOT A NEW ONE. Each article is a frame, the
 * date and category on the hairline under it, the title, the excerpt — the
 * same card the portfolio uses, on the same two-rate entrance.
 *
 * ⚠️ THE SHIPPED PHOTOGRAPHS ARE THE GROUP'S OWN PROJECTS, standing in as
 * editorial imagery for the subject each piece covers rather than illustrating
 * a specific claim in it. They are not stock. Articles published in /admin
 * carry their own card photograph.
 *
 * Content: the articles are the `posts` collection (lib/getBlogPosts.ts); the
 * chrome around them is the `blog-page` global. Every card goes somewhere
 * real, because /blogs/[slug] reads the same source.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("blog", "/blogs");
}

export default async function BlogsPage() {
  const [{ site, page }, posts] = await Promise.all([
    getStandingPage("blog"),
    getBlogPosts(),
  ]);

  return (
    <PageShell
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="articles"
        ground="cream"
        size="lg"
        label={page.listing.label}
        heading={page.listing.heading}
        standfirst={page.listing.standfirst}
      >
        <div className="u-shell">
          <PostGrid posts={posts} note={page.note} />
        </div>
      </PageSection>
    </PageShell>
  );
}
