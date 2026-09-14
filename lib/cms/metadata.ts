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
export const DEFAULT_SHARE_IMAGE = {
  url: "/images/og.jpg",
  width: 1200,
  height: 630,
};

export function buildMetadata(
  seo: SeoContent,
  {
    path,
    type = "website",
    absoluteTitle = false,
  }: {
    /** The canonical path, e.g. "/about". */
    path: string;
    type?: "website" | "article";
    /** The home page's title is the full brand line, not a name to template. */
    absoluteTitle?: boolean;
  },
): Metadata {
  const shareTitle = absoluteTitle
    ? seo.title
    : TITLE_TEMPLATE.replace("%s", seo.title);
  const images = seo.image
    ? [
        {
          url: seo.image.src,
          width: seo.image.width,
          height: seo.image.height,
          alt: seo.image.alt,
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
