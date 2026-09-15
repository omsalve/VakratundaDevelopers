import type { Metadata } from "next";
import type { DataFromGlobalSlug, GlobalSlug } from "payload";
import { cache } from "react";

import type { SeoContent } from "./content";
import { buildMetadata } from "./cms/metadata";
import { heading, image, lines, text, type Maybe } from "./cms/merge";
import { getPayloadClient, readWithFallback } from "./cms/read";
import {
  mergeCards,
  mergeCardSection,
  mergeCta,
  mergeFaqSection,
  mergeFigures,
  mergeHero,
  mergeLedgerSection,
  mergeProseDoc,
  mergeSection,
  mergeSeo,
  mergeStats,
  mergeStory,
  type CmsHero,
  type CmsSeo,
} from "./cms/shapes";
import { getSiteContent } from "./getSiteContent";
import {
  aboutPage,
  awardsPage,
  blogPage,
  careersPage,
  contactPage,
  disclaimerPage,
  experiencesPage,
  grievancePage,
  hospitalityPage,
  investorsPage,
  nriPage,
  pressPage,
  projectsPage,
  sustainabilityPage,
  termsPage,
  type LegalPageContent,
  type PageHeroContent,
} from "./pages";

/**
 * The standing pages' content: each page global, merged over its shipped
 * copy in lib/pages.
 *
 * ONE REGISTRY, ONE READ PATH. Every page is an entry below — its global's
 * slug, its shipped fallback, and how its own sections merge — and every route
 * reads it the same way:
 *
 *   export function generateMetadata() {
 *     return getPageMetadata("about", "/about");
 *   }
 *   export default async function AboutPage() {
 *     const { site, page } = await getStandingPage("about");
 *
 * The opening frame and SEO are merged here for every page, because every page
 * global has them (globals/pages/pageGlobal.ts). Reads are cached per request,
 * so metadata and the page share one query, and they fall back to the shipped
 * copy on any failure (lib/cms/read.ts).
 *
 * A new page is: a type in lib/pages/types.ts, its copy in lib/pages, a global
 * in globals/pages, and an entry here.
 */

interface StandingPage {
  seo: SeoContent;
  hero: PageHeroContent;
}

interface PageSource<S extends GlobalSlug, C extends StandingPage> {
  slug: S;
  fallback: C;
  merge: (doc: DataFromGlobalSlug<S>, fallback: C) => C;
}

function definePage<S extends GlobalSlug, C extends StandingPage>(
  slug: S,
  fallback: C,
  sections: (
    doc: DataFromGlobalSlug<S>,
    fallback: C,
  ) => Omit<C, keyof StandingPage>,
): PageSource<S, C> {
  return {
    slug,
    fallback,
    merge: (doc, shipped) => {
      // Every page global is built by pageGlobal(), which gives it both.
      const frame = doc as { seo?: Maybe<CmsSeo>; hero?: Maybe<CmsHero> };
      return {
        ...sections(doc, shipped),
        seo: mergeSeo(frame.seo, shipped.seo),
        hero: mergeHero(frame.hero, shipped.hero),
      } as C;
    },
  };
}

function legalPage(
  slug: "terms-page" | "disclaimer-page" | "grievance-page",
  fallback: LegalPageContent,
) {
  return definePage(slug, fallback, (doc, shipped) => ({
    doc: mergeProseDoc(doc.doc, shipped.doc),
  }));
}

