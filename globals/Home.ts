import type { Field, GlobalConfig } from "payload";

import { commitmentIcon, figures, seoTab } from "../fields/pageFields";
import { swashHeading as swash, textLines } from "../fields/swashHeading";
import { revalidateGlobal } from "../lib/cms/revalidate";

/**
 * The home page, section by section.
 *
 * The field tree mirrors `SiteContent` in lib/content.ts one for one, and
 * lib/getSiteContent.ts merges whatever is filled in over the shipped copy.
 * Every field is therefore optional in practice: an empty global renders the
 * fallback content rather than an empty page.
 *
 * EVERY PHOTOGRAPH AND EVERY LINE OF COPY ON THE PAGE HAS A FIELD. Five
 * sections — the spread, the practice, the ventures, Vihaa and the
 * responsibility ledger — used to keep their words in content.ts and offer
 * the editor nothing but the pictures. They are all here now, so /admin is
 * the page: `npm run seed` writes the shipped copy and photography in once,
 * and from then on nothing on the home page is changed by editing TypeScript.
 *
 * WHAT IS STILL NOT A FIELD, and why, is written at the merge that skips it
 * in lib/getSiteContent.ts: the arc's drawn label is sized to its curve, and
 * the map's pins are measured against one map file.
 *
 * ADD-ONLY. Field paths here are the columns of the `home` table. Renaming or
 * removing one makes the dev-time schema push offer to drop a column, so a
 * field that needs re-housing is added beside the old one rather than moved;
 * `collapsible` is used wherever a photograph and its copy should read as one
 * block in /admin without nesting their paths.
 */

/**
 * Every headline here falls back to the shipped copy, so none is required: a
 * required italic word would block saving an unrelated tab.
 */
function swashHeading(name: string, label: string): Field {
  return swash(name, label, undefined, { required: false });
}

/** One photograph, with the placement note an editor needs to choose it. */
function photo(name: string, label: string, description?: string): Field {
  return {
    name,
    type: "upload",
    relationTo: "media",
    label,
    admin: { description },
  };
}

/**
 * One frame of the practice section's closing rail: the photograph, the place
 * it is of, and the line set under it.
 *
 * `place` is not decoration. It names the slide to a screen reader, and it is
 * what <PortraitPlate> draws its lettered plate from until the photograph
 * arrives — so it is a place, never a sentence.
 */
function practiceFrame(
  name: string,
  label: string,
  description?: string,
): Field {
  return {
    name,
    type: "group",
    label,
    admin: { description },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "image",
            type: "upload",
            relationTo: "media",
            label: "Photograph",
            admin: { width: "50%" },
          },
          {
            name: "place",
            type: "text",
            label: "The place",
            admin: { width: "50%", placeholder: "The garden" },
          },
        ],
      },
      { name: "caption", type: "text", label: "Caption under the frame" },
    ],
  };
}
/** A short single-line string. */
function line(name: string, label: string, description?: string): Field {
  return { name, type: "text", label, admin: { description } };
}

/** A sentence or a paragraph. */
function para(name: string, label: string, description?: string): Field {
  return { name, type: "textarea", label, admin: { description } };
}

/** The flat label/link pair every button on this page is stored as. */
function ctaRow(prefix: string, label = "Button", placeholder?: string): Field {
  return {
    type: "row",
    fields: [
      {
        name: `${prefix}Label`,
        type: "text",
        label: `${label} — label`,
        admin: { width: "50%" },
      },
      {
        name: `${prefix}Href`,
        type: "text",
        label: `${label} — link`,
        admin: { width: "50%", placeholder },
      },
    ],
  };
}

/**
 * One plate of the spread: the photograph, the tag drawn on it, and the note
 * set in the space beside it. A `collapsible` rather than a group, so the
 * three read as one block in /admin while their paths stay flat — see the
 * add-only note at the head of this file.
 */
