"use client";

import { useRef } from "react";
import Image from "next/image";
import type { PracticeContent, PracticeSlide } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import { useWipeSequence } from "@/lib/wipe";
import PortraitPlate from "./PortraitPlate";
import Swash from "./Swash";
import styles from "./Practice.module.css";

/**
 * The practice — what "people before projects" actually commits the firm to.
 *
 * NOT MOUNTED. The home page ran this between Atmosphere and the team and no
 * longer does: the cream the second arc opens is now the rooms and then the
 * people, with nothing between them. The component, its stylesheet and
 * `content.practice` are kept whole and in working order — everything it
 * needs is still on SiteContent — so restoring it is one line in page.tsx.
 * Read what follows as a description of the section when it is on the page.
 *
 * It is the section the page's second arc opens onto. The arc sets the claim
 * as a tower of type on an empty field of cream; this is the evidence for it;
 * the team below is the people it is a claim about. That order is the whole
 * argument, and none of the three moves without the other two.
 *
 * ============================================================================
 * ONE COMPOSITION, TWO GROUNDS
 * ============================================================================
 *
 * The page changes ground navy → cream exactly twice and both are spent. So
 * the navy here is not a third change: it is a PLATE — a rectangle of the
 * page's own dark, run off the left edge of the screen, with the photograph
 * mounted on it and overhanging its top. The cream around it is still the
 * ground; the navy is an object standing on it, the way a mounted print
 * stands on a wall rather than repainting the room.
 *
 * That is also why the plate carries no type. Everything set on the left of
 * this section — the commitments — sits on cream BELOW the plate, where it is
 * read at the page's own contrast rather than at the plate's. A block of copy
 * reversed out of the navy would have made the plate a section, and the page
 * is allowed two of those.
 *
 * THE PHOTOGRAPH OVERHANGS THE PLATE ON PURPOSE. It is the one place in the
 * composition where two planes are unambiguously at different depths, and it
 * is what stops the left column reading as a coloured column with a picture
 * in it. The overhang is a fraction of the plate's own top inset, so it holds
 * at every width instead of being a pixel figure defended per breakpoint.
 *
 * ============================================================================
 * THE MOTION IS ONE IDEA, AND IT IS A DEPTH LADDER
 * ============================================================================
 *
 * EVERY LAYER TRAVELS AT A RATE SET BY HOW FAR BACK IT IS. That is the whole
 * of the motion here, and it is why nothing in this section is animated for
 * its own sake: a layer is given a rate because of where it sits in space,
 * not because it was the next thing in the file.
 *
 * THE SIGN IS THE PHYSICS. As the page rises, a layer given POSITIVE travel
 * moves DOWN against it — it is falling behind the page, which is what
 * anything further away does. Negative travel moves it UP against the page,
 * ahead of the plane the page is on, which is what anything nearer does. So:
 *
 *   · THE PLATE is the furthest thing in the section and drifts most (+).
 *   · THE PRINT mounted on it is nearer than the page and drifts up (−), so
 *     it stands off its mount rather than being printed on it. Small: it is
 *     one plane forward, not a layer flying past.
 *   · THE PHOTOGRAPHS drift inside their own crops (+), and travel furthest
 *     of all, because what is moving is the view through a window rather
 *     than the window. None of them can leave its box: each is given the
 *     `scale` headroom its travel needs by the same call that sets the
 *     travel, so the two can never be tuned apart.
 *
 * THE HEADROOM IS SET BY THE MOTION, NOT BY THE STYLESHEET. With no script,
 * or under reduced motion, every photograph sits at exactly its cover crop —
 * an image left permanently enlarged to serve an effect that never ran is a
 * worse photograph in exchange for nothing.
 *
 * The type arrives on the house entrance — `revealOnEnter`, the exponential
 * ease-out every other section head uses — and nothing else here animates at
 * all. Every drift is scrubbed against the section's own scroll, so a visitor
 * who stops gets a completely still frame; `useGsapScope` skips the whole
 * setup under reduced motion, and every element is already in its final state
 * on the way in, so there is nothing to strand.
 */

/**
 * The ladder, in fractions of each layer's own height travelled end to end.
 * Positive is further away, negative is nearer, zero is on the page.
 *
 * Read down the list and it is a cross-section of the section: the plate at
 * the back, the photographs behind their windows, the frames and their boxes
 * on the page itself, and the type in front of all of it. Every number is
 * here, so the depth of the section can be read off the ladder rather than
 * reconstructed from where the calls happen to sit.
 */
const DEPTH = {
  /** The navy plate. The backdrop of the composition. */
  plate: 0.075,
  /** A photograph seen through the crop that holds it. */
  crop: 0.075,
  /** The same, for the frames: shorter boxes, so a smaller share of a
   *  smaller height still reads as the same distance. */
  frame: 0.055,
  /** The print mounted on the plate — one plane forward, and no more. */
  print: -0.018,
  /** What a frame is captioned and controlled with: just off the page,
   *  enough to separate it from the photograph it belongs to. */
  label: -0.026,
  /** The commitments, and the specifics beside them. */
  copy: -0.032,
  /** The statement. The nearest thing in the section, and the only element
   *  given the front plane on its own. */
  lead: -0.05,
};

