import type {
  CommitmentIcon,
  Cta,
  ImageAsset,
  SeoContent,
  SwashHeading,
} from "@/lib/content";
import type {
  CardItem,
  FaqItem,
  LedgerEntry,
  PageHeroContent,
  ProseClause,
  ProseDoc,
  Stat,
  StoryContent,
} from "@/lib/pages";
import {
  anchor,
  date,
  heading,
  image,
  lines,
  mediaImage,
  optionalLines,
  optionalText,
  rowId,
  rows,
  text,
  type CmsLine,
  type CmsMedia,
  type CmsSwash,
  type Maybe,
} from "./merge";

/**
 * Shape merges: one per builder in fields/pageFields.ts, each laying a CMS
 * group over the shipped value of the shape it was built from.
 *
 * The `Cms*` input types are the structural subset of what Payload generates
 * for those builders, so any global that uses a builder can hand its group
 * straight to the matching merge without a cast.
 */

/* ------------------------------------------------------------------ head */

export interface CmsSectionHead {
  label?: Maybe<string>;
  heading?: Maybe<CmsSwash>;
  standfirst?: Maybe<string>;
}

interface SectionHead {
  label?: string;
  heading: SwashHeading;
  standfirst: string;
}

/** The label is only merged where the shipped shape has one to fall back to. */
function mergeHead(value: Maybe<CmsSectionHead>, fallback: SectionHead) {
  return {
    ...(fallback.label !== undefined
      ? { label: text(value?.label, fallback.label) }
      : {}),
    heading: heading(value?.heading, fallback.heading),
    standfirst: text(value?.standfirst, fallback.standfirst),
  };
}

/** A section head over any shape that carries one; the rest passes through. */
export function mergeSection<T extends SectionHead>(
  value: Maybe<CmsSectionHead>,
  fallback: T,
): T {
  return { ...fallback, ...mergeHead(value, fallback) };
}

export interface CmsHero extends CmsSectionHead {
  meta?: Maybe<CmsLine[]>;
}

export function mergeHero(
  value: Maybe<CmsHero>,
  fallback: PageHeroContent,
): PageHeroContent {
  return {
    label: text(value?.label, fallback.label),
    heading: heading(value?.heading, fallback.heading),
    standfirst: text(value?.standfirst, fallback.standfirst),
    meta: lines(value?.meta, fallback.meta),
  };
}

/* ------------------------------------------------------------------- cta */

export interface CmsCta {
  label?: Maybe<string>;
  href?: Maybe<string>;
}

export function mergeCta(value: Maybe<CmsCta>, fallback: Cta): Cta {
  return {
    label: text(value?.label, fallback.label),
    href: text(value?.href, fallback.href),
  };
}

/** A button with nothing shipped behind it: both halves, or none. */
function optionalCta(value: Maybe<CmsCta>): Cta | undefined {
  const label = optionalText(value?.label);
  const href = optionalText(value?.href);
  return label && href ? { label, href } : undefined;
}

/* ----------------------------------------------------------------- cards */

export interface CmsCard {
  id?: Maybe<string>;
  icon?: Maybe<CommitmentIcon>;
  eyebrow?: Maybe<string>;
  title: string;
  body: string;
}

export function mergeCards(
  value: Maybe<CmsCard[]>,
  fallback: CardItem[],
): CardItem[] {
  return rows(value, fallback, (row, index) => ({
    id: rowId(row.id, "card", index),
    icon: row.icon ?? undefined,
    eyebrow: optionalText(row.eyebrow),
    title: row.title,
    body: row.body,
  }));
}

export function mergeCardSection<
  T extends SectionHead & { items: CardItem[] },
>(value: Maybe<CmsSectionHead & { items?: Maybe<CmsCard[]> }>, fallback: T): T {
  return {
    ...fallback,
    ...mergeHead(value, fallback),
    items: mergeCards(value?.items, fallback.items),
  };
}

/* ---------------------------------------------------------------- ledger */

export interface CmsLedgerEntry {
  id?: Maybe<string>;
  meta: string;
  title: string;
  note?: Maybe<string>;
  href?: Maybe<string>;
  action?: Maybe<string>;
  state?: Maybe<string>;
}

export function mergeEntries(
  value: Maybe<CmsLedgerEntry[]>,
  fallback: LedgerEntry[],
): LedgerEntry[] {
  return rows(value, fallback, (row, index) => ({
    id: rowId(row.id, "row", index),
    meta: row.meta,
    title: row.title,
    note: optionalText(row.note),
    href: optionalText(row.href),
    action: optionalText(row.action),
    state: optionalText(row.state),
  }));
}

export function mergeLedgerSection<
  T extends SectionHead & { entries: LedgerEntry[]; note?: string },
