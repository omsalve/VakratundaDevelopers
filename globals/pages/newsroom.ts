import {
  cardSection,
  closingLine,
  cta,
  ledgerSection,
  sectionHead,
} from "../../fields/pageFields";
import { textLines } from "../../fields/swashHeading";
import { pageGlobal } from "./pageGlobal";

/**
 * Press Room, Awards and Blogs — see lib/pages/newsroom.ts. The articles
 * themselves are the `posts` collection (collections/Posts.ts).
 */

export const PressPage = pageGlobal({
  slug: "press-page",
  label: "Press Room",
  path: "/press",
  tabs: [
    { label: "Coverage", fields: [ledgerSection("coverage", "Coverage")] },
    {
      label: "Enquiries",
      fields: [
        ledgerSection("enquiries", "Media enquiries", {
          withRubric: false,
          withNote: false,
        }),
      ],
    },
  ],
});

export const AwardsPage = pageGlobal({
  slug: "awards-page",
  label: "Awards",
  path: "/awards",
  tabs: [
    {
      label: "Recognition",
      fields: [ledgerSection("awards", "Awards and citations")],
    },
    {
      label: "Certification",
      fields: [cardSection("certifications", "Certification"), closingLine()],
    },
  ],
});

export const BlogPage = pageGlobal({
  slug: "blog-page",
  label: "Blogs",
  path: "/blogs",
  // The article chrome below renders on every /blogs/[slug] page too.
  nested: true,
  tabs: [
    {
      label: "Listing",
      description:
        "The articles themselves are edited in the Articles collection.",
      fields: [
        {
          name: "listing",
          type: "group",
          label: "Head of the article field",
          fields: sectionHead(),
        },
        closingLine(
          "note",
          "Small print — under the articles, and closing every article",
        ),
      ],
    },
    {
      label: "Article page",
      fields: [
        {
          name: "article",
          type: "group",
          label: " ",
          admin: { description: "Shared by every article page." },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "contentsLabel",
                  type: "text",
                  label: "Contents rubric",
                  admin: { width: "50%", placeholder: "In this note" },
                },
                {
                  name: "updatedLabel",
                  type: "text",
                  label: "Date label",
                  admin: { width: "50%", placeholder: "Published" },
                },
              ],
            },
            textLines("byline", "Credentials row, after the date"),
            cta("backCta", "Closing button"),
          ],
        },
      ],
    },
  ],
});
