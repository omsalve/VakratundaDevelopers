import type { Metadata } from "next";
import BlogReadingRoom from "@/components/pages/blog/BlogReadingRoom";
import PageShell from "@/components/PageShell";
import { getBlogPosts } from "@/lib/getBlogPosts";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Blogs — THE READING ROOM.
 *
 * A contents page, not a gallery: one lead article opened out, then the rest
 * as ruled rows where the headline is the largest thing in the line and the
 * photograph is a thumbnail at the end of it.
 *
 * WHY IT IS NOT /projects. Those are the two lit pages on the site — both
 * cream from the first pixel, both a set of things with a picture each — and
 * under the old template both were a grid of identical cards. The difference
 * is what each set is judged on. A portfolio is judged on the buildings, so
 * /projects sets big frames in a four-beat rhythm and lets the photographs
 * carry it. A journal is judged on whether anything is worth reading, so this
 * page leads with headlines, dates and reading times, and the pictures come
 * last and small.
 *
 * THE LEAD IS SIMPLY THE NEWEST. `getBlogPosts` returns them in order and the
 * first is the lead, so there is no "featured" flag in the CMS that can
 * disagree with the ordering or be left set on last year's article.
 *
 * Content: the `blog-page` global over lib/pages/newsroom.ts for the chrome,
 * and the `posts` collection for the articles. Shapes untouched.
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
      page="blog"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <BlogReadingRoom
        hero={page.hero}
        listing={page.listing}
        posts={posts}
        note={page.note}
      />
    </PageShell>
  );
}