function spreadPlate(
  prefix: string,
  label: string,
  shape: string,
  { note = true }: { note?: boolean } = {},
): Field {
  return {
    type: "collapsible",
    label,
    fields: [
      photo(prefix, "Photograph", shape),
      {
        type: "row",
        fields: [
          {
            name: `${prefix}Side`,
            type: "text",
            label: "Tag drawn on the plate",
            admin: {
              width: "40%",
              placeholder: "Exterior",
              description: "Which side of the threshold this frame stands on.",
            },
          },
        ],
      },
      ...(note
        ? [
            para(
              `${prefix}Note`,
              "Note beside the plate",
              "Micro-copy set in the space the plate opens next to it. Leave empty where the composition has no room and the tag carries the frame alone.",
            ),
          ]
        : []),
    ],
  };
}

/**
 * One partnership. The three are fixed and the layout is drawn for exactly
 * one at a time, so they are three named blocks rather than a list an editor
 * could add a fourth to.
 */
function ventureSlide(prefix: string, label: string): Field {
  return {
    type: "collapsible",
    label,
    fields: [
      photo(
        prefix,
        "Photograph",
        "Cropped to fill a tall frame, so keep the building in the middle.",
      ),
      {
        type: "row",
        fields: [
          {
            name: `${prefix}Partner`,
            type: "text",
            label: "Partner",
            admin: {
              width: "45%",
              placeholder: "Godrej Properties",
              description: "Set large across the foot of the photograph.",
            },
          },
          {
            name: `${prefix}Kicker`,
            type: "text",
            label: "What and where",
            admin: { width: "55%", placeholder: "Joint venture — Badlapur" },
          },
        ],
      },
      {
        type: "row",
        fields: [
          {
            name: `${prefix}Stat1Label`,
            type: "text",
            label: "Measure 1",
            admin: { width: "25%", placeholder: "Township" },
          },
          {
            name: `${prefix}Stat1Value`,
            type: "text",
            label: "Figure 1",
            admin: { width: "25%", placeholder: "20 acres" },
          },
          {
            name: `${prefix}Stat2Label`,
            type: "text",
            label: "Measure 2",
            admin: { width: "25%", placeholder: "Homes delivered" },
          },
          {
            name: `${prefix}Stat2Value`,
            type: "text",
            label: "Figure 2",
            admin: { width: "25%", placeholder: "1,400+" },
          },
        ],
      },
      para(`${prefix}Blurb`, "Blurb"),
      ctaRow(`${prefix}Cta`, "Button", "#projects"),
    ],
  };
}

