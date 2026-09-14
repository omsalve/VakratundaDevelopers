import type { Media } from "@/payload-types";
import type { ImageAsset, SwashHeading } from "@/lib/content";

/**
 * The merge primitives every CMS read is built from.
 *
 * Each one takes what Payload returned and the shipped value it stands in
 * for, and returns the shipped value whenever the CMS has nothing usable. That
 * is the whole contract: a half-filled global renders a complete page, and an
 * editor can never blank a section by clearing one input.
 *
 * The input types are structural rather than tied to one global's generated
 * type, so the same primitive serves the `home` global, every page global and
 * the `posts` collection.
 */

export type Maybe<T> = T | null | undefined;

/** An upload field: an id at depth 0, the Media document once populated. */
export type CmsMedia = Maybe<Media | number | string>;

export interface CmsLine {
  text?: string | null;
}

export interface CmsSwash {
  before?: string | null;
  swash?: string | null;
  after?: string | null;
}

/** Payload returns "" for cleared text fields; treat that as absent. */
export function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

/** A text field inside a CMS row, where there is no shipped value to fall back to. */
export function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function lines(value: Maybe<CmsLine[]>, fallback: string[]): string[] {
  const filled = (value ?? [])
    .map((row) => row?.text?.trim())
    .filter((row): row is string => Boolean(row));
  return filled.length > 0 ? filled : fallback;
}

/** As `lines`, for an optional list with no shipped counterpart. */
export function optionalLines(value: Maybe<CmsLine[]>): string[] | undefined {
  const filled = lines(value, []);
  return filled.length > 0 ? filled : undefined;
}

export function heading(
  value: Maybe<CmsSwash>,
  fallback: SwashHeading,
): SwashHeading {
  if (!value?.swash) return fallback;
  return {
    before: value.before ?? undefined,
    swash: value.swash,
    after: value.after ?? undefined,
  };
}

/**
 * The populated, sized upload as an ImageAsset, or undefined. Only that case
 * can stand in for a photograph — next/image needs real intrinsic dimensions.
 */
export function mediaImage(
  media: CmsMedia,
  caption?: Maybe<string>,
): ImageAsset | undefined {
  if (!media || typeof media !== "object") return undefined;
  if (!media.url || !media.width || !media.height) return undefined;
  return {
    src: media.url,
    alt: media.alt,
    width: media.width,
    height: media.height,
    caption: optionalText(caption),
  };
}

/**
 * An upload over a shipped photograph. The caption falls back on its own, so
 * an editor can re-caption the shipped frame without re-uploading it.
 */
export function image(
  media: CmsMedia,
  fallback: ImageAsset,
  caption?: Maybe<string>,
): ImageAsset {
  const resolved = mediaImage(media);
  return {
    ...(resolved ?? fallback),
    alt: resolved?.alt || fallback.alt,
    caption: optionalText(caption) ?? fallback.caption,
  };
}

/**
 * A repeatable field replaces its shipped list wholesale once it has any
 * usable rows — a list is edited as a list, not merged item by item. `map`
 * may return undefined to drop a row it cannot render.
 */
export function rows<Row, Item>(
  value: Maybe<Row[]>,
  fallback: Item[],
  map: (row: Row, index: number) => Item | undefined,
): Item[] {
  const mapped = (value ?? [])
    .map(map)
    .filter((item): item is Item => item !== undefined);
  return mapped.length > 0 ? mapped : fallback;
}

/** Payload gives every array row an id; the prefix only covers a row without one. */
export function rowId(id: Maybe<string>, prefix: string, index: number) {
  return id || `${prefix}-${index + 1}`;
}

/** A URL fragment from a heading, for sections a reader links to by name. */
export function anchor(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

// Pinned to IST so a day-only date reads the same on any server.
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** A Payload date field, set the way the site writes dates: "9 September 2026". */
export function date(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value === "") return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : DATE_FORMAT.format(parsed);
}
