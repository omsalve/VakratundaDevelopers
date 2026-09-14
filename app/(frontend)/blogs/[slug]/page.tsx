import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import ProseDoc from "@/components/ProseDoc";
import { buildMetadata } from "@/lib/cms/metadata";
import { getBlogPost, getBlogPosts } from "@/lib/getBlogPosts";
import { getStandingPage } from "@/lib/getPageContent";

/**
 * One article.
 *
 * IT REUSES ProseDoc, WHICH WAS WRITTEN FOR THE TERMS PAGE, and that is the
 * right way round rather than a compromise: a legal clause set and a long
 * explanatory article are the same problem — numbered sections, a reading
 * measure, an anchor per section, and no motion competing with the sentence
 * being read. The only difference is what the numbers are called.
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
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PageHero
        content={{
          label: `${post.category} · ${post.readingTime}`,
          heading: post.swashTitle,
          standfirst: post.excerpt,
          meta: [post.date, ...page.article.byline].filter(Boolean),
        }}
      />

      <PageSection ground="cream" size="lg">
        <ProseDoc
          doc={{
            updated: post.date,
            intro: [],
            clauses: post.body,
            closing: page.note,
            cta: page.article.backCta,
          }}
          contentsLabel={page.article.contentsLabel}
          updatedLabel={page.article.updatedLabel}
        />
      </PageSection>
    </PageShell>
  );
}
