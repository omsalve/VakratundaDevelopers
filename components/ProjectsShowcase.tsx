"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ARC_RUN } from "@/lib/arc";
import type { GalleryContent, SwashHeading } from "@/lib/content";
import { projectPlaces } from "@/lib/mapPoints";
import { gsap, useGsapScope } from "@/lib/motion";
import {
  RegionMap,
  RegionMapOverlay,
  RegionMapCanvas,
  type RegionMapControl,
} from "./RegionMap";
import styles from "./ProjectsShowcase.module.css";
import FitImage from "@/components/FitImage";

/**
 * Our Projects — the demo transition (demos/our-projects-transition), ported
 * same-to-same into the page, recoloured to the site's navy / rose / cream.
 * No florals, by request: the photograph, the title, and the rail are the
 * whole composition.
 *
 * TWO LAYOUTS, from the same markup — the house pattern:
 *
 *   · DEFAULT (no JS, reduced motion, or under 60rem). An ordinary navy
 *     section: heading, standfirst, and every project as a card in a grid.
 *     Nothing is sticky, nothing is hidden, and the section is complete —
 *     the link to /projects included, at the foot of the grid.
 *
 *   · `.motion-on`, 60rem and up. The section grows to `--span` viewports and
 *     its stage goes sticky. The scroll then runs the demo's sequence:
 *
 *       1. MERGE. Two clip-path windows onto the same full-frame photograph,
 *          vertically offset, with a navy seam between them. The offsets
 *          settle and the seam closes, and the halves are one picture.
 *       2. OPEN. The merged frame's insets — and its rounded corners with
 *          them — collapse to full bleed. Held as an object it has drawn
 *          corners; once it is the screen it has none.
 *       3. TITLE. A title card over the settled picture: "Our Projects" as a
 *          bronze rubric between two hairlines, and the headline under it
 *          rising word by word out of its own line boxes while the map dims
 *          a little beneath. It holds, drifting, and leaves up through the
 *          same line boxes before the map opens underneath.
 *       4. MAP. The picture is the region, drawn (components/RegionMap):
 *          the plate the panes merged and the frame opened was the map all
 *          along. As the title lifts off it, it comes alive — copper is
 *          drawn out along its seven roads, and its nine place names rise —
 *          and once it has stopped moving AND the title has cleared it,
 *          it becomes something to enter: a pin on every locality the
 *          portfolio has an address in. A pin flies the camera down on to the
 *          place, and the map's three planes part as it goes. The pins are
 *          live only across the long settled hold — there is nothing to aim
 *          at while the picture is still travelling, and nothing to read a
 *          panel against while the headline is lying across the map.
 *       5. RAIL, and the WAY OUT. The bar fills across the whole section
 *          while the counter walks 01 → the project count; and at the foot
 *          of the frame, on the same scroll the map goes live on, the link
 *          to /projects rises — the one thing on the stage the visitor can
 *          operate besides a pin, and the only route from the section to the
 *          whole portfolio.
 *       6. HAND-OFF. The sequence lands on a still, full-bleed photograph —
 *          and the stage then stays pinned for the ARC_RUN viewports the
 *          page's second arc opens across, while the picture withdraws under
 *          it behind a soft navy veil. That withdrawal IS the hold: the map is
 *          the last thing read here and it is never moving while it is being
 *          read, only while it is being taken.
 *
 * THE SECTION IS THE SEQUENCE PLUS THE HOLD, and the two are kept apart on
 * purpose. Every beat below is a fraction of the SEQUENCE, so the hold can be
 * lengthened or removed without re-timing a single one of them — the timeline
 * carries the hold as a tail and the scroll maps onto both together.
 *
 * EXACTLY AS THE DEMO BUILDS IT: the split geometry lives in CSS custom
 * properties on the section — `--pj-gap` (the seam), `--pj-fx` / `--pj-ft` /
 * `--pj-fb` (the frame's insets), `--pj-r` (the corner) — plus a CSS
 * transform per pane for the vertical offset. The stylesheet declares the split state, so the panels are
 * split, offset, and gapped from the first paint; the timeline only drives
 * those values home. Clip-path windows, not flex halves: each pane shows its
 * half of one full-frame image, so no seam-alignment math exists to go wrong.
 */

