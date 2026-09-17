import type { Field, Tab } from "payload";

import { swashHeading, textLines } from "./swashHeading";

/**
 * Field builders for the standing pages.
 *
 * One builder per shape in lib/pages/types.ts, so a page global is an
 * arrangement of these in the same way its route is an arrangement of the
 * section components — and lib/cms/shapes.ts merges each one back onto the
 * shape it was built from. A field added here needs its merge added there.
 *
 * EVERYTHING OUTSIDE AN ARRAY ROW IS OPTIONAL. The routes fall back to the copy
 * in lib/pages field by field, so an empty global renders the shipped page and
 * a blank headline cannot block saving an unrelated tab. Inside a row the
 * fields are required, because a row an editor has added is a row the page
 * will draw.
 *
 * Relative, type-only imports only: payload.config.ts loads this file outside
 * Next as well (scripts/generate-types.mts).
 */

function headline(name = "heading", label = "Headline"): Field {
  return swashHeading(name, label, undefined, { required: false });
}

const rubric: Field = {
  name: "label",
  type: "text",
  label: "Rubric",
  admin: { description: "The small spaced capitals above the headline." },
};

/** A section's head: the rubric where the layout has one, the headline, the standfirst. */
export function sectionHead({
  withRubric = true,
  standfirst = "standfirst",
}: { withRubric?: boolean; standfirst?: string } = {}): Field[] {
  return [
    ...(withRubric ? [rubric] : []),
    headline(),
    { name: standfirst, type: "textarea", label: "Standfirst" },
  ];
}

/* ------------------------------------------------------------------ hero */

export function pageHero(): Field {
  return {
    name: "hero",
    type: "group",
    label: "Opening frame",
    admin: {
      description:
        "The rubric, headline, standfirst and credentials row at the top of the page.",
    },
    fields: [
      rubric,
      headline(),
      { name: "standfirst", type: "textarea", label: "Standfirst" },
      textLines("meta", "Credentials row", {
        description: "Short items, dot-separated on the page. Three read best.",
      }),
    ],
  };
}

/* ----------------------------------------------------------------- cards */

/** The four environmental practices, each bound to a drawing that exists. */
export const commitmentIcon: Field = {
  name: "icon",
  type: "select",
  label: "Drawing",
  admin: { width: "50%" },
  options: [
    { label: "Green building", value: "green" },
    { label: "Rainwater harvesting", value: "rainwater" },
    { label: "Waste management", value: "waste" },
    { label: "Energy-efficient design", value: "energy" },
  ],
};

export function cardItems({
  icons = false,
  maxRows,
}: { icons?: boolean; maxRows?: number } = {}): Field {
  return {
    name: "items",
    type: "array",
    label: "Cards",
    maxRows,
    admin: {
      description:
        "The eyebrow is the short line above the title — a place, a step number, a standard.",
    },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "eyebrow",
            type: "text",
            admin: { width: icons ? "50%" : "100%" },
          },
          ...(icons ? [commitmentIcon] : []),
        ],
      },
      { name: "title", type: "text", required: true },
      { name: "body", type: "textarea", required: true },
    ],
  };
}

export function cardSection(
  name: string,
  label: string,
  options: {
    withRubric?: boolean;
    icons?: boolean;
    /** The standfirst's field name, where the shape calls it something else. */
    standfirst?: string;
    figures?: boolean;
  } = {},
): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      ...sectionHead(options),
      ...(options.figures ? [figures()] : []),
      cardItems({ icons: options.icons }),
    ],
  };
}

/* ---------------------------------------------------------------- ledger */

export function ledgerEntries(): Field {
  return {
    name: "entries",
    type: "array",
    label: "Rows",
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "meta",
            type: "text",
            required: true,
            label: "Left column",
            admin: { width: "30%", placeholder: "March 2025" },
          },
          {
            name: "title",
            type: "text",
            required: true,
            admin: { width: "70%" },
          },
        ],
      },
      { name: "note", type: "textarea", label: "Note under the title" },
      {
        type: "row",
        fields: [
          {
            name: "href",
            type: "text",
            label: "Link",
            admin: {
              width: "50%",
              placeholder: "mailto:… or /contact",
              description:
                "Leave empty for a row that is a statement of record rather than a link.",
            },
          },
          {
            name: "action",
            type: "text",
            label: "Action label",
            admin: { width: "25%", placeholder: "Write" },
          },
          {
            name: "state",
            type: "text",
            label: "State",
            admin: {
              width: "25%",
              placeholder: "On request",
              description: "Shown in place of an action on a row with no link.",
            },
          },
        ],
      },
    ],
  };
}

