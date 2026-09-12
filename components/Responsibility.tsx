"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { ImageAsset, ResponsibilityContent } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import PageLink from "./PageLink";
import ResponsibilityIcons from "./ResponsibilityIcons";
import Swash from "./Swash";
import styles from "./Responsibility.module.css";

/**
 * What the group owes — the community it builds among, and the ground it
 * builds on — as five compositions ruled across one horizon.
 *
 * ============================================================================
 * THE HORIZON IS THE SECTION
 * ============================================================================
 *
 * ONE HAIRLINE, AT A FIXED HEIGHT IN THE FRAME, AND IT NEVER MOVES. It is the
 * only element in the section that survives every change of slide, and every
 * composition is built against it: the SUBJECT stands above the line — the
 * heading, the photographs, the four drawings — and the APPARATUS hangs below
 * it — the captions, the places, the notes, the practice names. Nothing is
 * centred in the frame and nothing floats; everything in this section is
 * either standing on the ground or written under it.
 *
 * That is not decoration, it is the argument. This is a builder's account of
 * what it owes, and the thing a builder is finally answerable to is the ground
 * it put the building on. So the ground is drawn once, at the top of the
 * section, and then held while five different claims are made on it.
 *
 * THE FOUR SUSTAINABILITY DRAWINGS STAND ON IT LITERALLY. Three of the four in
 * ResponsibilityIcons.tsx carry the same ground line — `M3.5 28.5h25`, at
 * 89.06% of their own 32-unit field — so the fourth slide drops each drawing
 * by the remaining 10.94% of its height and the line inside the drawing lands
 * exactly on the line across the section. Energy has no ground line (it is a
 * facade fragment, not a thing standing on a site) and is left where the same
 * offset puts it, a few pixels clear.
 *
 * ============================================================================
 * THE WIPE — THE LINE IS RULED, AND THE COMPOSITION CHANGES BEHIND THE PEN
 * ============================================================================
 *
 * THE TEAM SLIDESHOW HIDES ITS CUT. A plane of the page's own cream crosses
 * its frame, the slide is exchanged underneath it at the moment of full cover,
 * and the plane carries on out — so no two slides are ever on the screen
 * together and the change itself is never seen. That is the right answer
 * there: the subject is people, and the section is a series of portraits.
 *
 * THIS SECTION TAKES THE OPPOSITE CONSTRAINT, DELIBERATELY, because the
 * subject is conduct and a section about conduct should show its working. A
 * rose NIB travels the horizon from left to right, ruling across the frame.
 * AHEAD OF IT the outgoing composition is still standing; BEHIND IT the
 * incoming one is already up. Both slides are on the screen at once, for the
 * whole of every change — which the team section rules out by construction —
 * and what keeps that from being a dissolve is that they are divided by ONE
 * SHARED EDGE and never overlap a single pixel:
 *
 *     outgoing    clip-path: inset(0 0 0 P%)          — kept to the RIGHT
 *     incoming    clip-path: inset(0 calc(100%-P) 0 0) — kept to the LEFT
 *
 * Two insets off the same P, against the same containing block, resolving to
 * the same device pixel. And the nib rides exactly that pixel, 1.5px of deep
 * rose with a shadow thrown to the right, so even a sub-pixel seam has the
 * pen sitting on top of it. THE MARK IS THE JOIN. That is why this transition
 * needs no covering plane: there is nothing to hide, because the edge is the
 * thing you are meant to watch.
 *
 * FOUR THINGS MAKE THE EDGE READ AS A PEN RATHER THAN AS A CURTAIN ROD:
 *
 *   1. THE MARK IS LIT ALONG ITS LENGTH — solid at the horizon and falling
 *      away to nothing at the top and bottom of the frame, so it is brightest
 *      exactly where it is touching the line it is ruling.
 *   2. IT LEAVES INK. A short rose segment trails from the mark ALONG the
 *      horizon, fading out behind it — the line being drawn, not a bar being
 *      pushed.
 *   3. THE STAKE. A small rotated square sits on the crossing of the mark and
 *      the horizon: the contact point, the one filled shape in the transition.
 *   4. THE TWO SIDES TRAVEL AT DIFFERENT RATES. The outgoing composition
 *      drifts left slowly and racks out of focus while it is being overtaken;
 *      the incoming one arrives from a larger offset and settles harder, and
 *      is still settling a beat after the nib has left the frame. One edge,
 *      two depths.
 *
 * ============================================================================
 * TWO LAYOUTS, FROM ONE SET OF MARKUP — the house pattern
 * ============================================================================
 *
 *   · DEFAULT (no JS, reduced motion, or under 64rem). Five ordinary cream
 *     blocks, stacked, in document order, each complete: the head, the school
 *     and its yard, the court and the earlier school, the four practices, and
 *     the closing line with the way into the long version. No horizon, no nib,
 *     no index — there is nothing to rule across when every slide is already
 *     on the page. THE SECTION IS COMPLETE. This is also, with no second code
 *     path, the reduced-motion fallback: `motion-on` is never set for that
 *     visitor, so `useGsapScope` never runs and there is no sequence to be
 *     stuck inside.
 *
 *   · `.motion-on`, 64rem and up. The section grows to SPAN viewports, the
 *     stage goes sticky, and the scroll rules the pen across the frame.
 *
 * THE INDEX IS NOT A RAIL. The team section measures its set with a survey
 * line — a rule, a node per slide, a fill that tracks the scroll. Repeating
 * that here would make the two sections read as one device used twice. So the
 * control is typographic instead: five names ranged along the foot, and a
 * single short rose rule that TRAVELS between them — measured off the live
 * label rather than stepped between fixed stops, which is the same gesture as
 * the nib above it, one register quieter.
 */

