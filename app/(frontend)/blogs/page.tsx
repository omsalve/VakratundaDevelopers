import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import PostGrid from "@/components/PostGrid";
import { getSiteContent } from "@/lib/getSiteContent";
import { blogPage as page } from "@/lib/pages";

/**
 * Blogs.
 *
 * THE FIELD IS ProjectGrid'S, NOT A NEW ONE. Each article is a frame, the
 * date and category on the hairline under it, the title, the excerpt — the
 * same card the portfolio uses, on the same two-rate entrance.
 *
 * ⚠️ THE PHOTOGRAPHS ARE THE GROUP'S OWN PROJECTS, standing in as editorial
 * imagery for the subject each piece covers rather than illustrating a
 * specific claim in it. They are not stock. When the office supplies proper
 * article imagery, swap `image` on each post — one edit each, same fields.
 *
 * Every card goes somewhere real, because /blogs/[slug] renders the same body.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Notes from Vakratunda's drawing office on society redevelopment, reading a RERA registration, and buying Indian property from abroad.",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
  const content = await getSiteContent();

  return (
    <PageShell
      nav={content.nav}
      close={{ content: content.finalCta, legal: content.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="articles"
        ground="cream"
        size="lg"
        label="Writing"
        heading={{ before: "Everything ", swash: "published", after: " so far" }}
        standfirst="Three pieces, each answering a question the office is asked most weeks."
      >
        <div className="u-shell">
          <PostGrid posts={page.posts} note={page.note} />
        </div>
      </PageSection>
    </PageShell>
  );
}
