import type { GlobalConfig } from "payload";

import { swashHeading, textLines } from "../fields/swashHeading";

/**
 * The home page, section by section.
 *
 * The field tree mirrors `SiteContent` in lib/content.ts one for one, and
 * lib/getSiteContent.ts merges whatever is filled in over the shipped copy.
 * Every field is therefore optional in practice: an empty global renders the
 * fallback content rather than an empty page.
 *
 * Replaces the previous image-only global (heroPoster, promiseImage, …) which
 * belonged to the retired landing page. Those columns are dropped when the
 * schema is pushed — see README, "Migrating the database".
 */
export const Home: GlobalConfig = {
  slug: "home",
  access: { read: () => true },
  admin: {
    description:
      "Leave any field blank to fall back to the copy shipped in lib/content.ts.",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        /* ---------------------------------------------------------- Nav */
        {
          label: "Navigation",
          fields: [
            {
              name: "nav",
              type: "group",
              label: " ",
              fields: [
                {
                  name: "links",
                  type: "array",
                  label: "Section links",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "label",
                          type: "text",
                          required: true,
                          admin: { width: "50%" },
                        },
                        {
                          name: "href",
                          type: "text",
                          required: true,
                          admin: { width: "50%", placeholder: "#projects" },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Header button label",
                      admin: { width: "50%" },
                    },
                    {
                      name: "ctaHref",
                      type: "text",
                      label: "Header button link",
                      admin: { width: "50%" },
                    },
                  ],
                },
              ],
            },
          ],
        },

        /* --------------------------------------------------------- Hero */
        {
          label: "Hero",
          fields: [
            {
              name: "hero",
              type: "group",
              label: " ",
              fields: [
                swashHeading("heading", "Headline"),
                {
                  name: "standfirst",
                  type: "textarea",
                  label: "Standfirst",
                },
                textLines("meta", "Meta line", {
                  description:
                    "Short items shown under the headline, dot-separated.",
                }),
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Button label",
                      admin: { width: "40%" },
                    },
                    {
                      name: "ctaHref",
                      type: "text",
                      label: "Button link",
                      admin: { width: "40%" },
                    },
                    {
                      name: "scrollCue",
                      type: "text",
                      label: "Scroll cue",
                      admin: { width: "20%" },
                    },
                  ],
                },
                {
                  name: "background",
                  type: "upload",
                  relationTo: "media",
                  label: "Opening photograph",
                  admin: {
                    description:
                      "ONE tall, continuous frame for the whole opening — the hero and the impact figures share it, and it travels from its top edge to its bottom edge across the section, reaching the bottom just as the story section closes over it. Nothing in it may repeat. Portrait, around 2880 × 3240 — roughly 8:9, which is the shape the frame is laid out at; a much taller original loses its sides to the crop. Sits at low opacity behind type throughout, so favour a dark, low-contrast image.",
                  },
                },
              ],
            },
          ],
        },

        /* ------------------------------------------------------- Impact */
        /* Shares the Hero tab's photograph — the two are one section on the
           page, and the impact figures are staked out over the lower part of
           that same continuous frame. */
        {
          label: "Impact",
          fields: [
            {
              name: "immersive",
              type: "group",
              label: " ",
              fields: [
                swashHeading("heading", "Headline"),
                { name: "standfirst", type: "textarea", label: "Standfirst" },
                {
                  name: "hotspots",
                  type: "array",
                  label: "Figures",
                  maxRows: 6,
                  admin: {
                    description:
                      "Each one is pinned to a point on the scene. Keep to five or fewer — they need room.",
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "value",
                          type: "text",
                          required: true,
                          admin: { width: "35%", placeholder: "2.1" },
                        },
                        {
                          name: "unit",
                          type: "text",
                          admin: {
                            width: "35%",
                            placeholder: "Million sq. ft.",
                          },
                        },
                        {
                          name: "x",
                          type: "number",
                          required: true,
                          min: 0,
                          max: 100,
                          admin: { width: "15%", description: "x %" },
                        },
                        {
                          name: "y",
                          type: "number",
                          required: true,
                          min: 0,
                          max: 100,
                          admin: { width: "15%", description: "y %" },
                        },
                      ],
                    },
                    { name: "title", type: "text", required: true },
                    { name: "body", type: "textarea", required: true },
                  ],
                },
              ],
            },
          ],
        },

        /* -------------------------------------------------------- Story */
        {
          label: "Story",
          fields: [
            {
              name: "concept",
              type: "group",
              label: " ",
              fields: [
                {
                  name: "lockup",
                  type: "group",
                  label: "Opening lockup",
                  admin: {
                    description:
                      "The section opens on the brand mark rather than on a headline. The name is set under the mark, and the caption runs under the hairline below it.",
                  },
                  fields: [
                    {
                      name: "wordmark",
                      type: "text",
                      label: "Name — under the mark",
                      admin: {
                        description:
                          "One word. It is set in small caps at display size and has to hold one line on a phone.",
                      },
                    },
                    textLines("caption", "Caption under the rule", {
                      description:
                        "One entry per line. The break is set here, not by the layout — two short lines read best.",
                    }),
                  ],
                },
                textLines("body", "Paragraphs", { multiline: true }),
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Photograph — first frame",
                  admin: {
                    description:
                      "The opening frame of the three-frame showcase at the foot of the section. Cropped to 16:9 and shown 300px wide, so put the subject in the middle third. 1600 × 900 or larger. The other two frames are shipped in content.ts.",
                  },
                },
                {
                  name: "imageCaption",
                  type: "text",
                  label: "Caption — first frame",
                  admin: {
                    description:
                      "Runs under the showcase while the first frame is up. One line.",
                  },
                },
              ],
            },
          ],
        },

        /* ------------------------------------------------------ Projects */
        {
          label: "Projects",
          fields: [
            {
              name: "gallery",
              type: "group",
              label: " ",
              fields: [
                swashHeading("heading", "Headline"),
                { name: "standfirst", type: "textarea", label: "Standfirst" },
                {
                  name: "projects",
                  type: "relationship",
                  relationTo: "projects",
                  hasMany: true,
                  label: "Projects in the rail",
                  admin: {
                    description:
                      "Drag to reorder. Leave empty to show every project, sorted by its Order field.",
                  },
                },
              ],
            },
          ],
        },

        /* ---------------------------------------------------------- Team */
        {
          label: "Team",
          fields: [
            {
              name: "team",
              type: "group",
              label: " ",
              admin: {
                description:
                  "Four slides, in this order. Leave a portrait empty and the site draws a lettered plate in its place — nothing in the layout moves when the photograph arrives.",
              },
              fields: [
                swashHeading("heading", "Slide 1 — headline"),
                {
                  name: "standfirst",
                  type: "textarea",
                  label: "Slide 1 — subtext",
                },
                {
                  name: "interstitial",
                  type: "group",
                  label: "Between the portfolio and the team",
                  admin: {
                    description:
                      "The one line carried on the cream of the arc above this section.",
                  },
                  fields: [
                    swashHeading("heading", "Headline"),
                    { name: "subtext", type: "textarea", label: "Subtext" },
                  ],
                },
                {
                  name: "intro",
                  type: "group",
                  label: "Slide 1 — introduction",
                  fields: [
                    {
                      name: "image",
                      type: "upload",
                      relationTo: "media",
                      label: "Group photograph",
                    },
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Button label",
                      admin: { placeholder: "Meet the team" },
                    },
                  ],
                },
                {
                  name: "chairman",
                  type: "group",
                  label: "Slide 2 — chairman",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "name", type: "text", admin: { width: "50%" } },
                        {
                          name: "title",
                          type: "text",
                          admin: { width: "50%" },
                        },
                      ],
                    },
                    swashHeading("quote", "Lead quote"),
                    {
                      name: "superpower",
                      type: "text",
                      label: "The one line under the name",
                    },
                    { name: "bio", type: "textarea", label: "Bio" },
                    {
                      name: "portrait",
                      type: "upload",
                      relationTo: "media",
                      label: "Portrait",
                    },
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Button label",
                      admin: { placeholder: "Meet the leadership" },
                    },
                  ],
                },
                {
                  name: "leadership",
                  type: "array",
                  label: "Slide 3 — leadership",
                  maxRows: 3,
                  admin: {
                    description:
                      "Three is what the slide is drawn for. The bio is what each card's own disclosure opens, so keep it out of the line above it.",
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "name",
                          type: "text",
                          required: true,
                          admin: { width: "45%" },
                        },
                        {
                          name: "title",
                          type: "text",
                          required: true,
                          admin: { width: "55%" },
                        },
                      ],
                    },
                    {
                      name: "superpower",
                      type: "text",
                      required: true,
                      label: "The one line on the card",
                    },
                    {
                      name: "bio",
                      type: "textarea",
                      required: true,
                      label: "Full bio",
                    },
                    {
                      name: "portrait",
                      type: "upload",
                      relationTo: "media",
                      label: "Portrait",
                    },
                  ],
                },
                {
                  name: "roles",
                  type: "array",
                  label: "Slide 4 — core teams",
                  maxRows: 6,
                  admin: {
                    description:
                      "Four to six. Each descriptor is one line, from the construction philosophy or the core values.",
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "title",
                          type: "text",
                          required: true,
                          admin: { width: "60%" },
                        },
                        {
                          name: "icon",
                          type: "select",
                          required: true,
                          defaultValue: "design",
                          admin: { width: "40%" },
                          options: [
                            {
                              label: "Compasses — planning & design",
                              value: "design",
                            },
                            {
                              label: "Site level — operations",
                              value: "operations",
                            },
                            { label: "Door and key — sales", value: "sales" },
                            { label: "Plumb bob — quality", value: "quality" },
                            {
                              label: "Leaf — sustainability",
                              value: "sustainability",
                            },
                            { label: "Hard hat — site teams", value: "site" },
                          ],
                        },
                      ],
                    },
                    {
                      name: "descriptor",
                      type: "text",
                      required: true,
                      label: "One-line descriptor",
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "roleCtaLabel",
                      type: "text",
                      label: "Role card link label",
                      admin: { width: "34%", placeholder: "Contact" },
                    },
                    {
                      name: "roleCtaHref",
                      type: "text",
                      label: "Role card link target",
                      admin: { width: "33%", placeholder: "#contact" },
                    },
                    {
                      name: "bioCtaLabel",
                      type: "text",
                      label: "Bio disclosure label",
                      admin: { width: "33%", placeholder: "View full bio" },
                    },
                  ],
                },
              ],
            },
          ],
        },

        /* ------------------------------------------------------- Contact */
        {
          label: "Contact",
          fields: [
            {
              name: "finalCta",
              type: "group",
              label: " ",
              fields: [
                swashHeading("quote", "Closing line"),
                {
                  name: "attribution",
                  type: "text",
                  label: "Attribution",
                },
                {
                  name: "proofs",
                  type: "array",
                  label: "Reasons to trust",
                  maxRows: 3,
                  admin: {
                    description:
                      "Exactly three reads best — they sit in one row of columns.",
                  },
                  fields: [
                    { name: "title", type: "text", required: true },
                    { name: "body", type: "textarea", required: true },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      type: "text",
                      label: "Button label",
                      admin: { width: "50%" },
                    },
                    {
                      name: "ctaHref",
                      type: "text",
                      label: "Button link",
                      admin: { width: "50%", placeholder: "mailto:…" },
                    },
                  ],
                },
                {
                  name: "email",
                  type: "email",
                  label: "Contact email",
                },
                textLines("addressLines", "Address"),
              ],
            },
            {
              name: "legal",
              type: "text",
              label: "Copyright line",
            },
          ],
        },
      ],
    },
  ],
};