/* ============================================================================
   THE SEQUENCE, in timeline units. A unit is a unit of the timeline, not of
   the section: the section's height is DERIVED from the sum below, so the
   holds and the wipes can be re-paced without a viewport figure anywhere
   needing to be re-tuned to match.
   ========================================================================== */

/** The five compositions, in order. The labels are the index's, and the
 *  accessible names of the slides themselves. */
const SLIDES = [
  { id: "ledger", label: "The ledger" },
  { id: "school", label: "The school" },
  { id: "earlier", label: "The earlier school" },
  { id: "ground", label: "The ground" },
  { id: "closing", label: "In closing" },
] as const;

const COUNT = SLIDES.length;

/** Units a composition is held perfectly still. The only state any of this
 *  copy is meant to be read in. */
const HOLD = 1.1;

/** Units one ruling occupies. Longer than the hold either side of it: the pen
 *  has the whole width of the frame to cross, and a wipe that is quicker than
 *  the pause around it reads as a jump cut with a line drawn over it. */
const WIPE = 1.45;

/** Viewports of scroll one unit is worth. */
const PACE = 0.58;

/** The whole timeline: every composition held, every gap between two of them
 *  ruled across. */
const UNITS = COUNT * HOLD + (COUNT - 1) * WIPE;

/** Viewports the section occupies: one for the stage, the rest for travel. */
const SPAN = UNITS * PACE;

/** Where slide `i` begins to be held, in units. */
const holdAt = (i: number) => i * (HOLD + WIPE);

/** Where the ruling OUT of slide `i` begins, in units. */
const wipeAt = (i: number) => holdAt(i) + HOLD;

/** Where in a ruling the index changes hands — the pen at mid-frame, which is
 *  the one moment neither composition can claim to be the subject. */
const HANDOVER = 0.5;

/** The three states a slide's clip rests in. Stated once, so the setup, the
 *  tweens and the scrub all agree on what "not yet", "held" and "gone" are. */
const CLIP_AHEAD = "inset(0% 100% 0% 0%)"; /* not yet ruled in: nothing shown */
const CLIP_OPEN = "inset(0% 0% 0% 0%)"; /* held: the whole frame */
const CLIP_GONE = "inset(0% 0% 0% 100%)"; /* ruled out: nothing left */

/** Below this the motion layout is not built at all — see the stylesheet. */
const MOTION_QUERY = "(min-width: 64rem)";
const STANDING_QUERY = "(max-width: 63.99rem)";