/** Degrees the ring turns across the section. Its drawn gap travels with the
 *  scroll, so the circle reads as being drawn rather than as sitting there
 *  broken — the one layer whose depth is expressed as rotation, because it is
 *  the one layer that is a circle. */
const RING_TURN = 15;

export function Practice({ content }: { content: PracticeContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);

    revealOnEnter(q("[data-reveal]"), section, {
      stagger: 0.1,
      start: "top 68%",
    });

    /* THE RANGE EVERY LAYER SHARES: this section passing through the window.
       Stated once and handed to all of them, so no two layers can ever be
       travelling at different rates relative to one another at the two ends
       of the section. That shared range is what makes this a ladder rather
       than a dozen separate parallaxes. */
    const range = () =>
      ({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
        invalidateOnRefresh: true,
      }) as const;

    /** Promote a set of layers for the range they are actually moving in, and
     *  no longer: a dozen composited layers kept alive for the rest of the
     *  page is the wasteful version of this effect. */
    const promote = (layers: Element[]) => (self: { isActive: boolean }) => {
      const state = self.isActive ? "on" : "off";
      layers.forEach((layer) => {
        (layer as HTMLElement).dataset.drift = state;
      });
    };

    const drift = (
      targets: Element[],
      travel: number,
      /** Enough enlargement that the crop can travel without an edge
       *  entering the frame. 1 for anything not seen through a crop. */
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

    drift(q(`.${styles.ground}`), DEPTH.plate);

    /* The photographs, each inside its own crop. Grouped by the kind of box
       that holds them rather than by where in the section they are: what
       decides the rate is the depth, and every one of these is at the same
       depth — behind a window. A box whose photograph has not been supplied
       yet holds a drawn plate and no <img>, and contributes nothing here. */
    drift(q(`.${styles.wide} img`), DEPTH.crop, 1.18);
    drift(q(`.${styles.portrait} img`), DEPTH.crop, 1.18);
    drift(q(`.${styles.frameBox} img`), DEPTH.frame, 1.14);

    drift(q(`.${styles.portrait}`), DEPTH.print);
    /* The caption block and the dots. The block, not the lines inside it:
       the cut writes `yPercent` on each caption as it pulls it through its
       mask, and a drift on the same elements would take that over — the same
       rule as the type below, for the same reason. */
    drift([...q(`.${styles.captions}`), ...q(`.${styles.dots}`)], DEPTH.label);

    /* THE TYPE MOVES AS ITS LAYER, NOT AS ITSELF. Every block of copy in this
       section also carries `data-reveal`, and `revealOnEnter` animates its
       `y` on the way in. A drift written onto the same elements would take
       the transform over before that entrance had run and flatten it to a
       bare fade. So depth belongs to a wrapper and the entrance belongs to
       the element inside it, and the two never touch the same property. */
    drift(q(`.${styles.copyLayer}`), DEPTH.copy);
    drift(q(`.${styles.leadLayer}`), DEPTH.lead);

    /* The ring, on the same clock, expressed the way a circle expresses
       motion. The gap in the stroke is drawn by the stylesheet; this is what
       carries it round. */
    const mark = q(`.${styles.ringMark}`);
    if (mark.length > 0) {
      gsap.fromTo(
        mark,
        { rotate: -RING_TURN },
        {
          rotate: RING_TURN,
          ease: "none",
          scrollTrigger: { ...range(), onToggle: promote(mark) },
        },
      );
    }
  }, []);

  return (
    <section
      ref={root}
      id="practice"
      className={`on-cream ${styles.section}`}
      aria-labelledby="practice-title"
    >
      {/* ------------------------------------------------------------------
          The panel. Source order is the RIGHT column first, because that is
          the order the single-column layout has to read in: the photograph,
          the statement it belongs to, the specifics, the way through. The
          grid puts it back on the right at 64rem and up. */}
      <div className={styles.panel}>
        <div className={styles.right}>
          <figure className={styles.wide}>
            <Image
              src={content.wide.src}
              alt={content.wide.alt}
              width={content.wide.width}
              height={content.wide.height}
              sizes="(max-width: 64rem) 100vw, 52vw"
              quality={82}
              loading="lazy"
              className={styles.wideImage}
            />
          </figure>

          {/* The front plane. It carries the statement alone — see the note
              on the type in the setup above: the layer owns the depth, the
              element inside it owns the entrance. */}
          <div className={styles.leadLayer}>
            <h2
              id="practice-title"
              className={styles.statement}
              data-reveal="up"
            >
              <Swash heading={content.statement} />
            </h2>
          </div>

          <div className={`${styles.copyLayer} ${styles.close}`}>
            <p className={styles.detail} data-reveal="up">
              {content.detail}
            </p>

            {/* The one control in the section, and it points at the section
                directly below it — which is the sentence the arc opened on,
                answered. A ring rather than a bar because it is the only
                interactive thing on a screen of static composition; a pill
                here would have read as a form control. */}
            <a className={styles.ring} href={content.cta.href}>
              <span className={styles.ringMark} aria-hidden="true">
                <svg viewBox="0 0 100 100" focusable="false">
                  <circle
                    className={styles.ringPath}
                    cx="50"
                    cy="50"
                    r="48.5"
                    pathLength={1}
                    fill="none"
                  />
                </svg>
              </span>
              <span className={styles.ringLabel}>{content.cta.label}</span>
              <ArrowRight className={styles.ringArrow} />
            </a>
          </div>
        </div>

        <div className={styles.left}>
          <div className={styles.plate}>
            {/* Drawing, not content. It is behind the print in paint order
                because it is first in the tree — no z-index needed, and none
                that could later be outranked. */}
            <span className={styles.ground} aria-hidden="true" />
            <PortraitPlate
              image={content.portrait}
              // Read only by the lettered plate, which this no longer renders
              // — kept accurate so clearing the `src` degrades correctly.
              name="The terrace"
              // The source is a 9:16 portrait. A classic print ratio takes a
              // quarter of that height away from the top and the bottom
              // equally, which is exactly the ceiling and the foreground
              // decking — see the crop weighting in the stylesheet.
              ratio="3 / 4"
              sizes="(max-width: 64rem) 74vw, 30vw"
              className={styles.portrait}
            />
          </div>

          <div className={`${styles.copyLayer} ${styles.commitmentsLayer}`}>
            <div className={styles.commitments} data-reveal="up">
              <p className={styles.commitmentsTitle}>
                {content.commitmentsTitle}
              </p>
              <ul className={styles.commitmentList}>
                {content.commitments.map((commitment) => (
                  <li key={commitment} className={styles.commitment}>
                    {commitment}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Frames slides={content.slides} />
    </section>
  );
}

/**
 * The frames the section closes on.
 *
 * THE SAME INSTRUMENT AS THE SHOWCASE at the foot of the story section, and
 * literally so: the cut, the autoplay, the hold on hover and focus and the
 * reduced-motion path are all `lib/wipe`, which that section drives too. The
 * page shows a set of photographs in exactly two places and it should do it
 * one way — the same decision as the one curve behind its two changes of
 * ground. What differs here is composition and only composition: a wide band
 * where that one is a small plate, ranged left where that one is centred.
 *
 * INDENTED FROM THE LEFT AND RUNNING OFF THE RIGHT. Both edges of the window
 * are used by the panel above, and the closing frame answers it — a window
 * onto something continuing, in a section whose photographs are all windows.
 * The controls stand on the indent, in the column of air the frame leaves.
 */
function Frames({ slides }: { slides: PracticeSlide[] }) {
  const total = slides.length;

  const root = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const seam = useRef<HTMLSpanElement | null>(null);
  const slideEls = useRef<(HTMLElement | null)[]>([]);
  const innerEls = useRef<(HTMLElement | null)[]>([]);
  const captionEls = useRef<(HTMLElement | null)[]>([]);

  const { index, go, hold } = useWipeSequence(total, {
    root,
    frame,
    seam,
    slides: slideEls,
    inners: innerEls,
    captions: captionEls,
  });

  return (
    <div ref={root} className={styles.frames} {...hold}>
      <div ref={frame} className={styles.frameBox}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideEls.current[i] = el;
            }}
            className={styles.slide}
            data-active={i === index}
            aria-hidden={i !== index}
          >
            <div
              ref={(el) => {
                innerEls.current[i] = el;
              }}
              className={styles.slideInner}
            >
              {slide.image.src ? (
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  fill
                  sizes="(max-width: 64rem) 92vw, 78vw"
                  quality={82}
                  loading="lazy"
                  className={styles.frameImage}
                />
              ) : (
                <PortraitPlate
                  image={slide.image}
                  name={slide.place}
                  ratio="21 / 9"
                  sizes="(max-width: 64rem) 92vw, 78vw"
                  className={styles.framePlate}
                />
              )}
            </div>
          </div>
        ))}

        {/* The hairline of light that travels with the wipe edge. */}
        <span ref={seam} className={styles.seam} aria-hidden="true" />
      </div>

      <p className={styles.captions} aria-live="polite">
        {slides.map((slide, i) => (
          <span
            key={slide.id}
            ref={(el) => {
              captionEls.current[i] = el;
            }}
            className={styles.caption}
            data-active={i === index}
            aria-hidden={i !== index}
          >
            {slide.caption}
          </span>
        ))}
      </p>

      <div
        className={styles.dots}
        role="group"
        aria-label="Choose a photograph"
      >
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={styles.dot}
            data-active={i === index}
            aria-current={i === index ? "true" : undefined}
            aria-label={`Photograph ${i + 1} of ${total}: ${slide.place}`}
            onClick={() => go(i)}
          >
            <span className={styles.dotMark} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** The house arrow, as FinalCTA and the team slides set it. */
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default Practice;
