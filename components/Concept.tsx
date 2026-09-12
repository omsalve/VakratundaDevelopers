"use client";

import { useId, useRef } from "react";
import { measureDome, paintDome } from "@/lib/arc";
import type { ConceptContent } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import ConceptShowcase from "./ConceptShowcase";
import Legacy from "./Legacy";
import PageLink from "./PageLink";
import { LogoMark } from "./Logo";
import styles from "./Concept.module.css";

/**
 * The quiet beat — and the page's one change of ground.
 *
 * It does not come after the opening section; it comes UP THROUGH it. The
 * section is pulled three viewports back over the still-held impact frame, and
 * its top edge is a half circle: a cream dome that rises from the bottom of
 * the viewport and expands until it has become the whole viewport, with the
 * brand lockup landing in the middle of it. The shape of the transition is
 * simply the shape of this section's top, so there is no separate wipe element
 * and nothing to keep in sync — the arc IS the section arriving.
 *
 * WHAT LANDS IN IT is the mark, not a sentence: the brand mark with the name
 * set under it, a hairline dropped from that, and one two-line promise under
 * the hairline — three boxes on a single axis, at one repeated interval, on an
 * otherwise empty field of cream. The section's prose starts below the dome
 * instead.
 *
 * Riding the crest of that arc is one line of type, set on a circle that is
 * concentric with the dome: same centre, radius a fixed inset inside it. It
 * rises and flattens as the dome opens and then leaves with the edge it is
 * riding, out of the top of the frame — it never parks, so it reads as part
 * of the arc rather than as a label the arc happens to pass.
 *
 * WHY IT IS SLOW. Three things, together, are what separate an arc opening
 * from a shape detonating:
 *
 *   · Distance. The dome is given two full viewports of scroll (DOME_SPAN),
 *     twice what it had.
 *   · No overshoot. The radius is measured, not guessed — it stops at the
 *     exact value that reaches the far corners of the stage. A radius chosen
 *     as a safe-for-every-aspect-ratio percentage spends a third of the
 *     scroll off-screen, which forces the visible part to move a third
 *     faster to keep up.
 *   · An eased radius. Cream area grows with the SQUARE of the radius, so a
 *     linear radius reads as an accelerating burst. `power1.out` is very
 *     nearly √t, which makes the rate at which cream fills the frame roughly
 *     constant — a curve travelling at one speed, first frame to last.
 *
 * Same curve family as the petal in the brand mark, and the same navy → cream
 * hand-over the page makes exactly twice.
 *
 * Below the dome the section behaves normally: the prose, and then
 * ConceptShowcase — a very large headline over a small portrait plate that
 * changes every three seconds — flow on cream.
 *
 * Without JS, or under prefers-reduced-motion, none of the `.motion-on` rules
 * in the stylesheet apply and no clip is ever set: the overlap, the sticky
 * stage, the dome and the curved line all fall away, and what is left is an
 * ordinary cream section that opens on the same lockup, at the same intervals.
 * There is no half-open state to get stuck in.
 */

/** Viewports of scroll the dome opens over. The stylesheet has to agree: the
 *  sticky stage's range is `.reveal`'s height minus the one viewport the
 *  stage itself occupies, and the dome may not outlast it. */
const DOME_SPAN = 2;

/** Half-angle of the arc the curved line is set on. 80° each way is far more
 *  path than a short line needs, which keeps `text-anchor: middle` honest at
 *  every radius. */
const ARC_SWEEP = (80 * Math.PI) / 180;

/** How much longer than the line itself its arc has to be before the line is
 *  shown at all — below this the type is bent hard enough to look pinched. */
const ARC_FIT = 1.15;

/** The fade-up, as a fraction of that first usable radius. */
const ARC_FADE = 0.55;

