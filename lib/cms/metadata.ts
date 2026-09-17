import type { Metadata } from "next";
import type { SeoContent } from "@/lib/content";

/**
 * Route metadata, built from a page's SEO content.
 *
 * Every public route builds its metadata here from CMS-merged `SeoContent`, so
 * the title, description, canonical URL, Open Graph and Twitter cards are
 * decided in one place and cannot drift between pages.
 *
 * The share title is composed here rather than left to the layout's template:
 * Next applies `title.template` to `title` only, so without it every share
 * card would carry the bare page name.
 */

export const SITE_NAME = "Vakratunda Group";
export const TITLE_TEMPLATE = "%s · Vakratunda";

/**
 * The card used where a page has set none and the Home global has none either.
 * It is the one image on the site that is still a file rather than an upload,
 * and it is the last resort rather than the default: the site-wide card is the
 * Home global's own share image, passed in as `siteImage` by the callers below.
 */
export const DEFAULT_SHARE_IMAGE = {
  url: "/images/og.jpg",
  width: 1600,
  height: 840,
};

export function buildMetadata(
  seo: SeoContent,
  {
    path,
    type = "website",
    absoluteTitle = false,
    siteImage,
  }: {
    /** The canonical path, e.g. "/about". */
    path: string;
    type?: "website" | "article";
    /** The home page's title is the full brand line, not a name to template. */
    absoluteTitle?: boolean;
    /**
     * The site's own card — the Home global's share image — used by any page
     * that has not set one of its own. Passed in rather than read here so this
     * stays a pure function of the content it is given.
     */
    siteImage?: SeoContent["image"];
  },
): Metadata {
  const shareTitle = absoluteTitle
    ? seo.title
    : TITLE_TEMPLATE.replace("%s", seo.title);
  const share = seo.image ?? siteImage;
  const images = share
    ? [
        {
          url: share.src,
          width: share.width,
          height: share.height,
          alt: share.alt,
        },
      ]
    : [DEFAULT_SHARE_IMAGE];

  return {
    title: absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      url: path,
      title: shareTitle,
      description: seo.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: seo.description,
      images: images.map((entry) => entry.url),
    },
    ...(seo.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
