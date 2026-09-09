"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ARC_RUN } from "@/lib/arc";
import type { GalleryContent } from "@/lib/content";
import { MUMBAI_MAP, projectMapPoints } from "@/lib/mapPoints";
import { gsap, useGsapScope } from "@/lib/motion";
import { MapPinLayer } from "./LocationMap";
import styles from "./ProjectsShowcase.module.css";

/**
 * Our Projects — the demo transition (demos/our-projects-transition), ported
 * same-to-same into the page, recoloured to the site's navy / rose / cream.
 * No florals, by request: the photograph, the wordmark, and the rail are the
 * whole composition.
 *
 * TWO LAYOUTS, from the same markup — the house pattern:
 *
 *   · DEFAULT (no JS, reduced motion, or under 60rem). An ordinary navy
 *     section: heading, standfirst, and every project as a card in a grid.
 *     Nothing is sticky, nothing is hidden, and the section is complete.
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
 *       3. TITLE. "PROJECTS" arrives overscaled, settles, holds across the
 *          settled photograph — and then leaves, lifting out through the top
 *          of the frame before the map opens underneath it.
 *       4. MAP. The photograph is a plate of the metropolitan region, and
 *          once it has stopped moving AND the wordmark has cleared it, it
 *          becomes readable: a pin on every locality the portfolio has an
 *          address in, each opening a panel. The pins are live only across
 *          the long settled hold — there is nothing to aim at while the
 *          picture is still travelling, and nothing to read a panel against
 *          while 22rem of cream serif is lying across the map.
 *       5. RAIL. The bar fills across the whole section while the counter
 *          walks 01 → the project count.
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
   *  wordmark can hold, leave, and still leave the map a settled window of its
   *  own. */
  span: 5.8,

  /* (1) The seam closes; the panes settle out of their offsets. */
  merge: { settle: 0.24 },

  /* (2) The frame's insets collapse to full bleed. */
  open: { at: 0.18, settle: 0.22 },

  /* (3) The wordmark: in, hold, out. It leaves rather than dimming — the
     map is the next thing to read, and the largest type on the site lying
     across it is not a caption over the picture, it is a lid on it.

     `lift` IS DERIVED FROM WHERE THE WORDMARK NOW SITS. It is placed in the
     upper third rather than jammed against the top edge, so the old -42%
     merely nudged it: its cap band was still on the screen when the tween
     ran out, and only the opacity was doing the work. The distance to clear
     is the cap top (--header-h + --space-8 = 124px) plus the measured cap
     band (156px at 15vw on a 1440 window) over a 203px line box — 138% of
     its own height. Rounded up so the frame is genuinely empty behind it
     rather than nearly so. */
  title: {
    fromScale: 1.9,
    at: 0.32,
    settle: 0.13,
    out: 0.5,
    clear: 0.09,
    lift: -140,
  },

  /* (4) The window in which the map is live. Opens once the wordmark has
     cleared the frame (0.5 + 0.09) and closes before the sequence lands, so
     a pin is only ever offered while the picture is completely still, with
     nothing lying over it and nothing yet opening across it. */
  pins: { from: 0.6, to: 0.88 },

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
     the pins are live. The wordmark has left the frame by then, so nothing
     has to answer to a panel being open. */
  const [pinsLive, setPinsLive] = useState(false);
  const points = useMemo(() => projectMapPoints(slides), [slides]);

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
      const title = q(`.${styles.title}`)[0];
      const standfirst = q(`.${styles.standfirst}`)[0];
      const fill = q(`.${styles.railFill}`)[0];
      const veil = q(`.${styles.veil}`)[0];
      const frame = q(`.${styles.frame}`)[0];
      if (!frame) return;

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

        /* (3) The wordmark fades in from oversize to its final size and
           holds across the settled photograph. */
        .fromTo(
          title,
          { opacity: 0, scale: SEQUENCE.title.fromScale, yPercent: 14 },
          {
            opacity: 1,
            scale: 1,
            yPercent: 0,
            duration: SEQUENCE.title.settle,
            ease: "power2.out",
          },
          SEQUENCE.title.at,
        )

        /* ...and then leaves, up and out through the top of the frame,
           finishing before the first pin is live. It goes the way it came,
           on the same axis, so the beat reads as the wordmark withdrawing
           rather than as a fade someone forgot to finish. */
        .to(
          title,
          {
            opacity: 0,
            scale: 0.94,
            yPercent: SEQUENCE.title.lift,
            duration: SEQUENCE.title.clear,
            ease: "power2.in",
          },
          SEQUENCE.title.out,
        )

        /* (6) THE HAND-OFF, ACROSS THE HOLD. All three are positioned at 1 —
           the instant the sequence lands, which is also the instant the arc's
           runway starts — and run for exactly its length, so the picture is
           full-bleed and completely still on the last frame anyone reads it
           on, and is withdrawing for every frame after that. They are what
           gives the timeline its tail; there is no empty tween to keep in
           step with them. `power1.out` is the ease the arc opens on, so the
           two halves of the hand-over move as one gesture.

           The wordmark is long gone by here, so only the picture goes. */
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
        .to(
          frame,
          { y: SEQUENCE.exit.lift, duration: TAIL, ease: "power1.out" },
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
      <div className={styles.stage}>
        {/* The photograph, as the demo has it: one full-frame image behind
            two clip-path windows, so the halves merge seamlessly. Decorative
            here — every project, with its own image and alt text, is in the
            list below. */}
        <figure className={styles.frame} aria-hidden="true">
          <div className={clsx(styles.pane, styles.paneLeft)}>
            <Image
              src={MUMBAI_MAP.src}
              alt=""
              width={MUMBAI_MAP.width}
              height={MUMBAI_MAP.height}
              sizes="100vw"
              quality={82}
              priority
              data-shot
              className={styles.shot}
            />
          </div>
          <div className={clsx(styles.pane, styles.paneRight)}>
            <Image
              src={MUMBAI_MAP.src}
              alt=""
              width={MUMBAI_MAP.width}
              height={MUMBAI_MAP.height}
              sizes="100vw"
              quality={82}
              priority
              data-shot
              className={styles.shot}
            />
          </div>
          <div className={styles.veil} aria-hidden="true" />
        </figure>

        {/* (4) The map, made readable. A sibling of the frame rather than a
            child of it: the frame is clipped into two windows, and the pins
            belong to neither half. It carries `data-shot`, so the timeline
            gives it the photograph's overscale about the same origin, and it
            stays registered to the picture pin for pin.

            `inert` while the map is still travelling — a pin that cannot be
            seen must not be reachable by keyboard either. */}
        <div className={styles.pins} data-shot inert={!pinsLive}>
          <MapPinLayer
            // Must match how .shot is painted in the stylesheet.
            image={{
              width: MUMBAI_MAP.width,
              height: MUMBAI_MAP.height,
              fit: "cover",
              focalX: 50,
              focalY: 38,
            }}
            points={points}
            active={pinsLive}
            /* Clear of the fixed header at the top and the progress rail on
               the left. Generous on the other two edges as well: the layer is
               scaled 1.04 with the photograph, so a panel flush to its
               measured edge lands just outside the stage, which clips. */
            safeArea={{ top: 96, right: 72, bottom: 72, left: 132 }}
            label="Vakratunda projects across the Mumbai metropolitan region"
          />
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
          <h2 id="projects-title" className={styles.title}>
            Projects
          </h2>
          <p className={styles.standfirst}>{content.standfirst}</p>
        </header>

        {/* The projects themselves — the complete portfolio, as cards. The
            motion layout sets this aside for the demo's single-photograph
            sequence; for everyone else it IS the section. */}
        <ol className={styles.index}>
          {slides.map((slide) => (
            <li key={slide.id} className={styles.item}>
              <div className={styles.card}>
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  sizes="(max-width: 48rem) 88vw, (max-width: 60rem) 44vw, 30rem"
                  quality={82}
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
      </div>
    </section>
  );
}

export default ProjectsShowcase;
