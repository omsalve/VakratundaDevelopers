import type { Field } from "payload";

/**
 * The site's headline shape: three text parts, the middle one rendered in the
 * swash italic. Used by every section, so it lives here rather than being
 * retyped six times.
 *
 * Editors see three plain inputs with an example, not a markup convention.
 */
export function swashHeading(
  name: string,
  label: string,
  defaults?: { before?: string; swash?: string; after?: string },
  /**
   * `required: false` for globals whose every field falls back to shipped
   * copy — a required italic word would block saving an unrelated tab.
   */
  options?: { required?: boolean },
): Field {
  return {
    name,
    type: "group",
    label,
    admin: {
      description:
        'The middle word is set in the italic display face — e.g. before: "The ", italic: "story", after: " behind the structure".',
    },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "before",
            type: "text",
            label: "Before",
            defaultValue: defaults?.before,
            admin: { width: "34%" },
          },
          {
            name: "swash",
            type: "text",
            label: "Italic word",
            required: options?.required ?? true,
            defaultValue: defaults?.swash,
            admin: { width: "32%" },
          },
          {
            name: "after",
            type: "text",
            label: "After",
            defaultValue: defaults?.after,
            admin: { width: "34%" },
          },
        ],
      },
    ],
  };
}

/** A repeatable plain-text line (meta rows, paragraphs, address lines). */
export function textLines(
  name: string,
  label: string,
  options?: { multiline?: boolean; description?: string; minRows?: number },
): Field {
  return {
    name,
    type: "array",
    label,
    minRows: options?.minRows,
    admin: { description: options?.description },
    // Split rather than a ternary on `type`: Field is a discriminated union,
    // so the tag has to be a literal for the rest of the shape to narrow.
    fields: [
      options?.multiline
        ? { name: "text", type: "textarea", required: true }
        : { name: "text", type: "text", required: true },
    ],
  };
}
