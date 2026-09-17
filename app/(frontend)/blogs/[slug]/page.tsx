import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/pages/blog/BlogArticle";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/cms/metadata";
import { getBlogPost, getBlogPosts } from "@/lib/getBlogPosts";
import { getStandingPage } from "@/lib/getPageContent";

/**
 * One article.
 *
 * IT USED TO REUSE ProseDoc, the terms-page component, on the argument that a
 * legal clause set and a long article are the same problem. Redesigning the
 * three legal pages is what showed they are not: a clause set is SEARCHED —
 * you arrive looking for clause 4, which is why /grievance-redressal keeps a
 * sticky index beside a narrow column — while an article is READ, once,
 * start to finish. So this is a single centred column with its contents
 * stated once at the top and a reading-progress rule, and it belongs to the
 * same cream reading room /blogs now is.
 *
 * Every article known at build time is prerendered from the same source the
 * listing reads, so a link on /blogs cannot point at an article that does not
 * exist. One published after the build renders on its first request and is
 * cached from then on.
 */

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Not found", robots: { index: false } };

  return buildMetadata(
    post.seo ?? {
      title: post.title,
      description: post.excerpt,
      image: post.image,
    },
    { path: `/blogs/${post.slug}`, type: "article" },
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, { site, page }] = await Promise.all([
    getBlogPost(slug),
    getStandingPage("blog"),
  ]);
  if (!post) notFound();

  return (
    <PageShell
      page="blog"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <BlogArticle
        post={post}
        contentsLabel={page.article.contentsLabel}
        updatedLabel={page.article.updatedLabel}
        byline={page.article.byline}
        backCta={page.article.backCta}
        note={page.note}
      />
    </PageShell>
  );
}
