import type { CollectionConfig } from "payload";

import { swashHeading, textLines } from "../fields/swashHeading";

/**
 * One document per address.
 *
 * The card fields (name → cardImage) are what the home page's gallery rail and
 * the presence timeline read today. Everything under the "Project page" tab is
 * inert until a /projects/[slug] route exists — it is here now so the section
 * components (Hero, ImmersiveScene, GalleryCarousel, LocationTimeline) can be
 * pointed at a project document without a second schema migration.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  access: { read: () => true },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "locality", "status", "order"],
    description:
      "Every Vakratunda address. Order controls where a project sits in the home-page rail.",
  },
  defaultSort: "order",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Card",
          description: "How this project appears in the home-page rail.",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  admin: { width: "60%" },
                },
                {
                  name: "locality",
                  type: "text",
                  required: true,
                  admin: {
                    width: "40%",
                    placeholder: "Bandra",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "status",
                  type: "select",
                  required: true,
                  defaultValue: "Completed",
                  options: [
                    { label: "Completed", value: "Completed" },
                    { label: "Ongoing", value: "Ongoing" },
                    { label: "Upcoming", value: "Upcoming" },
                  ],
                  admin: { width: "50%" },
                },
                {
                  name: "order",
                  type: "number",
                  defaultValue: 0,
                  admin: {
                    width: "50%",
                    description: "Lower numbers appear first.",
                  },
                },
              ],
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true,
              admin: {
                description:
                  "URL fragment. Used by a future /projects/[slug] page.",
                placeholder: "bkc-28",
              },
            },
            {
              name: "blurb",
              type: "textarea",
              admin: {
                description: "One line. Shown under the project name.",
              },
            },
            {
              name: "cardImage",
              type: "upload",
              relationTo: "media",
              label: "Card image",
              admin: {
                description: "Portrait, 4:5. 1200 × 1500 or larger.",
              },
            },
          ],
        },
        {
          label: "Project page",
          description:
            "Not rendered yet. Fill this in when the /projects/[slug] route is built.",
          fields: [
            {
              name: "published",
              type: "checkbox",
              defaultValue: false,
              label: "Project page is live",
            },
            swashHeading("heading", "Page headline"),
            {
              name: "standfirst",
              type: "textarea",
              label: "Standfirst",
            },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              label: "Page hero image",
            },
            {
              name: "gallery",
              type: "array",
              label: "Gallery",
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                { name: "caption", type: "text" },
              ],
            },
            {
              name: "connectivity",
              type: "array",
              label: "Connectivity",
              admin: {
                description:
                  "Feeds the same timeline component as the home page, in travel-time mode.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "place",
                      type: "text",
                      required: true,
                      admin: { width: "50%", placeholder: "Airport" },
                    },
                    {
                      name: "detail",
                      type: "text",
                      required: true,
                      admin: { width: "50%", placeholder: "45 min" },
                    },
                  ],
                },
              ],
            },
            textLines("highlights", "Highlights"),
          ],
        },
      ],
    },
  ],
};
