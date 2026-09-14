import { cache } from "react";

import type { Post } from "@/payload-types";
import { date, heading, mediaImage } from "./cms/merge";
import { getPayloadClient, readWithFallback } from "./cms/read";
import { mergeClauses, mergeSeo } from "./cms/shapes";
import { blogPosts, type BlogPost } from "./pages";

/**
 * The articles under /blogs: published documents in the `posts` collection,
 * newest first.
 *
 * While nothing is published — a fresh database, or before the first article
 * goes live — both the listing and the article pages render the articles
 * shipped in lib/pages/newsroom.ts, so the section is never empty and never
 * links to an article that does not exist. Once one document is published,
 * the collection is the only source. Failure policy: lib/cms/read.ts.
 */

function toPost(doc: Post): BlogPost | undefined {
  const image = mediaImage(doc.image);
  if (!image) {
    // The card cannot be drawn without a sized photograph, and a broken card
    // is worse than a missing one.
    console.warn(
      `[cms] posts/${doc.slug}: card photograph missing or unsized — article skipped.`,
    );
    return undefined;
  }

  return {
    slug: doc.slug,
    date: date(doc.publishedAt, ""),
    category: doc.category,
    readingTime: doc.readingTime,
    title: doc.title,
    swashTitle: heading(doc.swashTitle, { swash: doc.title }),
    excerpt: doc.excerpt,
    image,
    body: mergeClauses(doc.sections, []),
    seo: mergeSeo(doc.seo, {
      title: doc.title,
      description: doc.excerpt,
      image,
    }),
  };
}

export const getBlogPosts = cache(
  (): Promise<BlogPost[]> =>
    readWithFallback(
      "posts",
      async () => {
        const payload = await getPayloadClient();
        const { docs } = await payload.find({
          collection: "posts",
          where: { _status: { equals: "published" } },
          sort: "-publishedAt",
          depth: 1,
          pagination: false,
        });
        const posts = docs
          .map(toPost)
          .filter((post): post is BlogPost => post !== undefined);
        return posts.length > 0 ? posts : blogPosts;
      },
      blogPosts,
    ),
);

export const getBlogPost = cache(
  (slug: string): Promise<BlogPost | null> => {
    const shipped = blogPosts.find((post) => post.slug === slug) ?? null;

    return readWithFallback(
      `posts/${slug}`,
      async () => {
        const payload = await getPayloadClient();
        const { docs } = await payload.find({
          collection: "posts",
          where: {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: "published" } },
            ],
          },
          depth: 1,
          limit: 1,
        });
        if (docs[0]) return toPost(docs[0]) ?? null;

        // The shipped articles stand in only while nothing is published, the
        // same rule the listing follows.
        const { totalDocs } = await payload.count({
          collection: "posts",
          where: { _status: { equals: "published" } },
        });
        return totalDocs === 0 ? shipped : null;
      },
      shipped,
    );
  },
);