export function Concept({ content }: { content: ConceptContent }) {
  const root = useRef<HTMLElement | null>(null);
  const reveal = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const dome = useRef<HTMLDivElement | null>(null);
  const rest = useRef<HTMLDivElement | null>(null);
  const arcSvg = useRef<SVGSVGElement | null>(null);
  const arcPath = useRef<SVGPathElement | null>(null);
  const arcLabel = useRef<SVGTextElement | null>(null);

  // useId() emits colons, which are not valid in an href="#..." reference.
  const arcId = `arc-${useId().replace(/:/g, "")}`;

  useGsapScope(root, () => {
    if (!reveal.current || !stage.current || !dome.current || !rest.current) {
      return;
    }

    // A single scalar, 0 → 1, driving both the clip and the curved line, so
    // the two can never disagree about where the arc is.
    const state = { open: 0 };

    // Measured off the live stage on every ScrollTrigger.refresh(), which is
    // also what fires on resize and on an orientation change.
    let width = 0;
    let height = 0;
    let radiusMax = 0;
    /** Gap between the dome's edge and the baseline of the curved line. */
    let inset = 0;
    /** Radius at which the line first fits on its own arc; see `measure`. */
    let minRadius = 0;

    /** A circular arc, centred at (cx, cy), symmetrical about its top point. */
    const arc = (cx: number, cy: number, r: number) => {
      const from = -Math.PI / 2 - ARC_SWEEP;
      const to = -Math.PI / 2 + ARC_SWEEP;
      const x0 = (cx + r * Math.cos(from)).toFixed(2);
      const y0 = (cy + r * Math.sin(from)).toFixed(2);
      const x1 = (cx + r * Math.cos(to)).toFixed(2);
      const y1 = (cy + r * Math.sin(to)).toFixed(2);
      // Under 180° of sweep, drawn left to right over the top: large-arc 0,
      // sweep 1 in SVG's y-down coordinates.
      const R = r.toFixed(2);
      return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
    };

    const draw = () => {
      const r = state.open * radiusMax;

      paintDome(dome.current!, r);

      const path = arcPath.current;
      const svg = arcSvg.current;
      if (!path || !svg) return;

      const textRadius = r - inset;
      if (textRadius < minRadius) {
        svg.style.opacity = "0";
        return;
      }

      // Always concentric with the dome: same bottom-centre origin, radius a
      // fixed inset inside the clip edge. So the line rises, flattens, and
      // finally leaves through the top of the frame with the edge it is
      // riding — it never parks. `.arcSvg` clips to the stage, and that clip
      // is what the exit is.
      path.setAttribute("d", arc(width / 2, height, textRadius));
      svg.style.opacity = String(
        Math.min(1, (textRadius - minRadius) / (minRadius * ARC_FADE)),
      );
    };

    const measure = () => {
      // The same measurement the page's second arc is drawn from — one curve,
      // measured once, in lib/arc. `width` and `height` are the stage's, and
      // the curved line below is set on a circle concentric with the dome, so
      // it reads them back rather than measuring the stage a second time.
      ({ width, height, radiusMax } = measureDome(stage.current!));

      const size = arcSvg.current
        ? parseFloat(getComputedStyle(arcSvg.current).fontSize) || 20
        : 20;
      // Nearly three ems of cream between the arc's edge and the baseline.
      // The line has to sit well clear of the edge to read as set on the
      // curve rather than trapped against it.
      inset = size * 2.9;

      // The radius at which the line first fits on its own arc, measured
      // rather than guessed: the font size, the tracking and the copy itself
      // all move it. Drawn at full radius purely so there is a path long
      // enough to measure against; `draw()` replaces it on the next line.
      let length = 0;
      if (arcPath.current && arcLabel.current) {
        arcPath.current.setAttribute("d", arc(width / 2, height, radiusMax));
        try {
          length = arcLabel.current.getComputedTextLength();
        } catch {
          length = 0;
        }
      }
      minRadius =
        length > 0 ? (length * ARC_FIT) / (2 * ARC_SWEEP) : height * 0.35;

      draw();
    };

    gsap
      .timeline({
        scrollTrigger: {
          trigger: reveal.current,
          start: "top top",
          end: () => `+=${window.innerHeight * DOME_SPAN}`,
          // A long scrub. The arc lags the wheel by a beat and eases to rest
          // whenever scrolling stops, which is most of what reads as
          // composure rather than reaction.
          scrub: 1.1,
          onRefresh: measure,
        },
      })
      .to(
        state,
        {
          open: 1,
          // Very nearly √t — see the note on the eased radius above.
          ease: "power1.out",
          // Finishes just short of the end: the last of the overlap is spent
          // on a viewport that has already gone fully cream, so the heading
          // settles into a still frame rather than a closing one.
          duration: 0.86,
          onUpdate: draw,
        },
        0,
      )
      // The heading starts once there is enough cream under it to read
      // against, and lands as the dome finishes.
      .to(
        `.${styles.lede} > *`,
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.4,
          stagger: 0.1,
        },
        0.46,
      );

    measure();

    revealOnEnter(`.${styles.stack} > *`, rest.current, { stagger: 0.1 });

    // The fit test above is a type measurement, and the display face arrives
    // after first paint. Without this the line is sized against a fallback
    // font's metrics and appears a little early or a little late.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) measure();
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="story-title"
    >
      <div ref={reveal} className={styles.reveal}>
        {/* Where #story lands: the moment the dome has become the whole
            viewport, not the moment it starts opening. */}
        <span id="story" className={styles.anchor} aria-hidden="true" />

        <div ref={stage} className={styles.stage}>
          <div ref={dome} className={`on-cream ${styles.dome}`}>
            {/* Clipped along with the cream it is set on, so no part of the
                line can appear outside the dome. Purely decorative and hidden
                from the tree — it is drawing, not copy, and it says nothing
                the lockup and the body below do not already say. */}
            <svg
              ref={arcSvg}
              className={styles.arcSvg}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                {/* No `d` until the stage has been measured — an unmeasured
                    arc is no arc, rather than a wrong one. */}
                <path ref={arcPath} id={arcId} fill="none" />
              </defs>
              <text ref={arcLabel}>
                <textPath href={`#${arcId}`} startOffset="50%">
                  {content.arcText}
                </textPath>
              </text>
            </svg>

            {/* The lockup, not a headline. Three boxes on one axis, evenly
                spaced: the mark with the name under it, the rule dropped from
                that, and the promise the rule is pointing at. They are also
                the three children the opening timeline staggers, which is why
                the mark and the name are ONE box — they are one mark, and a
                fourth child would both break the interval and stagger the
                lockup apart from itself. */}
            <div className={styles.lede}>
              {/* No aria-label. The heading's own text is the name, exactly as
                  it is set, and the mark above it is decorative — so the
                  accessible name is right without being overridden. */}
              <h2 id="story-title" className={styles.lockup}>
                <LogoMark className={styles.lockupMark} />
                <span className={styles.word}>{content.lockup.wordmark}</span>
              </h2>

              <span className={styles.rule} aria-hidden="true" />

              <p className={styles.caption}>
                {content.lockup.caption.map((line, index) => (
                  <span key={line} className={styles.captionLine}>
                    {/* The break is composed, so the second line needs the
                        space the line break would otherwise have carried. */}
                    {index > 0 && " "}
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div ref={rest} className={`on-cream ${styles.rest}`}>
        <div className={`u-shell ${styles.shell}`}>
          <div className={styles.stack}>
            {content.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* The way out of the prose and into the long version of it. Placed
              here rather than under Legacy because THIS is the paragraph it
              answers: the section closes on the proof, and an offer to read
              more set after the proof reads as a doubt about it. Outside
              `.stack` on purpose — the stack's entrance staggers its own
              children, and the mark brings its own. */}
          <PageLink
            className={styles.onward}
            href="/about"
            label="The practice, in full"
          />
        </div>

        {/* Outside the 44rem measure the paragraphs are set to: the showcase's
            headline is the largest type on the page and needs the full shell
            to break over. */}
        <div className="u-shell">
          <ConceptShowcase content={content.showcase} />
        </div>

        {/* The proof, and the last word the section has: the guide's own
            circles on the right, the Skygarden roof render at the foot of the
            left. It carries its own shell — the render is bled out past it. */}
        <Legacy content={content.legacy} />
      </div>
    </section>
  );
}

export default Concept;