>(
  value: Maybe<
    CmsSectionHead & {
      entries?: Maybe<CmsLedgerEntry[]>;
      note?: Maybe<string>;
    }
  >,
  fallback: T,
): T {
  return {
    ...fallback,
    ...mergeHead(value, fallback),
    entries: mergeEntries(value?.entries, fallback.entries),
    ...(fallback.note !== undefined
      ? { note: text(value?.note, fallback.note) }
      : {}),
  };
}

/* ----------------------------------------------------------------- stats */

export interface CmsStat {
  id?: Maybe<string>;
  value: string;
  suffix?: Maybe<string>;
  unit?: Maybe<string>;
  note: string;
}

export function mergeStats(value: Maybe<CmsStat[]>, fallback: Stat[]): Stat[] {
  return rows(value, fallback, (row, index) => ({
    id: rowId(row.id, "stat", index),
    value: row.value,
    suffix: optionalText(row.suffix),
    unit: optionalText(row.unit),
    note: row.note,
  }));
}

/* ------------------------------------------------------------------ faqs */

export interface CmsFaq {
  id?: Maybe<string>;
  question: string;
  answer?: Maybe<CmsLine[]>;
}

export function mergeFaqSection<T extends SectionHead & { items: FaqItem[] }>(
  value: Maybe<CmsSectionHead & { items?: Maybe<CmsFaq[]> }>,
  fallback: T,
): T {
  return {
    ...fallback,
    ...mergeHead(value, fallback),
    // A question with no answer is dropped rather than drawn as an empty
    // disclosure.
    items: rows(value?.items, fallback.items, (row, index) => {
      const answer = lines(row.answer, []);
      return answer.length > 0
        ? { id: rowId(row.id, "faq", index), question: row.question, answer }
        : undefined;
    }),
  };
}

/* ----------------------------------------------------------------- story */

export interface CmsStory extends CmsSectionHead {
  body?: Maybe<CmsLine[]>;
  image?: CmsMedia;
  imageCaption?: Maybe<string>;
  pullquote?: Maybe<string>;
}

export function mergeStory(
  value: Maybe<CmsStory>,
  fallback: StoryContent,
): StoryContent {
  return {
    ...mergeHead(value, fallback),
    label: text(value?.label, fallback.label),
    body: lines(value?.body, fallback.body),
    image: image(value?.image, fallback.image, value?.imageCaption),
    pullquote: text(value?.pullquote, fallback.pullquote),
  };
}

/* --------------------------------------------------------------- figures */

export interface CmsFigure {
  image?: CmsMedia;
  caption?: Maybe<string>;
}

/** An upload that cannot be sized is dropped, never drawn broken. */
export function mergeFigures(
  value: Maybe<CmsFigure[]>,
  fallback: ImageAsset[],
): ImageAsset[] {
  return rows(value, fallback, (row) => mediaImage(row.image, row.caption));
}

/* ----------------------------------------------------------------- prose */

export interface CmsClause {
  id?: Maybe<string>;
  heading: string;
  body?: Maybe<CmsLine[]>;
  list?: Maybe<CmsLine[]>;
}

/**
 * Clause ids are the anchors the table of contents links to, so a CMS clause
 * takes its id from its heading — "#governing-law", not a row's hex id — and
 * a repeated heading is numbered rather than left to collide.
 */
export function mergeClauses(
  value: Maybe<CmsClause[]>,
  fallback: ProseClause[],
): ProseClause[] {
  const seen = new Map<string, number>();
  return rows(value, fallback, (row, index) => {
    const base = anchor(row.heading, rowId(row.id, "section", index));
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return {
      id: count === 1 ? base : `${base}-${count}`,
      heading: row.heading,
      body: optionalLines(row.body),
      list: optionalLines(row.list),
    };
  });
}

export interface CmsProseDoc {
  updated?: Maybe<string>;
  intro?: Maybe<CmsLine[]>;
  clauses?: Maybe<CmsClause[]>;
  closing?: Maybe<string>;
  cta?: Maybe<CmsCta>;
}

export function mergeProseDoc(
  value: Maybe<CmsProseDoc>,
  fallback: ProseDoc,
): ProseDoc {
  return {
    updated: date(value?.updated, fallback.updated),
    intro: lines(value?.intro, fallback.intro),
    clauses: mergeClauses(value?.clauses, fallback.clauses),
    closing: optionalText(value?.closing) ?? fallback.closing,
    cta: fallback.cta
      ? mergeCta(value?.cta, fallback.cta)
      : optionalCta(value?.cta),
  };
}

/* ------------------------------------------------------------------- SEO */

export interface CmsSeo {
  title?: Maybe<string>;
  description?: Maybe<string>;
  image?: CmsMedia;
  noIndex?: Maybe<boolean>;
}

export function mergeSeo(
  value: Maybe<CmsSeo>,
  fallback: SeoContent,
): SeoContent {
  return {
    title: text(value?.title, fallback.title),
    description: text(value?.description, fallback.description),
    image: mediaImage(value?.image) ?? fallback.image,
    noIndex: value?.noIndex ?? fallback.noIndex,
  };
}
