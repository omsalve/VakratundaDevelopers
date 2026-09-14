import type { CollectionConfig } from "payload";

import { proseClauses, seoTab } from "../fields/pageFields";
import { swashHeading } from "../fields/swashHeading";
import { revalidateCollection } from "../lib/cms/revalidate";

/**
 * One document per article under /blogs.
 *
 * The fields mirror `BlogPost` in lib/pages/types.ts. The listing and the
 * article page read published documents only; while the collection has none,
 * both render the articles shipped in lib/pages/newsroom.ts, so the section is
 * never empty on a fresh database.
 *
 * Drafts are on: an article is written and reviewed in /admin before it is
 * published, and the public REST and GraphQL APIs only ever see what is live.
 */

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Article", plural: "Articles" },
  access: {
    read: ({ req }) =>
      req.user ? true : { _status: { equals: "published" } },
  },
  versions: { drafts: true },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    description: "Articles under /blogs, newest first by their publish date.",
  },
  defaultSort: "-publishedAt",
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && typeof data.title === "string") {
          data.slug = toSlug(data.title);
        }
        return data;
      },
    ],
    ...revalidateCollection((doc, previousDoc) => [
      { path: "/blogs" },
      ...[doc.slug, previousDoc?.slug]
        .filter((slug): slug is string => typeof slug === "string" && slug !== "")
        .map((slug) => ({ path: `/blogs/${slug}` })),
    ]),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Article",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "title",
                  type: "text",
                  required: true,
                  admin: {
                    width: "60%",
                    description: "As it reads on the listing card.",
                  },
                },
                {
                  name: "slug",
                  type: "text",
                  // Satisfied by the beforeValidate hook when left empty.
                  required: true,
                  unique: true,
                  index: true,
                  admin: {
                    width: "40%",
                    description: "The URL after /blogs/. Filled from the title if left empty.",
                  },
                },
              ],
            },
            swashHeading("swashTitle", "Headline — on the article page"),
            {
              type: "row",
              fields: [
                {
                  name: "category",
                  type: "text",
                  required: true,
                  admin: { width: "35%", placeholder: "Redevelopment" },
                },
                {
                  name: "readingTime",
                  type: "text",
                  required: true,
                  label: "Reading time",
                  admin: { width: "25%", placeholder: "6 min read" },
                },
                {
                  name: "publishedAt",
                  type: "date",
                  required: true,
                  label: "Publish date",
                  admin: {
                    width: "40%",
                    date: {
                      pickerAppearance: "dayOnly",
                      displayFormat: "d MMMM yyyy",
                    },
                  },
                },
              ],
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              admin: {
                description:
                  "Two sentences. Shown on the card and under the article's headline.",
              },
            },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Card photograph",
              admin: { description: "Portrait, 4:5. 1600 × 2000 or larger." },
            },
            // Not `body`: each section has its own `body` array, and Postgres
            // cannot name two relations `body` on the same table.
            proseClauses("sections", "Sections", { minRows: 1 }),
          ],
        },
        seoTab({
          titleDescription:
            "Leave blank to use the article's title. The site name is appended to it.",
        }),
      ],
    },
  ],
};