export function Responsibility({
  content,
}: {
  content: ResponsibilityContent;
}) {
  const root = useRef<HTMLElement | null>(null);
  const index = useRef<HTMLElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scroller = useRef<((i: number) => void) | null>(null);

  /** Which composition is being held. Drives the index and, in the stacked
   *  layout, which slide is reachable at all. */
  const [held, setHeld] = useState(0);

  /** True only while the sticky, one-frame layout is actually built. The
   *  standing layout has every slide on the page and must inert none of
   *  them. */
  const [stacked, setStacked] = useState(false);

  /** A slide reports its node up rather than being handed the array to write
   *  into: a ref passed down as a prop is the parent's, and writing to it from
   *  a child is a mutation of a prop however it is spelled. */
  const holdSlide = useCallback((i: number, el: HTMLDivElement | null) => {
    slideRefs.current[i] = el;
  }, []);

  const goTo = useCallback((i: number) => {
    const scroll = scroller.current;
    if (scroll) {
      scroll(i);
      return;
    }
    // Standing layout, or a click that lands before the timeline is built:
    // the slides are real blocks in document order, so an ordinary jump is
    // both correct and all that is wanted.
    slideRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* ---- The index's travelling rule ---------------------------------------
     Measured off the live label rather than declared per stop: the rule is
     exactly as long as the name it is under, whatever the window does to the
     type. It is drawn 1px wide and scaled, so what moves between slides is a
     transform and never a layout. */
  useEffect(() => {
    const nav = index.current;
    if (!nav || !stacked) return;

    const place = () => {
      const label = nav.querySelector<HTMLElement>(`[data-slide="${held}"]`);
      if (!label) return;
      nav.style.setProperty("--ix", `${label.offsetLeft}px`);
      nav.style.setProperty("--iw", `${label.offsetWidth}`);
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [held, stacked]);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    /* ---- Wide: one frame, and the scroll rules across it ---------------- */
    mm.add(MOTION_QUERY, () => {
      const q = gsap.utils.selector(section);
      const slides = q(`.${styles.slide}`);
      const nib = q(`.${styles.nib}`)[0];
      const horizon = q(`.${styles.horizon}`)[0];
      if (slides.length !== COUNT) return;

      setStacked(true);

      /* The slide bodies are marked `data-reveal`, which the global stylesheet
         holds at opacity 0 under `motion-on` so the STANDING layout can bring
         them in one at a time. Here the clip owns visibility entirely, so they
         are handed back visible before anything else runs. gsap.context
         reverts this on the way out. */
      gsap.set(q("[data-reveal]"), { opacity: 1, y: 0 });

      /* Every slide but the first waits ahead of the pen. */
      gsap.set(slides.slice(1), { clipPath: CLIP_AHEAD });
      gsap.set(slides[0]!, { clipPath: CLIP_OPEN });

      /* ---- (0) THE GROUND IS RULED, AND THE FIRST CLAIM GROWS OUT OF IT ---
         The one entrance in the section that is not a wipe, and the one that
         teaches the device: the line is drawn across the frame, and then the
         heading rises OUT of it while the standfirst settles UNDER it. Both
         are clipped from the horizon outwards, so the line is visibly the
         thing they came from. Not scrubbed — it plays once, on arrival, while
         the stage is still travelling up to its stuck position. */
      gsap.to(horizon, {
        clipPath: CLIP_OPEN,
        duration: 1.25,
        ease: "expo.out",
        scrollTrigger: { trigger: section, start: "top 68%", once: true },
      });

      /* THE CLIP IS RELEASED, NOT LANDED ON. `inset(0 0 0 0)` is still a clip:
         it trims to the BORDER BOX, and a display serif set at 1.06 puts its
         descenders outside that box — so a heading that merely animates to
         zero inset ends up with the tail of every g and y sheared off along
         the very line it is supposed to be standing on. It is handed back an
         unclipped box the moment the gesture is finished. */
      const opening = q("[data-rise], [data-settle]");
      gsap.to(opening, {
        clipPath: CLIP_OPEN,
        y: 0,
        duration: 1.15,
        ease: "expo.out",
        stagger: 0.12,
        delay: 0.18,
        onComplete: () => gsap.set(opening, { clipPath: "none" }),
        scrollTrigger: { trigger: section, start: "top 68%", once: true },
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          /* A long scrub. The pen lags the wheel by a beat and eases to rest
             whenever scrolling stops, which is most of what reads as a hand
             ruling a line rather than a slider being dragged. */
          scrub: 1.1,
          invalidateOnRefresh: true,
          // Promoted for the range the rulings actually run in, and no longer.
          onToggle: (self) => {
            section.dataset.ruling = self.isActive ? "on" : "off";
          },
          onUpdate: (self) => {
            const at = self.progress * UNITS;
            const step = HOLD + WIPE;
            let current = Math.min(COUNT - 1, Math.floor(at / step));
            if (at - current * step > HOLD + WIPE * HANDOVER) {
              current = Math.min(COUNT - 1, current + 1);
            }
            // React bails out on an unchanged value, so this costs a
            // comparison a frame.
            setHeld(current);
          },
        },
      });

      /* The timeline has to be exactly UNITS long whatever the tweens on it
         happen to add up to, or the scrub would map the section's scroll onto
         the wrong range. One tween, spanning the whole of it, does that and
         nothing else. */
      timeline.to({}, { duration: UNITS }, 0);

      for (let i = 0; i < COUNT - 1; i += 1) {
        const from = slides[i]!;
        const to = slides[i + 1]!;
        const at = wipeAt(i);

        const fromBody = from.querySelector(`.${styles.body}`);
        const toBody = to.querySelector(`.${styles.body}`);

        timeline
          /* (1) THE TWO SIDES OF ONE EDGE. Same duration, same ease, same
             start — so the two insets are evaluated at the same ratio and
             resolve to the same pixel. The frame is never uncovered and never
             double-covered, at any point in the ruling. `power2.inOut` rather
             than linear: the pen picks up off the left edge and lays down
             against the right one, which is how a hand crosses a page. */
          .fromTo(
            from,
            { clipPath: CLIP_OPEN },
            {
              clipPath: CLIP_GONE,
              duration: WIPE,
              ease: "power2.inOut",
              immediateRender: false,
            },
            at,
          )
          .fromTo(
            to,
            { clipPath: CLIP_AHEAD },
            {
              clipPath: CLIP_OPEN,
              duration: WIPE,
              ease: "power2.inOut",
              immediateRender: false,
            },
            at,
          )

          /* (2) THE PEN, on exactly that edge and on exactly that ease. It
             fades up off the left margin and away into the right one, so the
             mark exists only while it is ruling. */
          .fromTo(
            nib,
            { xPercent: 0 },
            {
              xPercent: 100,
              duration: WIPE,
              ease: "power2.inOut",
              immediateRender: false,
            },
            at,
          )
          .fromTo(
            nib,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: WIPE * 0.1,
              ease: "sine.out",
              immediateRender: false,
            },
            at,
          )
          .to(
            nib,
            { autoAlpha: 0, duration: WIPE * 0.12, ease: "sine.in" },
            at + WIPE * 0.88,
          )

          /* (3) THE OUTGOING COMPOSITION, being overtaken. It drifts left at a
             fraction of the pen's rate and racks out of focus as it goes, so
             it is LEAVING rather than merely being cut off at an edge. The
             blur is bounded and lives on one element per slide. */
          .fromTo(
            fromBody,
            { xPercent: 0, filter: "blur(0px)" },
            {
              xPercent: -2.4,
              filter: "blur(5px)",
              duration: WIPE * 0.92,
              ease: "sine.in",
              immediateRender: false,
            },
            at,
          )

          /* (4) THE INCOMING COMPOSITION. A larger offset, a harder settle,
             and a quarter longer than the ruling itself to come to rest — so
             it is still arriving a beat after the pen has left the frame.
             That lag, more than any single tween here, is what separates a
             change of slide from a panel sliding past. */
          .fromTo(
            toBody,
            { xPercent: 4.2, filter: "blur(0px)" },
            {
              xPercent: 0,
              filter: "blur(0px)",
              duration: WIPE * 1.25,
              ease: "expo.out",
              immediateRender: false,
            },
            at,
          );

        /* (5) THE PHOTOGRAPHS ease off a small push, over longer again. Off
           the chain because two of the five slides are type and drawings
           alone, and every position above is absolute, so adding them last
           still lands them on the units they belong to. */
        const plates = to.querySelectorAll(`.${styles.plateImage}`);
        if (plates.length) {
          timeline.fromTo(
            plates,
            { scale: 1.07 },
            {
              scale: 1,
              duration: WIPE * 1.45,
              ease: "expo.out",
              immediateRender: false,
            },
            at,
          );
        }

        /* (6) THE DRAWINGS ARE INKED AS THE PEN REACHES THEM. The four stand
           across the right two thirds of the fourth composition, so each one
           starts drawing at the fraction of the ruling at which the nib
           actually arrives at its column — derived from where the four stand
           in the field, not guessed — and each is finished about four tenths
           of a wipe later, so the last is still being drawn a beat into the
           hold. Every stroked path carries
           `pathLength={1}`, so one unit is one whole outline and nothing here
           is ever measured. */
        to.querySelectorAll<HTMLElement>(`.${styles.drawing}`).forEach(
          (drawing, k) => {
            timeline.fromTo(
              drawing.querySelectorAll("path"),
              { strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration: WIPE * 0.4,
                ease: "power1.inOut",
                stagger: WIPE * 0.028,
                immediateRender: false,
              },
              at + WIPE * (0.4 + k * 0.112),
            );
          },
        );
      }

      /* The index moves the SCROLL, because the scroll is what the slideshow
         is made of. The middle of a hold is the one place in a slide's range
         where nothing at all is moving. */
      const st = timeline.scrollTrigger;
      scroller.current = (i: number) => {
        if (!st) return;
        const target = (holdAt(i) + HOLD / 2) / UNITS;
        window.scrollTo({
          top: st.start + (st.end - st.start) * target,
          behavior: "smooth",
        });
      };

      return () => {
        scroller.current = null;
        setStacked(false);
        setHeld(0);
        timeline.scrollTrigger?.kill();
      };
    });

    /* ---- Narrow: five blocks, and the page scrolls them ----------------- */
    mm.add(STANDING_QUERY, () => {
      const q = gsap.utils.selector(section);

      q("[data-reveal]").forEach((body) => {
        revealOnEnter(body, body, { start: "top 82%" });
      });

      /* The frames are cut in from their foot, as every photograph on the
         site is, and the drawings are inked when the practices are reached. */
      q(`.${styles.plate}`).forEach((plate) => {
        gsap.to(plate, {
          clipPath: CLIP_OPEN,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: plate, start: "top 85%", once: true },
        });
      });

      const practices = q(`.${styles.practices}`)[0];
      if (practices) {
        gsap.to(practices.querySelectorAll(`.${styles.drawing} path`), {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power1.inOut",
          stagger: 0.05,
          scrollTrigger: { trigger: practices, start: "top 78%", once: true },
        });
      }
    });

    return () => mm.revert();
  }, []);

  const { community, environment } = content;
  const [yard, court] = community.school.images;

  return (
    <section
      ref={root}
      id="responsibility"
      className={`on-cream ${styles.section}`}
      aria-labelledby="responsibility-title"
      style={{ "--span": SPAN } as React.CSSProperties}
    >
      <div className={styles.stage}>
        <div className={styles.frame}>
          {/* THE GROUND. Drawn once, ruled open on arrival, and then held
              perfectly still for the whole section — under the slides, so a
              photograph standing on it occludes it and genuinely reads as
              standing ON something. */}
          <span className={styles.horizon} aria-hidden="true" />

          {/* ------------------------------------------- 1 · the ledger */}
          <Slide index={0} held={held} stacked={stacked} onMount={holdSlide}>
            <div className={clsx(styles.body, styles.ledger)} data-reveal="up">
              <h2
                id="responsibility-title"
                className={`u-h1 ${styles.headline}`}
                data-rise
              >
                <Swash heading={content.heading} />
              </h2>
              <p className={styles.standfirst} data-settle>
                {content.standfirst}
              </p>
            </div>
          </Slide>

          {/* ------------------------------------------- 2 · the school */}
          <Slide index={1} held={held} stacked={stacked} onMount={holdSlide}>
            <div className={clsx(styles.body, styles.school)} data-reveal="up">
              <Rubric label={community.label} />
              <Plate image={yard} className={styles.yard} />
              <h3 className={styles.name}>{community.school.name}</h3>
              <div className={styles.entry}>
                <p className={styles.place}>{community.school.place}</p>
                <p className={styles.note}>{community.school.note}</p>
              </div>
            </div>
          </Slide>

          {/* ------------------------------------ 3 · the earlier school */}
          <Slide index={2} held={held} stacked={stacked} onMount={holdSlide}>
            <div className={clsx(styles.body, styles.earlier)} data-reveal="up">
              <Rubric label={community.label} />
              <Plate image={court} className={styles.court} />
              <h3 className={styles.name}>{community.also.name}</h3>
              <div className={styles.entry}>
                <p className={styles.place}>{community.also.place}</p>
                <p className={styles.note}>{community.also.note}</p>
              </div>
            </div>
          </Slide>

          {/* ------------------------------------------- 4 · the ground */}
          <Slide index={3} held={held} stacked={stacked} onMount={holdSlide}>
            <div className={clsx(styles.body, styles.ground)} data-reveal="up">
              <Rubric label={environment.label} />
              <p className={styles.standard}>{environment.lead}</p>

              {/* Four practices, each drawn standing on the section's own
                  horizon and named underneath it. The line is their rule —
                  which is why not one of them carries a border of its own. */}
              <ul className={styles.practices}>
                {environment.commitments.map((commitment) => (
                  <li key={commitment.title} className={styles.practice}>
                    <span className={styles.drawing} aria-hidden="true">
                      <ResponsibilityIcons name={commitment.icon} />
                    </span>
                    <h3 className={styles.practiceTitle}>{commitment.title}</h3>
                    <p className={styles.practiceDetail}>{commitment.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Slide>

          {/* ------------------------------------------ 5 · in closing */}
          <Slide index={4} held={held} stacked={stacked} onMount={holdSlide}>
            <div className={clsx(styles.body, styles.closing)} data-reveal="up">
              <p className={styles.coda}>{content.coda}</p>
              <PageLink
                className={styles.onward}
                href="/sustainability"
                label="Both ledgers, in full"
              />
            </div>
          </Slide>

          {/* THE PEN. Full frame height, so the mark it carries at its left
              edge is the whole join between the two compositions either side
              of it. Not rendered in the standing layout, where there is no
              line to rule. */}
          <span className={styles.nib} aria-hidden="true">
            <span className={styles.stake} />
          </span>
        </div>

        {/* ---- The index -------------------------------------------------
            Five names and one travelling rule. NOT the team section's survey
            line: no track, no stops, no fill — the only mark is the rule under
            the live name, and it is measured off that name and moves to the
            next one, which is the nib's own gesture one register quieter. */}
        <nav ref={index} className={styles.index} aria-label="Responsibility slides">
          <span className={styles.indexRule} aria-hidden="true" />
          <ul className={styles.indexList}>
            {SLIDES.map((slide, i) => (
              <li key={slide.id}>
                <button
                  type="button"
                  data-slide={i}
                  className={styles.indexButton}
                  aria-current={i === held ? "true" : undefined}
                  onClick={() => goTo(i)}
                >
                  {slide.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/**
 * One composition's box, and the only element the ruling clips.
 *
 * ASCENDING z-index, so the stack order is the reading order: the incoming
 * slide is always the one on top, and the pair being divided by the pen can
 * never resolve the wrong way round at the edge. Harmless in the standing
 * layout, where nothing overlaps anything.
 *
 * `inert` ONLY in the stacked layout, and only off the slide being held: four
 * clipped slides lying over each other are four slides a keyboard must not be
 * able to tab into. In the standing layout every one of them is a real block
 * on the page and none may be made unreachable.
 */
function Slide({
  index,
  held,
  stacked,
  onMount,
  children,
}: {
  index: number;
  held: number;
  stacked: boolean;
  onMount: (index: number, el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={(el) => {
        onMount(index, el);
      }}
      className={styles.slide}
      style={{ zIndex: index + 1 }}
      role="group"
      aria-label={SLIDES[index]!.label}
      inert={stacked && index !== held}
    >
      {children}
    </div>
  );
}

/** The band's name, set into a rose rule that runs out to the field's far
 *  edge — the section's own rubric, kept from the ruled version of it. */
function Rubric({ label }: { label: string }) {
  return (
    <p className={styles.rubric}>
      <span className={`u-label ${styles.rubricLabel}`}>{label}</span>
      <span className={styles.rubricRule} aria-hidden="true" />
    </p>
  );
}

/**
 * A photograph, standing on the horizon with its caption written underneath.
 *
 * The figure straddles the line: it spans both of the slide's rows and
 * restates the slide's own row template, so the picture's foot lands on the
 * ground line to the pixel without either measurement being written twice as
 * a number. The caption is a real `<figcaption>` inside a real `<figure>`,
 * which is the whole reason the straddle exists rather than two elements in
 * two rows.
 */
function Plate({ image, className }: { image: ImageAsset; className?: string }) {
  return (
    <figure className={clsx(styles.figure, className)}>
      <span className={styles.plate}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 63.99rem) 92vw, 56vw"
          quality={82}
          className={styles.plateImage}
        />
      </span>
      {image.caption ? (
        <figcaption className={styles.caption}>{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}

export default Responsibility;
