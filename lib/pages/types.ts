/**
 * The shapes the standing pages are built from.
 *
 * Six of them, and every page in app/(frontend) is an arrangement of these
 * six. That is the point: a new page is a content file and a route, not a new
 * set of components, and anything that will not fit one of these shapes is a
 * signal to look again at the section rather than to add a seventh.
 *
 *   StoryContent   — a photograph, three paragraphs and a pull-quote.
 *   CardItem       — a hairline-ruled card: icon, eyebrow, title, body.
 *   LedgerEntry    — a ruled row: meta, title, note, optionally actionable.
 *   FaqItem        — a question and its answer, in a disclosure.
 *   Stat           — one figure, its unit and what it counts.
 *   ProseDoc       — a document: clauses, in order, at a reading measure.
 */

import type {
  CommitmentIcon,
  Cta,
  ImageAsset,
  SwashHeading,
} from "../content";

/**
 * The opening frame of a standing page — the landing page's hero, reduced to
 * the parts that survive without a photograph behind them: the rubric, the
 * headline, the rose rule ruled open under it, the standfirst, and the same
 * credentials row the hero closes on.
 */
export interface PageHeroContent {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  meta: string[];
}

/**
 * One entry in a card grid. Three shapes, one component: an icon card
 * (`icon`), a ruled entry (`eyebrow` carries the place, the rubric or the
 * step number), or a plain pair of title and body.
 */
export interface CardItem {
  id: string;
  icon?: CommitmentIcon;
  eyebrow?: string;
  title: string;
  body: string;
}

/** A rubric-led band: a label ruled across the field, a lead, then its cards. */
export interface CardBand {
  label: string;
  lead: string;
  items: CardItem[];
  /**
   * Evidence, where there is any. The site's rule is that photographs are the
   * only filled shapes and therefore the only thing that reads as proof, so a
   * band that HAS photographs shows them and a band that does not shows none
   * rather than borrowing a stock frame to fill the space.
   */
  figures?: ImageAsset[];
}

/** A photograph, the paragraphs beside it, and the line that closes them. */
export interface StoryContent {
  heading: SwashHeading;
  standfirst: string;
  body: string[];
  image: ImageAsset;
  pullquote: string;
}

/**
 * One row of a ledger — a press cutting, an award, an open role, a document,
 * a channel. `href` makes the row actionable; without one it is a statement
 * of record, which is the honest shape for anything not yet published.
 */
export interface LedgerEntry {
  id: string;
  /** The left-hand column: a year, a date, a reference. Kept short. */
  meta: string;
  title: string;
  /** The attribution or qualifier under the title. */
  note?: string;
  href?: string;
  /** Overrides the default action label where the row does something specific. */
  action?: string;
  /** Set where the row is deliberately not a link: "On request", "Closed". */
  state?: string;
}

export interface LedgerBand {
  label?: string;
  heading: SwashHeading;
  standfirst: string;
  entries: LedgerEntry[];
  /** The small print under the ledger. */
  note?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  /** One or more paragraphs. Written to be read, not skimmed for a number. */
  answer: string[];
}

export interface Stat {
  id: string;
  /** Digits, with at most one decimal. Set in the tabular figures. */
  value: string;
  /** Rides the figure, raised and small: "+", "%". */
  suffix?: string;
  /** Set in the swash italic beside the figure: "years", "sq. ft." */
  unit?: string;
  /** What it counts. One short line. */
  note: string;
}

/** One clause of a document. `body` is prose; `list` is a set of points. */
export interface ProseClause {
  id: string;
  heading: string;
  body?: string[];
  list?: string[];
}

export interface ProseDoc {
  /** Shown at the head of the document, and it must be a real date. */
  updated: string;
  intro: string[];
  clauses: ProseClause[];
  /** The line that closes the document — who to write to about it. */
  closing?: string;
  cta?: Cta;
}

/* ---------------------------------------------------------------- pages */

export interface AboutPageContent {
  hero: PageHeroContent;
  story: StoryContent;
  /**
   * No `label`: the band takes the field's full width on cream and its
   * heading is doing the work a rubric would elsewhere.
   */
  principles: {
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
}

/**
 * The projects page holds no projects. The field is `content.gallery.slides`
 * — the same array the landing page scrolls — so the CMS stays the single
 * source for both surfaces; what lives here is only the chrome around it.
 */
export interface ProjectsPageContent {
  hero: PageHeroContent;
  /** The rubric over the status filter. */
  filterLabel: string;
  /** The filter's unfiltered option. */
  allLabel: string;
  /** Shown when a status has nothing filed under it. */
  emptyMessage: string;
  /** The small print under the field — what the photographs are of. */
  note: string;
}

export interface SustainabilityPageContent {
  hero: PageHeroContent;
  environment: CardBand;
  social: CardBand;
  /** The one sentence that covers both ledgers, so it closes the second. */
  coda: string;
  cta: Cta;
}

export interface ExperiencesPageContent {
  hero: PageHeroContent;
  day: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    figures: ImageAsset[];
    items: CardItem[];
  };
  standard: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  coda: string;
  cta: Cta;
}

export interface HospitalityPageContent {
  hero: PageHeroContent;
  story: StoryContent;
  offer: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  stats: Stat[];
  coda: string;
  cta: Cta;
}

export interface PressPageContent {
  hero: PageHeroContent;
  coverage: LedgerBand;
  enquiries: {
    heading: SwashHeading;
    standfirst: string;
    entries: LedgerEntry[];
  };
}

export interface AwardsPageContent {
  hero: PageHeroContent;
  awards: LedgerBand;
  certifications: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  coda: string;
}

export interface BlogPost {
  slug: string;
  date: string;
  category: string;
  title: string;
  /**
   * The same title, broken for the article's own hero, where the site's rule
   * is one swash word per headline. The listing and the metadata use the plain
   * `title`; only /blogs/[slug] sets this one.
   */
  swashTitle: SwashHeading;
  excerpt: string;
  /** The frame the listing card is built on. */
  image: ImageAsset;
  /** The article itself, reused by /blogs/[slug]. */
  body: ProseClause[];
  readingTime: string;
}

export interface BlogPageContent {
  hero: PageHeroContent;
  posts: BlogPost[];
  note: string;
}

export interface NriPageContent {
  hero: PageHeroContent;
  steps: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  faqs: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: FaqItem[];
  };
  disclaimer: string;
  cta: Cta;
}

export interface InvestorsPageContent {
  hero: PageHeroContent;
  stats: Stat[];
  governance: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  documents: LedgerBand;
  cta: Cta;
}

export interface CareersPageContent {
  hero: PageHeroContent;
  culture: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  stats: Stat[];
  roles: LedgerBand;
  process: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
}

export interface ContactPageContent {
  hero: PageHeroContent;
  channels: LedgerBand;
  /** The composed-enquiry band. See components/ContactForm.tsx. */
  form: {
    label: string;
    heading: string;
    standfirst: string;
    note: string;
  };
  office: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    addressLines: string[];
    hours: string[];
    image: ImageAsset;
  };
  cta: Cta;
}

export interface LegalPageContent {
  hero: PageHeroContent;
  doc: ProseDoc;
}
