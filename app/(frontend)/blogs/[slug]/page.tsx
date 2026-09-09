import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FinalCTA from "@/components/FinalCTA";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import ProseDoc from "@/components/ProseDoc";
import { getSiteContent } from "@/lib/getSiteContent";
import { blogPage } from "@/lib/pages";

/**
 * One article.
 *
 * IT REUSES ProseDoc, WHICH WAS WRITTEN FOR THE TERMS PAGE, and that is the
 * right way round rather than a compromise: a legal clause set and a long
 * explanatory article are the same problem — numbered sections, a reading
 * measure, an anchor per section, and no motion competing with the sentence
 * being read. The only difference is what the numbers are called.
 *
 * Every route is generated at build time from the same array the listing reads,
 * so a link on /blogs cannot point at an article that does not exist.
 */

export const revalidate = 60;

export function generateStaticParams() {
  return blogPage.posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPage.posts.find((entry) => entry.slug === slug);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPage.posts.find((entry) => entry.slug === slug);
  if (!post) notFound();

  const content = await getSiteContent();

  return (
    <PageShell nav={content.nav}>
      <PageHero
        content={{
          label: `${post.category} · ${post.readingTime}`,
          heading: post.swashTitle,
          standfirst: post.excerpt,
          meta: [post.date, "Vakratunda Group", "Notes"],
        }}
      />

      <PageSection ground="cream" size="lg">
        <ProseDoc
          doc={{
            updated: post.date,
            intro: [],
            clauses: post.body,
            closing: blogPage.note,
            cta: { label: "Read the other notes", href: "/blogs" },
          }}
          contentsLabel="In this note"
          updatedLabel="Published"
        />
      </PageSection>

      <FinalCTA content={content.finalCta} legal={content.legal} />
    </PageShell>
  );
}
