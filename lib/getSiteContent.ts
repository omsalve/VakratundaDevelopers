import config from "@payload-config";
import { getPayload } from "payload";

import type { Media, Project } from "@/payload-types";
import {
  siteContent,
  type ImageAsset,
  type ProjectSlide,
  type ProjectStatus,
  type SiteContent,
  type SwashHeading,
} from "./content";

/**
 * Reads the `home` global and the `projects` collection, and lays whatever is
 * filled in over the copy shipped in content.ts.
 *
 * The merge is deliberately field-by-field rather than a deep spread: every
 * value falls back independently, so a half-filled global renders a complete
 * page and an editor can never blank a section by clearing one input. It also
 * means the site runs on a fresh database with no `home` row at all — useful
 * for local work and for the first deploy.
 */

/* ------------------------------------------------------------- utilities */

/** Payload returns "" for cleared text fields; treat that as absent. */
function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function lines(
  value: { text?: string | null }[] | null | undefined,
  fallback: string[],
): string[] {
  const filled = (value ?? [])
    .map((row) => row?.text?.trim())
    .filter((row): row is string => Boolean(row));
  return filled.length > 0 ? filled : fallback;
}

function heading(
  value:
    | { before?: string | null; swash?: string | null; after?: string | null }
    | null
    | undefined,
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
 * An upload field arrives as an id string when `depth` is 0, and as the Media
 * document when it has been populated. Only the populated, sized case can
 * replace the fallback — next/image needs real intrinsic dimensions.
 */
function image(
  media: Media | number | string | null | undefined,
  fallback: ImageAsset,
): ImageAsset {
  if (!media || typeof media !== "object") return fallback;
  if (!media.url || !media.width || !media.height) return fallback;
  return {
    src: media.url,
    alt: media.alt || fallback.alt,
    width: media.width,
    height: media.height,
    caption: fallback.caption,
  };
}

function isProject(value: unknown): value is Project {
  return typeof value === "object" && value !== null && "name" in value;
}

function toSlide(project: Project, index: number): ProjectSlide {
  const fallback =
    siteContent.gallery.slides[index] ?? siteContent.gallery.slides[0];
  return {
    id: project.slug ?? String(project.id),
    name: project.name,
    locality: project.locality,
    status: (project.status ?? "Completed") as ProjectStatus,
    blurb: text(project.blurb, ""),
    image: image(project.cardImage, fallback.image),
  };
}

/* ------------------------------------------------------------------ read */

/**
 * Never let the CMS take the marketing page down.
 *
 * A missing table, an unreachable database, or a cold start mid-migration all
 * resolve to the shipped copy plus a server-side warning, rather than a 500 on
 * the page a prospective client is looking at. Every string and image this
 * page needs already exists in content.ts; Payload is an override layer, not a
 * hard dependency.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return await readSiteContent();
  } catch (error) {
    console.warn(
      "[getSiteContent] Falling back to lib/content.ts — Payload read failed:",
      error instanceof Error ? error.message : error,
    );
    return siteContent;
  }
}

async function readSiteContent(): Promise<SiteContent> {
  const payload = await getPayload({ config });

  // depth 2 so relationship → upload chains (a stop's projects, and each of
  // those projects' card image) come back populated in one round trip.
  const [home, projects] = await Promise.all([
    payload.findGlobal({ slug: "home", depth: 2 }),
    payload.find({
      collection: "projects",
      depth: 1,
      limit: 100,
      sort: "order",
    }),
  ]);

  const fallback = siteContent;

  /* ---- Projects: the curated order wins, else the collection's own ---- */
  const curated = (home.gallery?.projects ?? []).filter(isProject);
  const all = projects.docs;
  const source = curated.length > 0 ? curated : all;
  const slides =
    source.length > 0 ? source.map(toSlide) : fallback.gallery.slides;

  return {
    nav: {
      links:
        (home.nav?.links ?? []).length > 0
          ? home.nav!.links!.map((link) => ({
              label: link.label,
              href: link.href,
            }))
          : fallback.nav.links,
      cta: {
        label: text(home.nav?.ctaLabel, fallback.nav.cta.label),
        href: text(home.nav?.ctaHref, fallback.nav.cta.href),
      },
    },

    hero: {
      heading: heading(home.hero?.heading, fallback.hero.heading),
      meta: lines(home.hero?.meta, fallback.hero.meta),
      standfirst: text(home.hero?.standfirst, fallback.hero.standfirst),
      primaryCta: {
        label: text(home.hero?.ctaLabel, fallback.hero.primaryCta.label),
        href: text(home.hero?.ctaHref, fallback.hero.primaryCta.href),
      },
      scrollCue: text(home.hero?.scrollCue, fallback.hero.scrollCue),
      background: image(home.hero?.background, fallback.hero.background),
      // Not an editable field, and deliberately so: a pin's coordinates are
      // measured against ONE photograph, so they are not meaningful apart
      // from it. Handing them to the CMS without also binding them to the
      // upload above would let an editor swap the picture and leave five
      // annotations pointing at whatever happened to move underneath them.
      // Giving them a field means giving them a picker that places them on
      // the image — see README.
      pins: fallback.hero.pins,
    },

    immersive: {
      heading: heading(home.immersive?.heading, fallback.immersive.heading),
      standfirst: text(
        home.immersive?.standfirst,
        fallback.immersive.standfirst,
      ),
      hotspots:
        (home.immersive?.hotspots ?? []).length > 0
          ? home.immersive!.hotspots!.map((spot, index) => ({
              id: spot.id ?? `hotspot-${index}`,
              x: spot.x,
              y: spot.y,
              value: spot.value,
              unit: spot.unit ?? undefined,
              title: spot.title,
              body: spot.body,
            }))
          : fallback.immersive.hotspots,
    },

    concept: {
      lockup: {
        // Each half falls back on its own: clearing one input must not take
        // the other half of the wordmark down with it.
        before: text(
          home.concept?.lockup?.before,
          fallback.concept.lockup.before,
        ),
        after: text(home.concept?.lockup?.after, fallback.concept.lockup.after),
        caption: lines(
          home.concept?.lockup?.caption,
          fallback.concept.lockup.caption,
        ),
      },
      // Not an editable field: the curved line is part of the transition's
      // drawing, sized and tracked for the arc it sits on.
      arcText: fallback.concept.arcText,
      body: lines(home.concept?.body, fallback.concept.body),
      // Not editable either: the five discs are a drawing, and their copy is
      // fitted to the circles it is set in. Giving it to the CMS would need a
      // repeatable field with a length the layout can rely on, which is a
      // schema change rather than a mapping one.
      legacy: fallback.concept.legacy,
      showcase: {
        heading: fallback.concept.showcase.heading,
        // The global carries one Photograph and one Caption, and they edit
        // the FIRST frame of the showcase. The other two are shipped copy —
        // an editor who wants them replaced needs a repeatable field here,
        // and that is a schema change rather than a mapping one.
        slides: fallback.concept.showcase.slides.map((slide, index) =>
          index === 0
            ? {
                image: image(home.concept?.image, slide.image),
                caption: text(home.concept?.imageCaption, slide.caption),
              }
            : slide,
        ),
      },
    },

    gallery: {
      heading: heading(home.gallery?.heading, fallback.gallery.heading),
      standfirst: text(home.gallery?.standfirst, fallback.gallery.standfirst),
      slides,
    },

    /* ---- The spread ------------------------------------------------------
       Shipped copy only, as `practice` is, and for the same reason: every
       line in it is written to stand behind a claim that has not been signed
       off yet, and the five photographs are placed for five specific crops
       rather than chosen from a library. When it needs an editor, add an
       `atmosphere` group to the `home` global and merge it field-by-field
       here the way `gallery` and `team` are merged below. */
    atmosphere: fallback.atmosphere,

    /* ---- The practice ----------------------------------------------------
       Shipped copy only, as `ventures` is. Every sentence in it is a
       commitment the firm would be held to, and it is not signed off yet; a
       CMS field would let it be edited before it has been agreed. When it
       needs an editor, add a `practice` group to the `home` global and merge
       it field-by-field here the way `gallery` and `team` are merged below. */
    practice: fallback.practice,

    /* ---- Team ------------------------------------------------------------
       Every field falls back on its own, as everywhere else here. A portrait
       that has not been uploaded resolves to the shipped `ImageAsset` — whose
       `src` is the empty string — and PortraitPlate draws its plate instead;
       there is no third state and nothing to branch on further down. */
    team: {
      heading: heading(home.team?.heading, fallback.team.heading),
      standfirst: text(home.team?.standfirst, fallback.team.standfirst),
      interstitial: {
        heading: heading(
          home.team?.interstitial?.heading,
          fallback.team.interstitial.heading,
        ),
        subtext: text(
          home.team?.interstitial?.subtext,
          fallback.team.interstitial.subtext,
        ),
      },
      intro: {
        image: image(home.team?.intro?.image, fallback.team.intro.image),
        ctaLabel: text(
          home.team?.intro?.ctaLabel,
          fallback.team.intro.ctaLabel,
        ),
      },
      chairman: {
        id: fallback.team.chairman.id,
        name: text(home.team?.chairman?.name, fallback.team.chairman.name),
        title: text(home.team?.chairman?.title, fallback.team.chairman.title),
        quote: heading(
          home.team?.chairman?.quote,
          fallback.team.chairman.quote,
        ),
        superpower: text(
          home.team?.chairman?.superpower,
          fallback.team.chairman.superpower,
        ),
        bio: text(home.team?.chairman?.bio, fallback.team.chairman.bio),
        portrait: image(
          home.team?.chairman?.portrait,
          fallback.team.chairman.portrait,
        ),
        ctaLabel: text(
          home.team?.chairman?.ctaLabel,
          fallback.team.chairman.ctaLabel,
        ),
      },
      leadership:
        (home.team?.leadership ?? []).length > 0
          ? home.team!.leadership!.map((member, index) => {
              // Positional, so an editor who fills in two of three rows still
              // gets a portrait for the third rather than a broken plate.
              const shipped =
                fallback.team.leadership[index] ?? fallback.team.leadership[0]!;
              return {
                id: member.id ?? `leader-${index}`,
                name: member.name,
                title: member.title,
                superpower: member.superpower,
                bio: member.bio,
                portrait: image(member.portrait, shipped.portrait),
              };
            })
          : fallback.team.leadership,
      roles:
        (home.team?.roles ?? []).length > 0
          ? home.team!.roles!.map((role, index) => ({
              id: role.id ?? `role-${index}`,
              icon: role.icon,
              title: role.title,
              descriptor: role.descriptor,
            }))
          : fallback.team.roles,
      roleCta: {
        label: text(home.team?.roleCtaLabel, fallback.team.roleCta.label),
        href: text(home.team?.roleCtaHref, fallback.team.roleCta.href),
      },
      bioCtaLabel: text(home.team?.bioCtaLabel, fallback.team.bioCtaLabel),
    },

    /* ---- Joint ventures --------------------------------------------------
       Shipped copy only, for now. The three partnerships are fixed and the
       layout is designed for exactly three; when they need an editor, add a
       `ventures` group to the `home` global and merge it field-by-field here
       the way `gallery` and `team` are merged above. */
    ventures: fallback.ventures,

    /* ---- Responsibility --------------------------------------------------
       Shipped copy only, as `ventures` is. Both halves are fixed in number —
       two initiatives, four commitments — and each commitment is bound to a
       drawing that exists; an editor would need the same select the team
       roles use before this can be opened up. */
    responsibility: fallback.responsibility,

    finalCta: {
      quote: heading(home.finalCta?.quote, fallback.finalCta.quote),
      attribution: text(
        home.finalCta?.attribution,
        fallback.finalCta.attribution,
      ),
      proofs:
        (home.finalCta?.proofs ?? []).length > 0
          ? home.finalCta!.proofs!.map((proof) => ({
              title: proof.title,
              body: proof.body,
            }))
          : fallback.finalCta.proofs,
      primaryCta: {
        label: text(
          home.finalCta?.ctaLabel,
          fallback.finalCta.primaryCta.label,
        ),
        href: text(home.finalCta?.ctaHref, fallback.finalCta.primaryCta.href),
      },
      contact: {
        email: text(home.finalCta?.email, fallback.finalCta.contact.email),
        addressLines: lines(
          home.finalCta?.addressLines,
          fallback.finalCta.contact.addressLines,
        ),
      },
    },

    legal: text(home.legal, fallback.legal),
  };
}