/* ============================================================================
   THE SEQUENCE — beats as fractions (0–1) of the sequence itself, lifted from
   the demo's timeline. NOT fractions of the section: the section also carries
   the still hold the arc below opens across, and mixing the two would mean
   re-tuning nine numbers every time that hold changed length.
   ========================================================================== */
const SEQUENCE = {
  /** Scroll budget for the sequence, in viewports. Long enough that the
   *  title can hold, leave, and still leave the map a settled window of its
   *  own. */
  span: 5.8,

  /* (1) The seam closes; the panes settle out of their offsets. */
  merge: { settle: 0.24 },

  /* (2) The frame's insets collapse to full bleed. */
  open: { at: 0.18, settle: 0.22 },

  /* (3) The title card: a rubric and a headline at heading size, laid over
     the map rather than across it. It uses only moves the site already
     makes. The rubric's bronze hairlines are ruled open outward from the
     label, and the label rises. Then the headline comes up word by word,
     each out of its own line box, as Atmosphere's headline does. Here the
     scroll drives it instead of a clock.

     WHILE IT IS UP, the map dims a little under it and the card drifts
     slowly upward. The dim is what keeps cream type legible over the
     roads, and it does it without a text-shadow for the word masks to cut
     into boxes. The drift keeps the hold from reading as a freeze-frame.

     IT LEAVES THE WAY IT CAME, up through the tops of the same line boxes
     in reading order. The rules then draw back into the label, and the map
     brightens as its roads light. It never fades: the map is the next thing
     to read.

     `below` and `above` are a word's own line box, measured in its mask. At
     a 1.1 line height, Playfair's ascenders start 0.2em down, its baseline
     is 0.97em down, and its descenders end 1.22em down. The mask runs
     0.06em above the box and 0.16em below it. Hidden under the floor needs
     97%, and hidden over the ceiling needs -116%. Both are rounded out. */
  title: {
    dim: 0.28,
    dimFor: 0.08,
    veil: 0.42,
    drift: 18,
    driftAt: 0.27,
    driftFor: 0.33,
    rules: 0.29,
    rulesFor: 0.08,
    label: 0.3,
    labelFor: 0.07,
    words: 0.32,
    wordsFor: 0.09,
    wordsStagger: 0.012,
    below: 115,
    out: 0.5,
    outFor: 0.055,
    outStagger: 0.006,
    above: -120,
    rulesOut: 0.53,
    rulesOutFor: 0.05,
    undim: 0.5,
    undimFor: 0.09,
  },

  /* (4) The map comes alive under the departing title. Copper is drawn
     out along each of the seven roads — out of the city, north and east —
     starting the moment the title begins to lift, one road a beat after
     another (the map staggers and eases each road itself, on the section's
     `power2.inOut`), and the nine place names rise as the frame clears.
     The stagger is sized so the whole set, marks included, is up in the
     same span six names used to take. */
  map: {
    draw: 0.47,
    drawFor: 0.16,
    names: 0.54,
    namesFor: 0.06,
    namesStagger: 0.004,
  },

  /* (4) The window in which the map is live. Opens once the title has
     cleared the frame (0.5 + 0.09) and closes before the sequence lands, so
     a pin is only ever offered while the picture is completely still, with
     nothing lying over it and nothing yet opening across it. */
  pins: { from: 0.6, to: 0.88 },

  /* (5) THE WAY OUT, offered on the same frame the map is. It rises with the
     pins rather than before them: while the title is still lying across
     the picture there is nothing to leave the section FOR yet, and a button
     under a title that is announcing the section reads as a caption on it.

     It is `autoAlpha`, not `opacity`, throughout — GSAP takes `visibility`
     with it, so a link that cannot be seen cannot be tabbed to or clicked
     either, and the beat needs no React state to keep the two in step. In
     the default layout GSAP never touches it and it is simply a link at the
     foot of the grid. */
  cta: { at: 0.62, settle: 0.08, from: 20 },

  /* (6) The hand-off, which now plays ACROSS THE HOLD rather than before it.
     The lift raises the picture off the foot of the stage, and the navy it
     uncovers there used to be on screen for the half-second it took the next
     section to arrive over it. Held still for the length of an arc it becomes
     a hard seam along the bottom of the frame — and the bottom centre of the
     frame is exactly where the arc's disc grows from, so the wipe would
     appear to open out of a join rather than out of the photograph. Played
     across the hold instead, the picture withdraws underneath the cream that
     is taking it, and the disc covers the seam as fast as the lift makes it. */
  exit: { lift: "-7vh", veil: 0.3, scale: 1.12 },
};

