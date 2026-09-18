import { cache } from "react";

import type { Project } from "@/payload-types";
import {
  heading,
  image,
  lines,
  mediaImage,
  optionalText,
  rowId,
  rows,
  text,
  type CmsMedia,
  type Maybe,
} from "./cms/merge";
import { getPayloadClient, readWithFallback } from "./cms/read";
import { mergeFigures, mergeSeo } from "./cms/shapes";
import {
  siteContent,
  type AtmospherePlate,
  type Commitment,
  type PracticeSlide,
  type ProjectSlide,
  type ProjectStatus,
  type SiteContent,
  type VentureSlide,
  type VentureStat,
} from "./content";

/**
 * Reads the `home` global and the `projects` collection, and lays whatever is
 * filled in over the copy shipped in content.ts.
 *
 * The merge is deliberately field-by-field rather than a deep spread: every
 * value falls back independently, so a half-filled global renders a complete
 * page and an editor can never blank a section by clearing one input. It also
 * means the site runs on a fresh database with no `home` row at all — useful
 * for local work and for the first deploy. The primitives live in
 * lib/cms/merge.ts and are shared with every standing page.
 *
 * EVERY LINE AND EVERY PHOTOGRAPH ON THE PAGE IS MERGED HERE. Five sections
 * — the spread, the practice, the ventures, Vihaa and the responsibility
 * ledger — used to take their pictures from the CMS and their words from
 * content.ts, on the grounds that the words were not signed off yet. That was
 * an argument for reviewing the copy, not for keeping it out of reach of the
 * people who have to review it, and it made content.ts a second CMS only a
 * developer could open. It is now the FALLBACK and nothing else.
 *
 * ONE THING IS STILL NOT A FIELD, and it is geometry rather than copy: where
 * each locality sits on the map (lib/mapPoints.ts), which is measured in per
 * cent of one map file and means nothing apart from it. Everything that is a
 * coordinate AND a piece of copy — the pins on the opening photograph, the
 * figures staked on the impact frame — carries its x and y in the row beside
 * the words, with the warning attached.
 */

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

/** A plate of the spread: the photograph, the tag drawn on it, and its note. */
function plate(
  fields: { image: CmsMedia; side?: Maybe<string>; note?: Maybe<string> },
  shipped: AtmospherePlate,
): AtmospherePlate {
  return {
    image: image(fields.image, shipped.image),
    side: text(fields.side, shipped.side),
    // Two of the five plates carry no note at all, so an empty field has to
    // resolve to `undefined` rather than to an empty string the layout would
    // then make room for.
    note: optionalText(fields.note) ?? shipped.note,
  };
}

/**
 * The four environmental practices, and only four.
 *
 * The band is drawn as two ruled pairs, and every practice carries a drawing
 * that has to exist in ResponsibilityIcons. The field caps the array at four
 * and requires the icon, so the only way to arrive here short is a row saved
 * before the cap existed — and a band with three practices in it is a broken
 * band, not a shorter one. So anything that is not exactly four falls back to
 * the shipped set whole.
 */
function commitments(
  value: Maybe<{ icon?: Maybe<Commitment["icon"]>; title: string; detail: string }[]>,
  shipped: [Commitment, Commitment, Commitment, Commitment],
): [Commitment, Commitment, Commitment, Commitment] {
  const filled = (value ?? []).filter((row) => Boolean(row.icon));
  if (filled.length !== shipped.length) return shipped;
  return filled.map((row, index) => ({
    icon: row.icon ?? shipped[index]!.icon,
    title: row.title,
    detail: row.detail,
  })) as [Commitment, Commitment, Commitment, Commitment];
}

/** A wide-tracked label over a figure, as the ventures and Vihaa set one. */
function ventureStat(
  label: Maybe<string>,
  value: Maybe<string>,
  shipped: VentureStat,
): VentureStat {
  return {
    label: text(label, shipped.label),
    value: text(value, shipped.value),
  };
}

/* ------------------------------------------------------------------ read */

/**
 * Every route reads this — the landing page for all of it, the standing pages
 * for the masthead and the close — and a route that also builds its metadata
 * from it reads it twice in one render. `cache` makes that one database round
 * trip per request. Failure policy: lib/cms/read.ts.
 */
export const getSiteContent = cache(
  (): Promise<SiteContent> =>
    readWithFallback("home", readSiteContent, siteContent),
);