export function ledgerSection(
  name: string,
  label: string,
  { withRubric = true, withNote = true } = {},
): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      ...sectionHead({ withRubric }),
      ledgerEntries(),
      ...(withNote
        ? [
            {
              name: "note",
              type: "textarea",
              label: "Small print under the rows",
            } satisfies Field,
          ]
        : []),
    ],
  };
}

/* ------------------------------------------------------------- the rest */

export function stats(name = "stats", label = "Figures"): Field {
  return {
    name,
    type: "array",
    label,
    maxRows: 4,
    admin: {
      description: "Digits, with at most one decimal. Three or four read best.",
    },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "value",
            type: "text",
            required: true,
            admin: { width: "30%", placeholder: "2.1" },
          },
          {
            name: "suffix",
            type: "text",
            admin: { width: "20%", placeholder: "+" },
          },
          {
            name: "unit",
            type: "text",
            admin: { width: "50%", placeholder: "M sq. ft." },
          },
        ],
      },
      { name: "note", type: "text", required: true, label: "What it counts" },
    ],
  };
}

export function faqSection(name: string, label: string): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      ...sectionHead(),
      {
        name: "items",
        type: "array",
        label: "Questions",
        fields: [
          { name: "question", type: "text", required: true },
          textLines("answer", "Answer", { multiline: true, minRows: 1 }),
        ],
      },
    ],
  };
}

export function story(name = "story", label = "Story"): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      ...sectionHead(),
      textLines("body", "Paragraphs", {
        multiline: true,
        description: "Three paragraphs is what the band is set for.",
      }),
      {
        name: "image",
        type: "upload",
        relationTo: "media",
        label: "Photograph",
        admin: { description: "Portrait. Shown beside the paragraphs." },
      },
      { name: "imageCaption", type: "text", label: "Caption" },
      {
        name: "pullquote",
        type: "textarea",
        label: "Pull-quote",
        admin: { description: "The one sentence that closes the paragraphs." },
      },
    ],
  };
}

export function cta(name = "cta", label = "Button"): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      {
        type: "row",
        fields: [
          { name: "label", type: "text", admin: { width: "50%" } },
          {
            name: "href",
            type: "text",
            label: "Link",
            admin: { width: "50%", placeholder: "/contact" },
          },
        ],
      },
    ],
  };
}

export function figures(
  name = "figures",
  label = "Photographs",
  description?: string,
): Field {
  return {
    name,
    type: "array",
    label,
    admin: { description },
    fields: [
      { name: "image", type: "upload", relationTo: "media", required: true },
      { name: "caption", type: "text" },
    ],
  };
}

/** A plain closing line: a coda, a disclaimer, the small print under a band. */
export function closingLine(name = "coda", label = "Closing line"): Field {
  return { name, type: "textarea", label };
}

export function proseClauses(
  name = "clauses",
  label = "Sections",
  { minRows }: { minRows?: number } = {},
): Field {
  return {
    name,
    type: "array",
    label,
    minRows,
    admin: {
      description:
        "Numbered in order. Each section takes paragraphs, a list of points, or both.",
    },
    fields: [
      { name: "heading", type: "text", required: true },
      textLines("body", "Paragraphs", { multiline: true }),
      textLines("list", "Points", { multiline: true }),
    ],
  };
}

export function proseDoc(name = "doc", label = "Document"): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      {
        name: "updated",
        type: "date",
        label: "Last updated",
        admin: {
          date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" },
          description:
            "Set this on the day the text below is approved — a date older than the text is worse than none.",
        },
      },
      textLines("intro", "Introduction", { multiline: true }),
      proseClauses(),
      { name: "closing", type: "textarea", label: "Closing line" },
      cta("cta", "Closing button"),
    ],
  };
}

/* ------------------------------------------------------------------- SEO */

export function seoTab({
  titleDescription = "The page's own name. The site name is appended to it in the browser tab, search results and share cards.",
}: { titleDescription?: string } = {}): Tab {
  return {
    label: "SEO",
    fields: [
      {
        name: "seo",
        type: "group",
        label: " ",
        admin: {
          description:
            "Leave any field blank to use the page's shipped title and description.",
        },
        fields: [
          {
            name: "title",
            type: "text",
            label: "Title",
            admin: { description: titleDescription },
          },
          {
            name: "description",
            type: "textarea",
            label: "Description",
            admin: {
              description:
                "Shown under the title in search results and on share cards. Around 150–160 characters.",
            },
          },
          {
            name: "image",
            type: "upload",
            relationTo: "media",
            label: "Share image",
            admin: {
              description:
                "1.91:1, and at least 1200 × 630 — 1600 × 840 is what the site's own card is. Leave empty to use that card, which is set on the Home global's SEO tab.",
            },
          },
          {
            name: "noIndex",
            type: "checkbox",
            label: "Hide this page from search engines",
            defaultValue: false,
          },
        ],
      },
    ],
  };
}