/* ============================================================================
   THE HOLD — the still frame the page's second arc is drawn against.

   ArcTransition pulls its runway back over this section, and the disc opens
   across the ARC_RUN viewports the runway is actually pinned for. The section
   grows by exactly that so the overlap costs the sequence nothing: the last
   beat still lands where it landed before, and everything after it is a frame
   nobody is moving. The two sections then release on the same scroll pixel,
   which is what makes the hand-over read as one gesture.
   ========================================================================== */

/** Viewports the section occupies: the sequence, then the hold. */
const SPAN = SEQUENCE.span + ARC_RUN;

/** The hold restated in timeline units. The sticky range is one viewport short
 *  of the section at both lengths — the stage itself buys no travel — so this
 *  is the ratio that keeps one timeline unit worth the same scroll it was
 *  worth before the hold existed. */
const TAIL = ARC_RUN / (SEQUENCE.span - 1);

/** Where the sequence ends, as a fraction of the section's own scroll. Beats
 *  are authored against the sequence; `self.progress` reports the section. */
const SEQ_END = 1 / (1 + TAIL);

/** Below this the motion layout is not built at all — see the stylesheet. */
const MOTION_QUERY = "(min-width: 60rem)";

export function ProjectsShowcase({ content }: { content: GalleryContent }) {
  const root = useRef<HTMLElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  const slides = content.slides;
  const total = slides.length;

  /* The map's one piece of state: the settled window of the scroll in which
     the pins are live. The title has left the frame by then, so nothing
     has to answer to a panel being open. */
  const [pinsLive, setPinsLive] = useState(false);
  const places = useMemo(() => projectPlaces(slides), [slides]);

  /* The map's timeline-facing controls: the sequence draws its roads. */
  const mapControl = useRef<RegionMapControl | null>(null);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_QUERY, () => {
      const q = gsap.utils.selector(section);
      const paneLeft = q(`.${styles.paneLeft}`)[0];
      const paneRight = q(`.${styles.paneRight}`)[0];
      // `[data-shot]` rather than `.shot`: the pin overlay carries it too, so
      // it takes the photograph's overscale and stays registered to it.
      const shots = q("[data-shot]");
      const card = q(`.${styles.titleCard}`)[0];
      const rules = q(`.${styles.eyebrowRule}`);
      const label = q(`.${styles.eyebrowText}`)[0];
      const words = q(`.${styles.word}`);
      const standfirst = q(`.${styles.standfirst}`)[0];
      const fill = q(`.${styles.railFill}`)[0];
      // The WRAPPER, not the link. GSAP writes an inline transform on whatever
      // it tweens, and an inline transform on the link would beat the hover
      // lift declared for it in the stylesheet. Placer moves, button hovers.
      const cta = q(`.${styles.action}`)[0];
      const veil = q(`.${styles.veil}`)[0];
      const frame = q(`.${styles.frame}`)[0];
      if (!frame) return;

      // The map's own moving parts: its roads through its control (they are
      // drawn on a canvas, not in the DOM), and the rest by the attributes
      // RegionMap exposes.
      const lit = { progress: 0 };
      const names = q("[data-map-reveal]");
      const overlay = q(`.${styles.pins}`)[0];

      // The names' start state, set outright. A staggered `fromTo` renders
      // its start values only for the target that starts at once, so every
      // later name would sit on the plate until the playhead reached it —
      // right through the title's hold.
      gsap.set(names, { autoAlpha: 0, y: 8 });
      mapControl.current?.ignite(0);

      // The headline's words start under their floors, set outright for the
      // same reason as the names.
      const T = SEQUENCE.title;
      gsap.set(words, { yPercent: T.below });

      const counter = counterRef.current;
      const pad = (n: number) => String(n).padStart(2, "0");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            /* THE SECTION'S PROGRESS, READ AS THE SEQUENCE'S. Everything in
               here is authored against the sequence, so the hold at the end
               has to be divided back out — otherwise the rail would still be
               filling and the pins would still be live behind an arc that is
               already closing over them. Clamped, so the whole of the hold
               reads as "finished" rather than as an overrun. */
            const p = Math.min(1, self.progress / SEQ_END);

            // The rail runs the whole sequence: bar and count together,
            // 01 → the project count, exactly as the demo's rail does. It
            // lands full on the last beat and stays there for the hold.
            if (fill) gsap.set(fill, { scaleY: p });
            if (counter) {
              counter.textContent = pad(1 + Math.round(p * (total - 1)));
            }

            // (4) The map opens and closes with the settled hold. React bails
            // out on an unchanged value, so this costs a comparison a frame.
            const live = p >= SEQUENCE.pins.from && p <= SEQUENCE.pins.to;
            setPinsLive(live);
          },
        },
      });

      /* (1) The seam closes and the panes settle out of their CSS-declared
         vertical offsets; the photograph settles out of a slight overscale. */
      tl.to(
        section,
        { "--pj-gap": "0vw", duration: SEQUENCE.merge.settle, ease: "power2.inOut" },
        0,
      )
        .to(
          [paneLeft, paneRight],
          { y: 0, duration: SEQUENCE.merge.settle, ease: "power2.inOut" },
          0,
        )
        .fromTo(
          shots,
          { scale: 1.14, transformOrigin: "50% 42%" },
          { scale: 1.04, duration: 0.36, ease: "power1.out" },
          0,
        )

        /* (2) The merged frame expands to full bleed. */
        /* The corner goes with them, on the same tween and the same ease, so
           the picture stops being an object and becomes the screen in one
           gesture. A radius that unwound on its own schedule would read as a
           second, smaller animation happening inside the first. */
        .to(
          section,
          {
            "--pj-fx": "0vw",
            "--pj-ft": "0svh",
            "--pj-fb": "0svh",
            "--pj-r": "0vw",
            duration: SEQUENCE.open.settle,
            ease: "power2.inOut",
          },
          SEQUENCE.open.at,
        )

        /* The intro line has said its piece by the time the picture takes
           the whole screen. */
        .to(standfirst, { opacity: 0, y: -18, duration: 0.1 }, 0.1)

        /* (3) The title card. The map dims a little under it... */
        .fromTo(
          veil,
          { opacity: 0 },
          { opacity: T.veil, duration: T.dimFor, ease: "power1.inOut" },
          T.dim,
        )

        /* ...the card drifts upward for as long as it is on the screen... */
        .fromTo(
          card,
          { y: T.drift },
          { y: -T.drift, duration: T.driftFor },
          T.driftAt,
        )

        /* ...the rubric's hairlines are ruled open outward from the label,
           and the label rises between them... */
        .fromTo(
          rules,
          { scaleX: 0 },
          { scaleX: 1, duration: T.rulesFor, ease: "power3.out" },
          T.rules,
        )
        .fromTo(
          label,
          { yPercent: 125 },
          { yPercent: 0, duration: T.labelFor, ease: "power3.out" },
          T.label,
        )

        /* ...and the headline comes up out of its line boxes, a word at a
           time. */
        .fromTo(
          words,
          { yPercent: T.below },
          {
            yPercent: 0,
            duration: T.wordsFor,
            ease: "power3.out",
            stagger: T.wordsStagger,
          },
          T.words,
        )

        /* It leaves the way it came, top first and then in reading order,
           and is clear of the frame before the first pin is live. */
        .to(
          label,
          { yPercent: -125, duration: T.outFor, ease: "power2.in" },
          T.out,
        )
        .to(
          words,
          {
            yPercent: T.above,
            duration: T.outFor,
            ease: "power2.in",
            stagger: T.outStagger,
          },
          T.out + T.outStagger,
        )
        .to(
          rules,
          { scaleX: 0, duration: T.rulesOutFor, ease: "power2.in" },
          T.rulesOut,
        )

        /* The map brightens again as it comes alive. */
        .to(
          veil,
          { opacity: 0, duration: T.undimFor, ease: "power1.inOut" },
          T.undim,
        )

        /* (4) The map comes alive as the title lifts off it: the copper
           drawn out along its roads. Linear here — the map eases and
           staggers each road itself — so scrubbing back undraws it exactly
           as it was drawn. */
        .fromTo(
          lit,
          { progress: 0 },
          {
            progress: 1,
            duration: SEQUENCE.map.drawFor,
            onUpdate: () => mapControl.current?.ignite(lit.progress),
          },
          SEQUENCE.map.draw,
        )
        .fromTo(
          names,
          { autoAlpha: 0, y: 8 },
          {
            autoAlpha: 1,
            y: 0,
            duration: SEQUENCE.map.namesFor,
            ease: "power2.out",
            stagger: SEQUENCE.map.namesStagger,
          },
          SEQUENCE.map.names,
        )

        /* (5) The way out rises from the foot of the frame as the map opens.
           `fromTo` renders its start state the moment the timeline is built,
           so the link is hidden — and unfocusable, via autoAlpha's
           `visibility` — from the first paint of the motion layout, with no
           flash of a button sitting on the split panes. */
        .fromTo(
          cta,
          { autoAlpha: 0, y: SEQUENCE.cta.from },
          {
            autoAlpha: 1,
            y: 0,
            duration: SEQUENCE.cta.settle,
            ease: "power2.out",
          },
          SEQUENCE.cta.at,
        )

        /* (6) THE HAND-OFF, ACROSS THE HOLD. All three are positioned at 1 —
           the instant the sequence lands, which is also the instant the arc's
           runway starts — and run for exactly its length, so the picture is
           full-bleed and completely still on the last frame anyone reads it
           on, and is withdrawing for every frame after that. They are what
           gives the timeline its tail; there is no empty tween to keep in
           step with them. `power1.out` is the ease the arc opens on, so the
           two halves of the hand-over move as one gesture.

           The title is long gone by here, so only the picture goes. */
        .to(
          shots,
          { scale: SEQUENCE.exit.scale, duration: TAIL, ease: "power1.out" },
          1,
        )
        .to(
          veil,
          { opacity: SEQUENCE.exit.veil, duration: TAIL, ease: "power1.out" },
          1,
        )
        /* The overlay lifts with the frame, so the names on it stay on their
           places for as long as they are still visible. */
        .to(
          [frame, overlay].filter(Boolean),
          { y: SEQUENCE.exit.lift, duration: TAIL, ease: "power1.out" },
          1,
        )
        /* The link goes with the picture it belongs to. It is the only thing
           on the stage the visitor can operate, so leaving it lit over a
           withdrawing photograph would make it the last thing on the screen
           — a button floating on the cream the arc has just opened. */
        .to(
          cta,
          {
            autoAlpha: 0,
            y: -SEQUENCE.cta.from,
            duration: TAIL,
            ease: "power1.out",
          },
          1,
        )
        /* The names sit above the veil, so they are taken out by hand — and
           sooner than the picture, since a label left on a map that is
           dimming under it reads as a caption on the arc. */
        .to(
          names,
          { autoAlpha: 0, duration: TAIL * 0.6, ease: "power1.out" },
          1,
        );

      return () => {
        tl.scrollTrigger?.kill();
      };
    });

    return () => mm.revert();
  }, [total]);

  return (
    <section
      ref={root}
      id="projects"
      className={styles.section}
      aria-labelledby="projects-title"
      style={{ "--span": SPAN } as React.CSSProperties}
    >
      <RegionMap
        control={mapControl}
        places={places}
        active={pinsLive}
        label="Vakratunda projects across the Mumbai metropolitan region"
      >
        <div className={styles.stage}>
          {/* The picture, as the demo has it: one full-frame plate behind two
              clip-path windows, so the halves merge seamlessly. The plate is
              the region map, painted once per window and driven by one camera,
              so the two windows stay one picture through every move it makes.
              Each copy is sized to the whole stage rather than to its window —
              see `.shot` — so opening the frame reveals more of a map that is
              standing still, instead of refitting it. Decorative here: every
              project, with its own image and alt text, is in the list below,
              and every place is a pin in the overlay. */}
          <figure className={styles.frame} aria-hidden="true">
            <div className={clsx(styles.pane, styles.paneLeft)}>
              <div className={styles.shot} data-shot>
                <RegionMapCanvas />
              </div>
            </div>
            <div className={clsx(styles.pane, styles.paneRight)}>
              <div className={styles.shot} data-shot>
                <RegionMapCanvas />
              </div>
            </div>
            <div className={styles.veil} aria-hidden="true" />
          </figure>

          {/* (4) The map, made enterable. A sibling of the frame rather than a
              child of it: the frame is clipped into two windows, and the pins
              belong to neither half. It carries `data-shot`, so the timeline
              gives it the plate's overscale about the same origin, and it stays
              registered to the drawing pin for pin.

              `inert` while the map is still travelling — a pin that cannot be
              seen must not be reachable by keyboard either. */}
          <div className={styles.pins} data-shot inert={!pinsLive}>
            <RegionMapOverlay />
          </div>

          {/* The rail: the demo's progress line and counter. */}
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.railTrack}>
              <span className={styles.railFill} />
            </span>
            <p className={clsx(styles.railCount, "u-numeral")}>
              <span ref={counterRef}>01</span>
              <span className={styles.railTotal}>
                /{String(total).padStart(2, "0")}
              </span>
            </p>
          </div>

          <header className={`u-shell ${styles.head}`}>
            {/* The title card: the rubric and the headline, moved as one by
                the drift. The hairlines either side of the rubric are drawn
                only in the motion layout, where the card is centred. */}
            <div className={styles.titleCard}>
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowRule} aria-hidden="true" />
                <span className={styles.eyebrowMask}>
                  <span className={styles.eyebrowText}>{content.eyebrow}</span>
                </span>
                <span className={styles.eyebrowRule} aria-hidden="true" />
              </p>
              <h2 id="projects-title" className={styles.title}>
                <span className="u-visually-hidden">
                  {headingText(content.heading)}
                </span>
                <MaskedWords heading={content.heading} />
              </h2>
            </div>
            <p className={styles.standfirst}>{content.standfirst}</p>
          </header>

          {/* The projects themselves — the complete portfolio, as cards. The
              motion layout sets this aside for the demo's single-photograph
              sequence; for everyone else it IS the section. */}
          <ol className={styles.index}>
            {slides.map((slide) => (
              <li key={slide.id} className={styles.item}>
                <div className={styles.card}>
                  <FitImage
                    src={slide.image.src}
                    alt={slide.image.alt}
                    width={slide.image.width}
                    height={slide.image.height}
                    sizes="(max-width: 48rem) 88vw, (max-width: 60rem) 44vw, 30rem"
                    loading="lazy"
                    className={styles.cardImage}
                  />
                </div>
                <p className={styles.name}>{slide.name}</p>
                <p className={styles.locality}>
                  {slide.locality}
                  <span className={styles.status} data-status={slide.status}>
                    {slide.status}
                  </span>
                </p>
                <p className={styles.blurb}>{slide.blurb}</p>
              </li>
            ))}
          </ol>

          {/* The way out. At the foot of the grid in the default layout, and
              at the foot of the stage in the motion one — the same element,
              placed twice, so the section has exactly one door out of it and
              neither layout is missing it. */}
          <div className={styles.action}>
            <Link className={styles.cta} href={content.cta.href}>
              <span>{content.cta.label}</span>
              <svg
                className={styles.ctaIcon}
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </RegionMap>
    </section>
  );
}

