import type { GlobalConfig, Tab } from "payload";

import { pageHero, seoTab } from "../../fields/pageFields";
import { revalidateGlobal } from "../../lib/cms/revalidate";

/**
 * One standing page, as a global.
 *
 * Every page global has the same frame: the page's opening frame first, its
 * own sections as tabs after it, and SEO last. It is readable by anyone,
 * grouped under "Pages" in /admin, and revalidates its route on save.
 *
 * The field tree mirrors the page's type in lib/pages/types.ts, and
 * lib/getPageContent.ts merges it over the shipped copy in lib/pages — so an
 * empty global renders the shipped page.
 */
export function pageGlobal({
  slug,
  label,
  path,
  nested = false,
  tabs,
}: {
  slug: string;
  label: string;
  /** The route this global renders; revalidated on save. */
  path: string;
  /** Set where the global also renders the routes under `path`. */
  nested?: boolean;
  tabs: Tab[];
}): GlobalConfig {
  return {
    slug,
    label,
    access: { read: () => true },
    admin: {
      group: "Pages",
      description: `The ${path} page. Leave any field blank to fall back to the copy shipped in lib/pages.`,
    },
    hooks: {
      afterChange: [
        revalidateGlobal({ path, type: nested ? "layout" : "page" }),
      ],
    },
    fields: [
      {
        type: "tabs",
        tabs: [{ label: "Opening", fields: [pageHero()] }, ...tabs, seoTab()],
      },
    ],
  };
}
