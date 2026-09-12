"use client";

import { useRef } from "react";
import Image from "next/image";
import type { AtmosphereContent, AtmospherePlate } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import PageLink from "./PageLink";
import Swash from "./Swash";
import styles from "./Atmosphere.module.css";

/**
 * The spread — interior and exterior held in one composition.
 *
 * It stands where the arc's own line used to stand. That line was the claim
 * set on an empty field of cream with nothing around it; this is the claim
 * with the evidence built around it, which is why the arc above no longer
 * carries a lockup of its own. Stating it twice, forty pixels apart, would
 * have made the second one a caption on the first.
 *
 * ============================================================================
 * ONE CANVAS, THIRTEEN PLACED THINGS
 * ============================================================================
 *
 * There is no repeating unit here and no `.map()` over a list. Five
 * photographs, a label, a headline, a paragraph, three blocks of micro-copy,
 * three details and a closing line are each PLACED — by column and by row —
 * on a single twelve-column canvas whose row is exactly half a column, so
 * every crop in the section is a whole number of the same square. That is
 * what lets the composition be irregular without being arbitrary: nothing is
 * where it is by accident, and every frame is a different shape on purpose.
 *
 * THE TWO OVERLAPS ARE THE ARGUMENT, NOT AN EFFECT. The tall terrace plate
 * sits over the wall of glass; the garden sits over the lounge. Both are an
 * OUTSIDE frame laid across an INSIDE one — the section's whole subject, made
 * structural rather than described. No two photographs anywhere else on this
 * page overlap at all.
 *
 * TWO IS THE CEILING, and it was found rather than chosen: a third, with the
 * terrace over the lounge as well, left the lounge as an L-shaped sliver of
 * itself. An overlap has to leave the frame underneath legible as a
 * photograph, or it is not a layer — it is a crop.
 *
 * WHERE THE TYPE GOES IS DECIDED BY THE PHOTOGRAPHS. Every block of copy sits
 * in negative space a frame has opened next to it: the micro-copy for the
 * deck under the deck, the note for the terrace in the two-column strip the
 * terrace leaves at the right margin, the closing line beside the details
 * rather than under them. Nothing is stacked, and nothing is centred.
 *
 * FOUR THINGS BREAK THE MARGIN, and never by more than half a gutter — the
 * deck, the terrace's note and the lounge run past the right edge of the
 * shell, the wall of glass past the left. Half a gutter is enough to read as
 * a decision and not enough to reach the edge of the window, so the break
 * can never become an overflow at any width.
 *
 * ============================================================================
 * TWO LAYOUTS, FROM THE SAME MARKUP — the house pattern
 * ============================================================================
 *
 *   · DEFAULT (under 64rem). One column, in document order, with the frames
 *     given different widths and alignments so the column still sways. No
 *     overlap, no negative margins, no canvas. THE SECTION IS COMPLETE.
 *
 *   · 64rem and up. The canvas, as above.
 *
 * Each plate keeps the same crop in both, so the spread is recognisably the
 * same composition on a phone as on a desk — narrower, and unfolded.
 *
 * ============================================================================
 * MOTION
 * ============================================================================
 *
 * The same ladder Practice uses, for the same reason: one scrubbed range, one
 * set of rates, so the layers are at fixed distances from one another rather
 * than at a dozen independent ones. Depth belongs to a wrapper and the
 * entrance belongs to the element inside it — the two never write the same
 * property, which is the rule that keeps a drift from swallowing a reveal.
 *
 * THE ENTRANCES ARE PER-ELEMENT, WHICH IS THE ONE DEPARTURE. This spread is
 * the better part of three screens tall. One trigger on the section's top
 * edge would spend every entrance in it on frames the visitor has not reached
 * yet, so only the head — the label and the headline — arrives off the
 * section; everything below arrives off its own top edge, as it reaches the
 * window.
 *
 * Under reduced motion `useGsapScope` skips the setup and none of it runs:
 * every element is already at its final opacity, every photograph at exactly
 * its cover crop, and the canvas is the whole of the section.
 */

/**
 * The ladder, in fractions of each layer's own height travelled end to end.
 * Positive is further away, negative is nearer, zero is on the page.
 *
 * Read down the list and it is a cross-section of the spread: the two wide
 * exteriors furthest back, every photograph drifting inside its own crop, the
 * tall terrace plate standing off the page in front of them, and the type
 * nearest of all.
 */