/**
 * The headline, one clipped box per word, so each word can rise out of its
 * own line, the way Atmosphere sets its headline. The swash words keep their
 * italic, and the spaces stay real text so the line still wraps and balances.
 * The heading is named by the plain sentence beside this, so the split is
 * hidden from assistive tech.
 */
function MaskedWords({ heading }: { heading: SwashHeading }) {
  const units: { text: string; swash: boolean }[][] = [];
  let current: { text: string; swash: boolean }[] = [];

  /* Runs of non-space text are grouped into one unbreakable unit, so the
     full stop after the swash rides on the word before it. */
  (
    [
      [heading.before ?? "", false],
      [heading.swash, true],
      [heading.after ?? "", false],
    ] as const
  ).forEach(([text, swash]) => {
    text.split(/(\s+)/).forEach((token) => {
      if (!token) return;
      if (/^\s+$/.test(token)) {
        if (current.length) units.push(current);
        current = [];
      } else {
        current.push({ text: token, swash });
      }
    });
  });
  if (current.length) units.push(current);

  return (
    <span aria-hidden="true">
      {units.map((unit, index) => (
        <span key={index}>
          <span className={styles.wordMask}>
            <span className={styles.word}>
              {unit.map((piece, i) =>
                piece.swash ? (
                  <em key={i} className="u-swash">
                    {piece.text}
                  </em>
                ) : (
                  <span key={i}>{piece.text}</span>
                ),
              )}
            </span>
          </span>
          {index < units.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function headingText(heading: SwashHeading) {
  return `${heading.before ?? ""}${heading.swash}${heading.after ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}

export default ProjectsShowcase;