async function readSiteContent(): Promise<SiteContent> {
  const payload = await getPayloadClient();

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

  /* ---- Fixed sets, bound to a shipped entry by name rather than by position
     ---------------------------------------------------------------------
     The ventures and the closing frames are short lists the layout is drawn
     for exactly — three partnerships shown one at a time, three frames that
     walk up the building. They are stored as named fields rather than as a
     repeatable one, so an editor cannot add a fourth the design has nowhere
     to put; these records are how those names find the entry they belong to.
     The venture fields are prefixed (`godrejPartner`, …) because field paths
     here are database columns and are only ever added to, never re-housed —
     see the note at the head of globals/Home.ts. */
  const v = home.ventures;
  const ventureFields: Record<
    string,
    {
      image: CmsMedia;
      partner: Maybe<string>;
      kicker: Maybe<string>;
      stat1Label: Maybe<string>;
      stat1Value: Maybe<string>;
      stat2Label: Maybe<string>;
      stat2Value: Maybe<string>;
      blurb: Maybe<string>;
      ctaLabel: Maybe<string>;
      ctaHref: Maybe<string>;
    }
  > = {
    godrej: {
      image: v?.godrej,
      partner: v?.godrejPartner,
      kicker: v?.godrejKicker,
      stat1Label: v?.godrejStat1Label,
      stat1Value: v?.godrejStat1Value,
      stat2Label: v?.godrejStat2Label,
      stat2Value: v?.godrejStat2Value,
      blurb: v?.godrejBlurb,
      ctaLabel: v?.godrejCtaLabel,
      ctaHref: v?.godrejCtaHref,
    },
    shapoorji: {
      image: v?.shapoorji,
      partner: v?.shapoorjiPartner,
      kicker: v?.shapoorjiKicker,
      stat1Label: v?.shapoorjiStat1Label,
      stat1Value: v?.shapoorjiStat1Value,
      stat2Label: v?.shapoorjiStat2Label,
      stat2Value: v?.shapoorjiStat2Value,
      blurb: v?.shapoorjiBlurb,
      ctaLabel: v?.shapoorjiCtaLabel,
      ctaHref: v?.shapoorjiCtaHref,
    },
    redevelopment: {
      image: v?.redevelopment,
      partner: v?.redevelopmentPartner,
      kicker: v?.redevelopmentKicker,
      stat1Label: v?.redevelopmentStat1Label,
      stat1Value: v?.redevelopmentStat1Value,
      stat2Label: v?.redevelopmentStat2Label,
      stat2Value: v?.redevelopmentStat2Value,
      blurb: v?.redevelopmentBlurb,
      ctaLabel: v?.redevelopmentCtaLabel,
      ctaHref: v?.redevelopmentCtaHref,
    },
  };
  const practiceFrames = [
    home.practice?.garden,
    home.practice?.lounge,
    home.practice?.roof,
  ];

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
      // A pin's coordinates are measured against ONE photograph and are not
      // meaningful apart from it, so the field carries x and y in the row
      // beside the copy and says so at the top of the array — replace the
      // picture and every pin has to be measured again. The alternative, of
      // leaving the copy in TypeScript, only meant that the person who could
      // fix a wrong pin was never the person who could see it was wrong.
      pins: rows(home.hero?.pins, fallback.hero.pins, (pin, index) => ({
        id: rowId(pin.id, "pin", index),
        x: pin.x,
        y: pin.y,
        title: pin.title,
        body: lines(pin.body, []),
        cta: {
          label: text(pin.ctaLabel, ""),
          href: text(pin.ctaHref, ""),
        },
        evidence: pin.evidence,
      })),
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
        wordmark: text(
          home.concept?.lockup?.wordmark,
          fallback.concept.lockup.wordmark,
        ),
        caption: lines(
          home.concept?.lockup?.caption,
          fallback.concept.lockup.caption,
        ),
      },
      arcText: text(home.concept?.arcText, fallback.concept.arcText ?? ""),
      body: lines(home.concept?.body, fallback.concept.body),
      legacy: {
        kicker: text(home.concept?.legacy?.kicker, fallback.concept.legacy.kicker),
        heading: heading(
          home.concept?.legacy?.heading,
          fallback.concept.legacy.heading,
        ),
        body: text(home.concept?.legacy?.body, fallback.concept.legacy.body),
        // A disc leads on a figure or on a phrase, never on both, so each
        // half is passed through as written and the component lays the disc
        // out from whichever it was given.
        proofs: rows(
          home.concept?.legacy?.proofs,
          fallback.concept.legacy.proofs,
          (proof, index) => ({
            id: rowId(proof.id, "proof", index),
            icon: proof.icon,
            value: optionalText(proof.value),
            suffix: optionalText(proof.suffix),
            unit: optionalText(proof.unit),
            phrase: optionalText(proof.phrase),
            note: proof.note,
          }),
        ),
        image: image(
          home.concept?.legacyImage,
          fallback.concept.legacy.image,
        ),
      },
      showcase: {
        heading: heading(
          home.concept?.showcaseHeading,
          fallback.concept.showcase.heading,
        ),
        // A list, replaced wholesale once it has a usable row. A row whose
        // photograph cannot be sized is dropped rather than drawn broken.
        slides: rows(
          home.concept?.showcase,
          fallback.concept.showcase.slides,
          (row) => {
            const photo = mediaImage(row.image);
            return photo
              ? { name: row.name, image: photo, caption: row.caption }
              : undefined;
          },
        ),
      },
    },

    gallery: {
      heading: heading(home.gallery?.heading, fallback.gallery.heading),
      standfirst: text(home.gallery?.standfirst, fallback.gallery.standfirst),
      cta: {
        label: text(home.gallery?.ctaLabel, fallback.gallery.cta.label),
        href: text(home.gallery?.ctaHref, fallback.gallery.cta.href),
      },
      slides,
      map: image(home.gallery?.map, fallback.gallery.map),
    },

    /* ---- The spread ------------------------------------------------------
       The five plates are named positions rather than a list: the layout is
       drawn for exactly these five and for the shape each of them is, so a
       sixth photograph would have nowhere to stand and swapping two of them
       swaps two different crops. */
    atmosphere: {
      eyebrow: text(home.atmosphere?.eyebrow, fallback.atmosphere.eyebrow),
      heading: heading(home.atmosphere?.heading, fallback.atmosphere.heading),
      lead: text(home.atmosphere?.lead, fallback.atmosphere.lead),
      plates: {
        deck: plate(
          {
            image: home.atmosphere?.deck,
            side: home.atmosphere?.deckSide,
            note: home.atmosphere?.deckNote,
          },
          fallback.atmosphere.plates.deck,
        ),
        glass: plate(
          {
            image: home.atmosphere?.glass,
            side: home.atmosphere?.glassSide,
            note: home.atmosphere?.glassNote,
          },
          fallback.atmosphere.plates.glass,
        ),
        terrace: plate(
          {
            image: home.atmosphere?.terrace,
            side: home.atmosphere?.terraceSide,
            note: home.atmosphere?.terraceNote,
          },
          fallback.atmosphere.plates.terrace,
        ),
        // No note field: the composition has no space beside this plate, and
        // the tag carries the frame on its own.
        lounge: plate(
          {
            image: home.atmosphere?.lounge,
            side: home.atmosphere?.loungeSide,
          },
          fallback.atmosphere.plates.lounge,
        ),
        garden: plate(
          {
            image: home.atmosphere?.garden,
            side: home.atmosphere?.gardenSide,
            note: home.atmosphere?.gardenNote,
          },
          fallback.atmosphere.plates.garden,
        ),
      },
      detailsTitle: text(
        home.atmosphere?.detailsTitle,
        fallback.atmosphere.detailsTitle,
      ),
      details: lines(home.atmosphere?.details, fallback.atmosphere.details),
      coda: text(home.atmosphere?.coda, fallback.atmosphere.coda),
    },

    /* ---- The practice ----------------------------------------------------
       Every sentence here is a commitment the firm would be held to. That is
       an argument for a sign-off before publishing an edit — which the tab
       in /admin says out loud — not for keeping the words where only a
       developer can reach them. The closing frames stay bound to the places
       they name: `place` is what the lettered plate is drawn from while a
       photograph is still owed. */
    practice: {
      statement: heading(
        home.practice?.statement,
        fallback.practice.statement,
      ),
      detail: text(home.practice?.detail, fallback.practice.detail),
      cta: {
        label: text(home.practice?.ctaLabel, fallback.practice.cta.label),
        href: text(home.practice?.ctaHref, fallback.practice.cta.href),
      },
      commitmentsTitle: text(
        home.practice?.commitmentsTitle,
        fallback.practice.commitmentsTitle,
      ),
      commitments: lines(
        home.practice?.commitments,
        fallback.practice.commitments,
      ),
      portrait: image(home.practice?.portrait, fallback.practice.portrait),
      wide: image(home.practice?.wide, fallback.practice.wide),
      slides: fallback.practice.slides.map(
        (slide, index): PracticeSlide => {
          const frame = practiceFrames[index];
          return {
            id: slide.id,
            place: text(frame?.place, slide.place),
            image: image(frame?.image, slide.image),
            caption: text(frame?.caption, slide.caption),
          };
        },
      ),
    },

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
      leadershipImage: fallback.team.leadershipImage,
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
       Three partnerships, bound by the slide's id. The set is fixed and the
       layout is designed for exactly three, so this walks the shipped list
       rather than reading a repeatable field: a fourth partnership is a
       design change, not an edit. Each slide carries its own two
       measurements, because what is worth measuring differs from one to the
       next — acres in Badlapur, towers in Thane, families rehoused. */
    ventures: {
      heading: heading(home.ventures?.heading, fallback.ventures.heading),
      standfirst: text(
        home.ventures?.standfirst,
        fallback.ventures.standfirst,
      ),
      slides: fallback.ventures.slides.map((slide): VentureSlide => {
        const cms = ventureFields[slide.id];
        return {
          id: slide.id,
          partner: text(cms?.partner, slide.partner),
          kicker: text(cms?.kicker, slide.kicker),
          stats: [
            ventureStat(cms?.stat1Label, cms?.stat1Value, slide.stats[0]),
            ventureStat(cms?.stat2Label, cms?.stat2Value, slide.stats[1]),
          ],
          blurb: text(cms?.blurb, slide.blurb),
          cta: {
            label: text(cms?.ctaLabel, slide.cta.label),
            href: text(cms?.ctaHref, slide.cta.href),
          },
          image: image(cms?.image, slide.image),
        };
      }),
    },

    /* ---- Vihaa -----------------------------------------------------------
       The school is recorded the way every other partnership is, so it
       borrows the ventures' shapes: a name set across a photograph and a pair
       of label-over-value facts. The facts are a fixed pair rather than a
       repeatable field — the layout is a pair — which is why they are four
       named inputs. The partner is still not named anywhere. */
    vihaa: {
      name: {
        mark: text(home.vihaa?.nameMark, fallback.vihaa.name.mark),
        rest: text(home.vihaa?.nameRest, fallback.vihaa.name.rest),
      },
      heading: heading(home.vihaa?.heading, fallback.vihaa.heading),
      standfirst: text(home.vihaa?.standfirst, fallback.vihaa.standfirst),
      facts: [
        ventureStat(
          home.vihaa?.fact1Label,
          home.vihaa?.fact1Value,
          fallback.vihaa.facts[0],
        ),
        ventureStat(
          home.vihaa?.fact2Label,
          home.vihaa?.fact2Value,
          fallback.vihaa.facts[1],
        ),
      ],
      note: text(home.vihaa?.note, fallback.vihaa.note),
      cover: image(home.vihaa?.cover, fallback.vihaa.cover),
      moments: mergeFigures(home.vihaa?.moments, fallback.vihaa.moments),
    },

    /* ---- Testimonials ----------------------------------------------------
       A row stands only with all three of its parts: a quote nobody is named
       against, or a name with nothing said, is dropped rather than set. */
    testimonials: {
      heading: heading(
        home.testimonials?.heading,
        fallback.testimonials.heading,
      ),
      standfirst: text(
        home.testimonials?.standfirst,
        fallback.testimonials.standfirst,
      ),
      voices: rows(
        home.testimonials?.voices,
        fallback.testimonials.voices,
        (row, index) => {
          const name = optionalText(row.name);
          const place = optionalText(row.place);
          const quote = optionalText(row.quote);
          if (!name || !place || !quote) return undefined;
          return { id: rowId(row.id, "voice", index), name, place, quote };
        },
      ),
    },

    /* ---- Responsibility --------------------------------------------------
       Four practices, each bound to a drawing that exists — which is what
       the icon select in the field enforces, and why the set cannot grow past
       four. A list of any other length is refused here rather than handed to
       a layout drawn for two ruled pairs. */
    responsibility: {
      heading: heading(
        home.responsibility?.heading,
        fallback.responsibility.heading,
      ),
      standfirst: text(
        home.responsibility?.standfirst,
        fallback.responsibility.standfirst,
      ),
      image: image(
        home.responsibility?.image,
        fallback.responsibility.image,
        home.responsibility?.imageCaption,
      ),
      environment: {
        label: text(
          home.responsibility?.environment?.label,
          fallback.responsibility.environment.label,
        ),
        lead: text(
          home.responsibility?.environment?.lead,
          fallback.responsibility.environment.lead,
        ),
        commitments: commitments(
          home.responsibility?.environment?.commitments,
          fallback.responsibility.environment.commitments,
        ),
      },
      coda: text(home.responsibility?.coda, fallback.responsibility.coda),
    },

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

    seo: mergeSeo(home.seo, fallback.seo),
  };
}
