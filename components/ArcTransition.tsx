"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import { ARC_SPAN, measureDome, paintDome } from "@/lib/arc";
import type { SwashHeading, TeamInterstitial } from "@/lib/content";
import { gsap, useGsapScope } from "@/lib/motion";
import Swash from "./Swash";
import styles from "./ArcTransition.module.css";

/**
 * The curved wipe that resets attention between thematic groups — as a free
 * event, not as a mask bolted onto a section.
 *
 * IT IS ITS OWN MOMENT, AND IT REVEALS NOTHING. That is the change, and
 * everything else follows from it. The wrapper opens a runway of its own,
 * sticks a viewport-sized stage in it, and grows a cream disc from the bottom
 * centre of the SCREEN until the screen is cream. The section it introduces
 * then arrives afterwards, in ordinary flow, completely unclipped — it is the
 * next thing the visitor sees rather than the thing being unveiled.
 *
 * The version this replaces clipped the wrapped section itself. That made the
 * arc a property of the section's box: it had to open in the 0.78 of a
 * viewport the section took to rise into frame, against a backdrop that was
 * sliding away underneath it, and its geometry had to be defended against the
 * section's own height on every line. This one owns its scroll, holds its
 * frame still, and knows nothing at all about what it is followed by — the
 * same construction Concept's dome uses, which is the arc this page opens
 * with. Two changes of ground, one curve, built the same way twice.
 *
 * THE OVERLAP IS WHAT MAKES IT FREE. `.wrap` is pulled ARC_SPAN viewports back
 * so its runway lands INSIDE the sticky range of the section above, and the
 * disc opens against a held frame rather than one still moving. The section
 * above has to have grown by ARC_RUN to pay for that — see ProjectsShowcase,
 * which holds its last frame perfectly still for exactly this long. Below
 * 60rem, where that section is an ordinary scrolling block with no held frame
 * to offer, there is no overlap: the runway stands on its own and the disc
 * opens on the page's navy ground. Nothing above it is ever covered.
 *
 * The children keep their own document position either way, because the
 * runway gives back exactly what the negative margin took. Nothing below has
 * to be re-timed, and a section that enters through this arc needs no
 * knowledge of it: its own entrances fire off its own top edge, which is now
 * a full screen of open cream below the arc rather than a point underneath it.
 *
 * Under prefers-reduced-motion `useGsapScope` skips the setup, and none of the
 * `.motion-on` rules apply: the runway has no height, the disc is not
 * rendered, and the section below simply follows the one above. Same for a
 * script that fails to run. There is no half-open state to get stuck in.
 *
 * IT CARRIES THE PAGE'S SECOND LOCKUP. `interstitial` is the copy that rides
 * the cream this arc opens — the one moment on the page where the ground
 * itself is the composition and there is nothing else in the frame to compete
 * with type. It is NOT part of the drawing: it lives outside the
 * `aria-hidden` subtree the disc is in, and in the default layout, where
 * there is no runway and no arc at all, it is an ordinary cream band between
 * the two sections rather than a caption on an effect that never ran.
 *
 * IT IS SET AS A TOWER, NOT AS A SENTENCE, which is the change here. The
 * words before the swash are stacked one to a line in display caps and the
 * swash word closes the stack on its own line, in the italic, larger than the
 * roman above it and tucked up under it. On an otherwise empty screen of
 * cream a line of type set across the measure is a caption; the same words
 * stacked and set at display size are the reason the arc opened. It is the
 * same grammar as Concept's lockup — three boxes on one axis, on an empty
 * field — which is what makes the page's two changes of ground a pair rather
 * than a repeat.
 *
 * THE STACK IS DERIVED, NOT AUTHORED, so the copy stays one ordinary
 * `SwashHeading` and the CMS field behind it does not have to learn about
 * line breaks. Above `STACK_MAX` words it is set as a sentence instead: a
 * seven-line tower is not the composition this is, and an editor should get
 * the flowing version rather than a broken one.
 *
 * The tweens that bring it in and take it away are placed INSIDE the arc's
 * own 0.86, so the timeline's duration is exactly what it was and the disc
 * still opens across precisely the scroll it opened across before. Adding a
 * beat after the arc would have lengthened the timeline and silently re-paced
 * the curve against the runway.
 */

/** Roman lines the tower is set in before it is set as a sentence instead. */
const STACK_MAX = 4;

/**
 * "People before " + *projects* + "." → ["People", "before"] and "projects."
 *
 * The trailing punctuation travels with the swash word, because it is the end
 * of the line it is set on and hanging it under the stack on its own would be
 * a fifth line carrying a full stop.
 */
function stackOf(heading: SwashHeading): { roman: string[]; swash: string } {
  const roman = (heading.before ?? "").trim().split(/\s+/).filter(Boolean);
  return { roman, swash: `${heading.swash}${heading.after ?? ""}` };
}

type Props = {
  children: ReactNode;
  className?: string;
  /** The line the cream carries. Omit it and the arc is what it always was. */
  interstitial?: TeamInterstitial;
};

