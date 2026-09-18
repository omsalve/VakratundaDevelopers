/**
 * Where the shipped photographs live.
 *
 * The fallback content in lib/content.ts and lib/pages still names a photograph
 * for every spot, so a page renders whole when the CMS cannot be read. Those
 * files are not in the repository — public/images is gitignored, because the
 * CMS is where photographs are managed — they are hosted on Cloudinary under
 * `site/`, at the same relative path they had in public/images.
 *
 *   siteImage("vihaa/vihaa-3174.jpg")
 *
 * The URL keeps the file's extension, so the same checks that read a path
 * (PortraitPlate's cut-out test) read these too. No `f_auto`: next/image
 * re-encodes every remote image itself.
 *
 * To add or replace one, put the file in public/images and run
 * `npm run upload:site-images` — it uploads every path named through this
 * helper. The cloud name is not a secret; it is in every Cloudinary URL.
 */

export const SITE_IMAGES_BASE =
  "https://res.cloudinary.com/dwsxaetnd/image/upload/site";

export function siteImage(file: string): string {
  return `${SITE_IMAGES_BASE}/${file}`;
}