const DEPTH = {
  /** The wide exteriors the section opens and closes on. The backdrop. */
  ground: 0.07,
  /** A photograph seen through the crop that holds it — every one of them. */
  crop: 0.06,
  /** The terrace plate. One plane forward of the page, and no more: it is the
   *  frame that overlaps two others, so it has to read as being in front of
   *  them rather than as flying past them. */
  standing: -0.02,
  /** Tags and micro-copy: just off the page. */
  label: -0.028,
  /** The paragraph, the details and the closing line. */
  copy: -0.036,
  /** The headline. The nearest thing in the section. */
  headline: -0.05,
};

export function Atmosphere({ content }: { content: AtmosphereContent }) {
  const root = useRef<HTMLElement | null>(null);
  const { plates } = content;

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);

    /* The head, off the section's own top edge, as one thing. */
    revealOnEnter(q("[data-head]"), section, { stagger: 0.12, start: "top 74%" });

    /* Everything else, off its own. See the note on per-element entrances
       above: the section is too tall for one trigger to serve. */
    q("[data-reveal]:not([data-head])").forEach((el) => {
      revealOnEnter(el, el, { start: "top 88%" });
    });

    /* THE RANGE EVERY LAYER SHARES: this section passing through the window.
       Stated once and handed to all of them, so no two layers are ever
       travelling at different rates relative to one another. */
    const range = () =>
      ({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
        invalidateOnRefresh: true,
      }) as const;

    /** Promote a set of layers for the range they are actually moving in, and
     *  no longer. */
    const promote = (layers: Element[]) => (self: { isActive: boolean }) => {
      const state = self.isActive ? "on" : "off";
      layers.forEach((layer) => {
        (layer as HTMLElement).dataset.drift = state;
      });
    };

    const drift = (
      targets: Element[],
      travel: number,
      /** Enough enlargement that a crop can travel without an edge entering
       *  the frame. 1 for anything not seen through a crop. */
      headroom = 1,
    ) => {
      const layers = targets.filter(Boolean);
      if (layers.length === 0) return;

      gsap.fromTo(
        layers,
        { yPercent: -travel * 100, scale: headroom },
        {
          yPercent: travel * 100,
          scale: headroom,
          ease: "none",
          scrollTrigger: { ...range(), onToggle: promote(layers) },
        },
      );
    };

    /* ---- Back to front -------------------------------------------------- */

    drift([...q(`.${styles.deck}`), ...q(`.${styles.garden}`)], DEPTH.ground);

    /* Every photograph inside its own crop, at one rate. What is moving is
       the view through the window rather than the window, and they are all
       the same kind of window. The headroom is set here rather than in the
       stylesheet, so a photograph is never left permanently enlarged to
       serve an effect that did not run. */
    drift(q(`.${styles.image}`), DEPTH.crop, 1.16);

    /* The one frame that is in front of the page rather than behind it. */
    drift(q(`.${styles.terrace}`), DEPTH.standing);

    /* The type, by layer — never the elements the entrances are written on.
       The tags are the exception and carry no depth at all: each one is
       written on the figcaption itself, which is where its entrance is, and
       a drift on the same element would take that transform over. They are
       part of the plate they hang off, and they travel with it. */
    drift(q(`.${styles.noteLayer}`), DEPTH.label);
    drift(q(`.${styles.copyLayer}`), DEPTH.copy);
    drift(q(`.${styles.headlineLayer}`), DEPTH.headline);
  }, []);

  return (
    <section
      ref={root}
      id="atmosphere"
      className={`on-cream ${styles.section}`}
      aria-labelledby="atmosphere-title"
    >
      <div className={`u-shell ${styles.shell}`}>
        <div className={styles.canvas}>
          {/* --------------------------------------------------- the head */}
          <p className={styles.eyebrow} data-reveal="up" data-head="">
            {content.eyebrow}
          </p>

          <div className={styles.headlineLayer}>
            <h2
              id="atmosphere-title"
              className={styles.headline}
              data-reveal="up"
              data-head=""
            >
              <Swash heading={content.heading} />
            </h2>
          </div>

          {/* ------------------------------------------- the exterior, first
              The frame the section opens against, and the only one whose tag
              is set above it — in the section's own top padding, where it is
              the first mark on the cream rather than a caption on anything. */}
          <Plate
            plate={plates.deck}
            className={styles.deck}
            tag="above"
            align="end"
            sizes="(max-width: 64rem) 92vw, 40vw"
          />
          <Note text={plates.deck.note} className={styles.deckNote} />

          {/* ----------------------------------------- the wall of glass, and
              the frame standing in front of it. These two are the section:
              one photograph that contains both sides at once, with an
              outside laid across it. */}
          <Plate
            plate={plates.glass}
            className={styles.glass}
            tag="above"
            align="start"
            sizes="(max-width: 64rem) 100vw, 58vw"
          />
          <Plate
            plate={plates.terrace}
            className={styles.terrace}
            tag="below"
            align="start"
            sizes="(max-width: 64rem) 66vw, 34vw"
          />
          <Note text={plates.terrace.note} className={styles.terraceNote} />

          <div className={`${styles.copyLayer} ${styles.leadCell}`}>
            <p className={styles.lead} data-reveal="up">
              {content.lead}
            </p>
          </div>

          {/* ------------------------------------------------ the inside, and
              the garden that comes across it. The three details are placed
              between them on the left, so the last screen of the section is
              a photograph, a list and a note reading across one another
              rather than a column of copy under a column of pictures. */}
          <Plate
            plate={plates.lounge}
            className={styles.lounge}
            tag="above"
            align="end"
            sizes="(max-width: 64rem) 86vw, 42vw"
          />

          <div className={`${styles.copyLayer} ${styles.detailsCell}`}>
            <div className={styles.details}>
              <p className={styles.detailsTitle} data-reveal="up">
                {content.detailsTitle}
              </p>
              <ul className={styles.detailList}>
                {content.details.map((detail, index) => (
                  <li key={detail} className={styles.detail} data-reveal="up">
                    <span className={`u-numeral ${styles.detailIndex}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Plate
            plate={plates.garden}
            className={styles.garden}
            tag="below"
            align="start"
            sizes="(max-width: 64rem) 100vw, 58vw"
          />
          <Note text={plates.garden.note} className={styles.gardenNote} />

          {/* The last line. Set on the right, under the photograph the
              section closes on rather than under the details — the two are
              a pair, and neither is a footnote to the other. */}
          <div className={`${styles.copyLayer} ${styles.codaCell}`}>
            <p className={styles.coda} data-reveal="up">
              {content.coda}
            </p>

            {/* The two pages this section is the summary of, taken from
                opposite ends of the same subject: what the rooms are like to
                live in, and what the group does with the parts of a building
                that are not rooms to live in. They sit in the coda's own
                cell, so they travel on the copy layer's parallax with it and
                the canvas keeps its squares — rows 52–56 are the last
                placement on the grid and grow to take them. */}
            <div className={styles.onward}>
              <PageLink
                size="sm"
                href="/experiences"
                label="A day in one of these homes"
              />
              <PageLink
                size="sm"
                href="/hospitality"
                label="The parts that are not homes"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One frame: the photograph, and the tag that says which side of the
 * threshold it stands on.
 *
 * The tag is taken out of flow deliberately. In flow it would eat its own
 * height out of the plate, and every crop in the section is a whole number of
 * canvas squares — a frame that is thirty pixels shorter than the square it
 * was placed on is a different photograph. So the figure's box IS the plate,
 * and the tag hangs off it, above or below, ranged to whichever edge the
 * composition has room at. That is also why no two tags in the section are in
 * the same place.
 */
function Plate({
  plate,
  className,
  tag,
  align,
  sizes,
}: {
  plate: AtmospherePlate;
  className: string;
  /** Which side of the plate the tag hangs off. */
  tag: "above" | "below";
  /** Which edge of the plate it is ranged to. */
  align: "start" | "end";
  sizes: string;
}) {
  return (
    <figure
      className={`${styles.figure} ${className}`}
      data-tag={tag}
      data-align={align}
    >
      <div className={styles.plate} data-reveal="rise">
        <Image
          src={plate.image.src}
          alt={plate.image.alt}
          fill
          sizes={sizes}
          quality={82}
          className={styles.image}
        />
      </div>
      <figcaption className={styles.tag} data-reveal="up">
        {plate.side}
      </figcaption>
    </figure>
  );
}

/**
 * A block of micro-copy in the negative space a frame has opened.
 *
 * Renders nothing at all when the plate has no note — two of the five do not,
 * and an empty rule hanging in the canvas is worse than the silence.
 */
function Note({ text, className }: { text?: string; className: string }) {
  if (!text) return null;

  return (
    <div className={`${styles.noteLayer} ${className}`}>
      <p className={styles.note} data-reveal="up">
        {text}
      </p>
    </div>
  );
}

export default Atmosphere;