const pages = {
  about: definePage("about-page", aboutPage, (doc, shipped) => ({
    story: mergeStory(doc.story, shipped.story),
    principles: mergeCardSection(doc.principles, shipped.principles),
  })),

  projects: definePage("projects-page", projectsPage, (doc, shipped) => ({
    filterLabel: text(doc.filterLabel, shipped.filterLabel),
    allLabel: text(doc.allLabel, shipped.allLabel),
    emptyMessage: text(doc.emptyMessage, shipped.emptyMessage),
    note: text(doc.note, shipped.note),
  })),

  sustainability: definePage(
    "sustainability-page",
    sustainabilityPage,
    (doc, shipped) => ({
      environment: {
        ...shipped.environment,
        label: text(doc.environment?.label, shipped.environment.label),
        heading: heading(doc.environment?.heading, shipped.environment.heading),
        lead: text(doc.environment?.lead, shipped.environment.lead),
        items: mergeCards(doc.environment?.items, shipped.environment.items),
      },
      coda: text(doc.coda, shipped.coda),
      cta: mergeCta(doc.cta, shipped.cta),
    }),
  ),

  experiences: definePage("experiences-page", experiencesPage, (doc, shipped) => ({
    day: {
      ...mergeCardSection(doc.day, shipped.day),
      figures: mergeFigures(doc.day?.figures, shipped.day.figures),
    },
    standard: mergeCardSection(doc.standard, shipped.standard),
    coda: text(doc.coda, shipped.coda),
    cta: mergeCta(doc.cta, shipped.cta),
  })),

  hospitality: definePage("hospitality-page", hospitalityPage, (doc, shipped) => ({
    story: mergeStory(doc.story, shipped.story),
    offer: mergeCardSection(doc.offer, shipped.offer),
    stats: mergeStats(doc.stats, shipped.stats),
    coda: text(doc.coda, shipped.coda),
    cta: mergeCta(doc.cta, shipped.cta),
  })),

  nri: definePage("nri-page", nriPage, (doc, shipped) => ({
    steps: mergeCardSection(doc.steps, shipped.steps),
    faqs: mergeFaqSection(doc.faqs, shipped.faqs),
    disclaimer: text(doc.disclaimer, shipped.disclaimer),
    cta: mergeCta(doc.cta, shipped.cta),
  })),

  investors: definePage("investors-page", investorsPage, (doc, shipped) => ({
    statsLabel: text(doc.statsLabel, shipped.statsLabel),
    stats: mergeStats(doc.stats, shipped.stats),
    governance: mergeCardSection(doc.governance, shipped.governance),
    documents: mergeLedgerSection(doc.documents, shipped.documents),
    coda: text(doc.coda, shipped.coda),
    cta: mergeCta(doc.cta, shipped.cta),
  })),

  press: definePage("press-page", pressPage, (doc, shipped) => ({
    coverage: mergeLedgerSection(doc.coverage, shipped.coverage),
    enquiries: mergeLedgerSection(doc.enquiries, shipped.enquiries),
  })),

  awards: definePage("awards-page", awardsPage, (doc, shipped) => ({
    awards: mergeLedgerSection(doc.awards, shipped.awards),
    certifications: mergeCardSection(doc.certifications, shipped.certifications),
    coda: text(doc.coda, shipped.coda),
  })),

  blog: definePage("blog-page", blogPage, (doc, shipped) => ({
    listing: mergeSection(doc.listing, shipped.listing),
    note: text(doc.note, shipped.note),
    article: {
      contentsLabel: text(
        doc.article?.contentsLabel,
        shipped.article.contentsLabel,
      ),
      updatedLabel: text(doc.article?.updatedLabel, shipped.article.updatedLabel),
      byline: lines(doc.article?.byline, shipped.article.byline),
      backCta: mergeCta(doc.article?.backCta, shipped.article.backCta),
    },
  })),

  careers: definePage("careers-page", careersPage, (doc, shipped) => ({
    culture: mergeCardSection(doc.culture, shipped.culture),
    stats: mergeStats(doc.stats, shipped.stats),
    roles: mergeLedgerSection(doc.roles, shipped.roles),
    process: mergeCardSection(doc.process, shipped.process),
  })),

  contact: definePage("contact-page", contactPage, (doc, shipped) => ({
    channels: mergeLedgerSection(doc.channels, shipped.channels),
    form: {
      label: text(doc.form?.label, shipped.form.label),
      heading: text(doc.form?.heading, shipped.form.heading),
      standfirst: text(doc.form?.standfirst, shipped.form.standfirst),
      note: text(doc.form?.note, shipped.form.note),
    },
    office: {
      ...mergeSection(doc.office, shipped.office),
      addressLines: lines(doc.office?.addressLines, shipped.office.addressLines),
      hours: lines(doc.office?.hours, shipped.office.hours),
      image: image(
        doc.office?.image,
        shipped.office.image,
        doc.office?.imageCaption,
      ),
    },
    // No field: the route does not render this, and an input for it would be
    // an edit that changes nothing on the page.
    cta: shipped.cta,
  })),

  terms: legalPage("terms-page", termsPage),
  disclaimer: legalPage("disclaimer-page", disclaimerPage),
  grievance: legalPage("grievance-page", grievancePage),
};

export type PageKey = keyof typeof pages;
export type PageContent<K extends PageKey> = (typeof pages)[K]["fallback"];

export const getPageContent = cache(async function getPageContent<
  K extends PageKey,
>(key: K): Promise<PageContent<K>> {
  const source = pages[key] as unknown as PageSource<
    GlobalSlug,
    PageContent<K>
  >;

  return readWithFallback(
    source.slug,
    async () => {
      const payload = await getPayloadClient();
      // depth 1 populates the uploads in groups and array rows.
      const doc = await payload.findGlobal({ slug: source.slug, depth: 1 });
      return source.merge(doc as DataFromGlobalSlug<GlobalSlug>, source.fallback);
    },
    source.fallback,
  );
});

/** A standing page and the site chrome around it — the masthead and the close. */
export async function getStandingPage<K extends PageKey>(key: K) {
  const [site, page] = await Promise.all([
    getSiteContent(),
    getPageContent(key),
  ]);
  return { site, page };
}

export async function getPageMetadata(
  key: PageKey,
  path: string,
): Promise<Metadata> {
  const { seo } = await getPageContent(key);
  return buildMetadata(seo, { path });
}