export function ArcTransition({ children, className, interstitial }: Props) {
  const root = useRef<HTMLDivElement | null>(null);
  const reveal = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const dome = useRef<HTMLDivElement | null>(null);
  const line = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    const runway = reveal.current;
    const frame = stage.current;
    const disc = dome.current;
    if (!runway || !frame || !disc) return;

    // A single scalar, 0 → 1, so there is one statement of where the arc is.
    const state = { open: 0 };
    let radiusMax = 0;

    const draw = () => paintDome(disc, state.open * radiusMax);

    // Re-measured on every ScrollTrigger.refresh(), which is also what fires
    // on a resize and on an orientation change.
    const measure = () => {
      radiusMax = measureDome(frame).radiusMax;
      draw();
    };

    gsap
      .timeline({
        scrollTrigger: {
          // The runway's own range: it sticks when its top reaches the top of
          // the window and releases when its bottom reaches the bottom, which
          // is exactly the ARC_RUN viewports the stage is held for. Stated
          // once, here, rather than restated as a number in the stylesheet.
          trigger: runway,
          start: "top top",
          end: "bottom bottom",
          // A long scrub. The arc lags the wheel by a beat and eases to rest
          // whenever scrolling stops, which is most of what reads as
          // composure rather than reaction.
          scrub: 1.1,
          onRefresh: measure,
          // Promote for the duration and no longer. Re-rasterising a clipped,
          // full-viewport plate on every scroll frame is the expensive version
          // of this effect; keeping the layer alive for the rest of the page
          // is the wasteful one.
          onToggle: (self) => {
            disc.dataset.arc = self.isActive ? "on" : "off";
          },
        },
      })
      .to(
        state,
        {
          open: 1,
          // Very nearly √t — see the note on the eased radius in lib/arc.
          ease: "power1.out",
          // Finishes just short of the end, so the last of the runway is spent
          // on a screen that has already gone fully cream. The section below
          // then rises into an open field rather than into a closing arc,
          // which is the beat its own stylesheet asks for.
          duration: 0.86,
          onUpdate: draw,
        },
        0,
      )

      /* THE SENTENCE, if there is one. It arrives only once the cream has
         taken most of the frame — a line fading up through a disc that is
         still growing under it reads as a caption on the wipe — and it has
         left before the runway ends, so the section below still rises into
         an open field.

         BOTH BEATS ARE SLOW, and both are a quarter of the arc rather than a
         tenth of it. The line is the only thing on the screen at that point;
         a fast entrance on an empty cream field is the one place on the page
         where haste has nowhere to hide. It settles out of a slight overscale
         on `expo.out` — the ease every other entrance on the site uses — and
         leaves on a sine, which has no attack at all.

         Both sit inside the arc's own 0.86, so the timeline is not one unit
         longer than it was without them and the disc still opens across
         precisely the scroll it opened across before. */
      .fromTo(
        line.current,
        { opacity: 0, y: 44, scale: 1.045 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "expo.out" },
        0.44,
      )
      .to(
        line.current,
        { opacity: 0, y: -30, scale: 0.985, duration: 0.16, ease: "sine.in" },
        0.7,
      );

    measure();
  }, []);

  return (
    <div
      ref={root}
      className={clsx(styles.wrap, className)}
      // The one number. The stylesheet derives the runway, the overlap that
      // cancels it, and nothing else from it.
      style={{ "--arc-span": ARC_SPAN } as CSSProperties}
    >
      <div ref={reveal} className={styles.reveal}>
        <div ref={stage} className={styles.stage}>
          {/* Drawing, not content: there is nothing inside the disc to read,
              and the section it hands over to is in the tree directly
              below. The `aria-hidden` is on the disc alone — the sentence
              beside it is real copy and has to stay in the tree. */}
          <div ref={dome} className={styles.dome} aria-hidden="true" />

          {interstitial ? (
            <div
              ref={line}
              className={clsx("on-cream", styles.interstitial)}
            >
              <div className={`u-shell ${styles.interstitialShell}`}>
                {/* A <p>, not a heading, however large it is set: the
                    sections either side of this own the page's outline, and a
                    landmark-less tower of type between two of them must not
                    insert a rank into it. */}
                <p className={styles.lockup}>{renderLockup(interstitial)}</p>
                <p className={styles.interstitialSubtext}>
                  {interstitial.subtext}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}

/**
 * The tower, or the sentence — see `STACK_MAX`.
 *
 * The stacked case is spans on a block-level line each rather than a `<br>`
 * per word, so the swash line can be sized, tracked and pulled up against the
 * roman above it independently of the stack it closes. Either way the words
 * are one continuous string to a screen reader.
 */
function renderLockup(interstitial: TeamInterstitial) {
  const { roman, swash } = stackOf(interstitial.heading);

  if (roman.length === 0 || roman.length > STACK_MAX) {
    return (
      <span className={`u-h1 ${styles.lockupFlow}`}>
        <Swash heading={interstitial.heading} />
      </span>
    );
  }

  return (
    <>
      {roman.map((word) => (
        <span key={word} className={styles.lockupWord}>
          {word}
        </span>
      ))}
      <span className={`u-swash ${styles.lockupSwash}`}>{swash}</span>
    </>
  );
}

export default ArcTransition;