export const Home: GlobalConfig = {
  slug: "home",
  access: { read: () => true },
  admin: {
    description:
      "Leave any field blank to fall back to the copy shipped in lib/content.ts.",
  },
  // The masthead and the close render on every page, so a save revalidates
  // them all rather than only "/".
  hooks: { afterChange: [revalidateGlobal({ path: "/", type: "layout" })] },
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
                {
                  name: "pins",
                  type: "array",
                  label: "Annotations on the photograph",
                  maxRows: 6,
                  admin: {
                    description:
                      "EACH ONE IS GLUED TO A POINT IN THE PHOTOGRAPH ABOVE, not to the frame it is seen through: x and y are percentages of the picture itself, read off the picture. Replace the photograph and every pin has to be measured again, or the annotations end up pointing at whatever moved underneath them. Six at most — they need room.",
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
                          name: "x",
                          type: "number",
                          required: true,
                          min: 0,
                          max: 100,
                          admin: { width: "20%", description: "x %" },
                        },
                        {
                          name: "y",
                          type: "number",
                          required: true,
                          min: 0,
                          max: 100,
                          admin: { width: "20%", description: "y %" },
                        },
                      ],
                    },
                    textLines("body", "Points", {
                      multiline: true,
                      minRows: 1,
                      description: "Two to four, one short sentence each.",
                    }),
                    {
                      name: "evidence",
                      type: "text",
                      required: true,
                      label: "What is actually in frame",
                      admin: {
                        placeholder: "Shown: the open pavilion frame …",
                        description:
                          "The line that ties the claim to the picture. It is the hinge the whole annotation turns on — without it the copy floats free of what it is pinned to.",
                      },
                    },
                    ctaRow("cta", "Button", "#projects"),
                  ],
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
                line(
                  "arcText",
                  "Label on the arc",
                  "One short line, drawn along the curve of the transition as it opens. It is decoration and is hidden from screen readers, so it must never carry anything the lockup and the paragraphs do not already say.",
                ),
                textLines("body", "Paragraphs", { multiline: true }),
                {
                  name: "legacy",
                  type: "group",
                  label: "Record band — the five discs",
                  admin: {
                    description:
                      "The lattice of proofs between the paragraphs and the showcase. Three discs lead on a figure and two on a phrase; each disc lays itself out from whichever it is given, so leave the other empty rather than inventing one. The copy is fitted to the circle it is set in — keep every line short.",
                  },
                  fields: [
                    line("kicker", "Rubric"),
                    swashHeading("heading", "Headline"),
                    para("body", "Standfirst"),
                    {
                      name: "proofs",
                      type: "array",
                      label: "Discs",
                      maxRows: 5,
                      admin: {
                        description:
                          "Five is what the three-over-two lattice is drawn for.",
                      },
                      fields: [
                        {
                          type: "row",
                          fields: [
                            {
                              name: "icon",
                              type: "select",
                              required: true,
                              defaultValue: "tower",
                              label: "Drawing",
                              admin: { width: "40%" },
                              options: [
                                { label: "Tower", value: "tower" },
                                { label: "Drawing / plan", value: "plan" },
                                { label: "Family", value: "family" },
                                { label: "Crane", value: "crane" },
                                { label: "Handshake — trust", value: "trust" },
                              ],
                            },
                            {
                              name: "value",
                              type: "text",
                              label: "Figure",
                              admin: { width: "20%", placeholder: "2.1" },
                            },
                            {
                              name: "suffix",
                              type: "text",
                              admin: { width: "15%", placeholder: "+" },
                            },
                            {
                              name: "unit",
                              type: "text",
                              admin: {
                                width: "25%",
                                placeholder: "Million sq. ft.",
                              },
                            },
                          ],
                        },
                        {
                          name: "phrase",
                          type: "text",
                          label: "Phrase, where the disc has no figure",
                          admin: {
                            placeholder: "Trusted by industry giants",
                            description:
                              "Used instead of the figure. Fill one or the other, never both.",
                          },
                        },
                        {
                          name: "note",
                          type: "text",
                          required: true,
                          label: "Line at the foot of the disc",
                        },
                      ],
                    },
                  ],
                },
                photo(
                  "legacyImage",
                  "Record band — cut-out render",
                  "The render the five discs are set against. It stands on the cream with no frame of its own, so it needs a transparent background: a PNG cut out to the building. Landscape, around 4:3.",
                ),
                swashHeading("showcaseHeading", "Showcase — headline"),
                {
                  name: "showcase",
                  type: "array",
                  label: "Showcase frames",
                  admin: {
                    description:
                      "The frames at the foot of the section, in order — three is what the layout is drawn for. Each is cropped to 16:9 and shown 300px wide, so put the subject in the middle third; 1600 × 900 or larger. The name labels the frame's control for screen readers; the caption runs under the frame while it is up.",
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "name",
                          type: "text",
                          required: true,
                          admin: { width: "40%", placeholder: "Anantaraa" },
                        },
                        {
                          name: "caption",
                          type: "text",
                          required: true,
                          admin: { width: "60%", placeholder: "Vedanta, Bandra" },
                        },
                      ],
                    },
                    {
                      name: "image",
                      type: "upload",
                      relationTo: "media",
                      required: true,
                      label: "Photograph",
                    },
                  ],
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
                photo(
                  "map",
                  "Map of the region",
                  "The plate behind the whole section. Project pins are placed in per cent of THIS image (lib/mapPoints.ts), so a replacement has to be the same map at the same framing — a re-export, not a different map.",
                ),
                ctaRow("cta", "Way out of the section", "/projects"),
              ],
            },
          ],
        },

        /* -------------------------------------------------------- Spread */
        {
          label: "Spread",
          description:
            "The interior-and-exterior composition — the one section on the page where both are held in the same frame rather than shown in turn. Five named positions, not a list: each plate is drawn for its own crop, so a sixth photograph has nowhere to stand.",
          fields: [
            {
              name: "atmosphere",
              type: "group",
              label: " ",
              fields: [
                line("eyebrow", "Rubric", "The wide-tracked label the spread opens on."),
                swashHeading("heading", "Headline"),
                para(
                  "lead",
                  "Lead",
                  "One paragraph, set into the composition rather than stacked under the headline.",
                ),
                spreadPlate(
                  "deck",
                  "1 — Wide exterior, opens the spread",
                  "Landscape, around 16:9. The frame the section opens against, top right.",
                ),
                spreadPlate(
                  "glass",
                  "2 — Interior, through a wall of glass",
                  "Landscape, around 3:2. The one frame that holds inside and outside at once.",
                ),
                spreadPlate(
                  "terrace",
                  "3 — Tall threshold plate",
                  "Portrait, around 9:16. Stands off the page and overlaps the frame beside it.",
                ),
                spreadPlate(
                  "lounge",
                  "4 — Interior",
                  "Landscape, around 16:9. Breaks the right margin.",
                  { note: false },
                ),
                spreadPlate(
                  "garden",
                  "5 — Wide exterior, closes the spread",
                  "Landscape, around 16:9.",
                ),
                line("detailsTitle", "Rubric over the details"),
                textLines("details", "The details", {
                  multiline: true,
                  description:
                    "Three things done that nobody is meant to notice.",
                }),
                para(
                  "coda",
                  "Closing line",
                  "The last line of the section, alone in the left margin beside the closing photograph.",
                ),
              ],
            },
          ],
        },

        /* ------------------------------------------------------ Practice */
        {
          label: "Practice (not on the page)",
          description:
            "⚠️ NOTHING ON THIS TAB IS CURRENTLY SHOWN. The practice band — the undertaking that used to sit between the portfolio and the team — was taken out of the landing page in the redesign: components/Practice.tsx is no longer imported by any route. The fields are kept, filled, so the section can be put back without re-typing it, and so the copy is somewhere it can be agreed. Every sentence in it is something the firm would be held to. Until the section returns, an edit here changes nothing a visitor sees.",
          fields: [
            {
              name: "practice",
              type: "group",
              label: " ",
              fields: [
                swashHeading("statement", "The statement"),
                para(
                  "detail",
                  "The undertaking, in specifics",
                  "Each sentence is a thing that is actually done. Leave empty to set the statement alone.",
                ),
                ctaRow("cta", "Circular button", "#team"),
                line("commitmentsTitle", "Rubric over the promises"),
                textLines("commitments", "What holds on every project", {
                  description: "One line each. Three is what the block is set for.",
                }),
                photo(
                  "wide",
                  "Wide photograph — under the statement",
                  "Landscape, around 3:2.",
                ),
                photo(
                  "portrait",
                  "Tall photograph — on the navy plate",
                  "Portrait, around 9:16.",
                ),
                practiceFrame(
                  "garden",
                  "Closing frame 1 — the garden",
                  "The closing frames walk up the building: the garden, the lounge, the roof. Keep each to the place it is named for.",
                ),
                practiceFrame("lounge", "Closing frame 2 — the lounge"),
                practiceFrame("roof", "Closing frame 3 — the roof"),
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

        /* ------------------------------------------------------ Ventures */
        {
          label: "Ventures",
          description:
            "Three partnerships, shown one at a time. This is not the portfolio — that is the Projects tab — it is the three names the group is trusted by, and the layout is drawn for exactly three.",
          fields: [
            {
              name: "ventures",
              type: "group",
              label: " ",
              fields: [
                swashHeading("heading", "Headline"),
                para("standfirst", "Standfirst"),
                ventureSlide("godrej", "1 — Godrej Properties, Badlapur"),
                ventureSlide("shapoorji", "2 — Shapoorji Pallonji, Thane"),
                ventureSlide(
                  "redevelopment",
                  "3 — MHADA & MCGM, redevelopment",
                ),
              ],
            },
          ],
        },

        /* --------------------------------------------------------- Vihaa */
        {
          label: "Vihaa",
          description:
            "Vihaa International School — a joint venture, recorded the way the page records every other partnership. The partner is deliberately not named: say \"joint venture\" and no more until who with is published.",
          fields: [
            {
              name: "vihaa",
              type: "group",
              label: " ",
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "nameMark",
                      type: "text",
                      label: "Name — in capitals",
                      admin: { width: "40%", placeholder: "Vihaa" },
                    },
                    {
                      name: "nameRest",
                      type: "text",
                      label: "Name — the line under it",
                      admin: { width: "60%", placeholder: "International School" },
                    },
                  ],
                },
                swashHeading("heading", "Headline"),
                para("standfirst", "Standfirst"),
                {
                  type: "row",
                  fields: [
                    {
                      name: "fact1Label",
                      type: "text",
                      label: "Fact 1",
                      admin: { width: "25%", placeholder: "Structure" },
                    },
                    {
                      name: "fact1Value",
                      type: "text",
                      label: "Value 1",
                      admin: { width: "25%", placeholder: "Joint venture" },
                    },
                    {
                      name: "fact2Label",
                      type: "text",
                      label: "Fact 2",
                      admin: { width: "25%", placeholder: "Town" },
                    },
                    {
                      name: "fact2Value",
                      type: "text",
                      label: "Value 2",
                      admin: { width: "25%", placeholder: "Badlapur" },
                    },
                  ],
                },
                para(
                  "note",
                  "The published sentence about the school",
                  "State nothing here the group has not published — no year, no board, no roll.",
                ),
                photo(
                  "cover",
                  "Cover — the name is set across it",
                  "Landscape, around 3:2.",
                ),
                figures(
                  "moments",
                  "Moments",
                  "Portrait, around 2:3. Dealt into two columns in order — left, right, left — so an even number reads best.",
                ),
              ],
            },
          ],
        },

        /* ------------------------------------------------ Responsibility */
        {
          label: "Responsibility",
          description:
            "What the group owes the ground it builds on — the last thing said before the close, and deliberately the smallest section on the page. The same four practices are set out at length on the Sustainability page.",
          fields: [
            {
              name: "responsibility",
              type: "group",
              label: " ",
              fields: [
                swashHeading("heading", "Headline"),
                para("standfirst", "Standfirst"),
                photo(
                  "image",
                  "Opening photograph",
                  "Landscape, around 16:9. Stands beside the heading.",
                ),
                { name: "imageCaption", type: "text", label: "Caption" },
                {
                  name: "environment",
                  type: "group",
                  label: "The practices",
                  fields: [
                    line(
                      "label",
                      "Rubric",
                      "Set into the rule that opens the band.",
                    ),
                    para(
                      "lead",
                      "The standard they are measured against",
                    ),
                    {
                      name: "commitments",
                      type: "array",
                      label: "Practices",
                      maxRows: 4,
                      admin: {
                        description:
                          "Four, in two ruled pairs. Each is bound to a drawing that exists, so the set cannot grow past the four drawings.",
                      },
                      fields: [
                        {
                          type: "row",
                          fields: [
                            {
                              name: "title",
                              type: "text",
                              required: true,
                              admin: { width: "50%" },
                            },
                            commitmentIcon,
                          ],
                        },
                        {
                          name: "detail",
                          type: "text",
                          required: true,
                          label: "One line — what it does on a site",
                        },
                      ],
                    },
                  ],
                },
                para(
                  "coda",
                  "Closing line",
                  "The last line of the section, ranged right against the edge of the field.",
                ),
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

        /* ---------------------------------------------------------- SEO */
        seoTab({
          titleDescription:
            "The home page's full title, used exactly as written — the site name is not appended to it.",
        }),
      ],
    },
  ],
};
