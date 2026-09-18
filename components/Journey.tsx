"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import type { HeroContent } from "@/lib/content";
import { ScrollTrigger, gsap, useGsapScope } from "@/lib/motion";
import { LogoMark } from "./Logo";
import ScenePin from "./ScenePin";
import styles from "./Journey.module.css";

/**
 * The opening — the brand line, and then the photograph on its own.
 *
 * ONE continuous photograph carries the whole section: a tall frame that
 * travels from its top edge to its bottom edge, so the visitor descends
 * through one uninterrupted image rather than watching one picture cut to
 * another. Nothing tiles and nothing repeats — the file has to carry the
 * full descent in a single frame.
 *
 * The lower half of the section used to be a second panel of copy, "The
 * Vakratunda Impact" over five figures staked out on the frame. It has been
 * taken out, and with it the veil that was holding those figures legible.
 * What is left is the picture itself and the pins glued to it, which is why
 * the frame below the hero is now unwashed: nothing is set over it that
 * needs protecting. The figures themselves are not lost — the same five
 * proofs are drawn as the legacy discs in the story section — and the copy
 * is still in the model at `siteContent.immersive` for whoever wants it
 * back, simply no longer rendered here.
 *
 * THE HERO IS A LOCKUP, NOT A STACK OF COPY. The brand line is set as one
 * drawn object at the centre of the frame: the two roman halves in oversized
 * caps, and the swash word nested BETWEEN them — bigger than either, in the
 * rose, thrown a few percent off the vertical axis so the block reads as
 * drawn rather than typed. Top to bottom it is still exactly the guide's
 * line, "Where dreams find an address" (CP_Final p.1), and it is still one
 * <h1>. The three parts come straight off the SwashHeading model: `before`
 * is the upper line, `swash` is the nested word, `after` is the lower line —
 * so the composition is content, not markup.
 *
 * Everything else in the frame is furniture pushed to its edges, so the
 * lockup owns the middle:
 *
 *   · the credentials run along the foot of the frame as one band, split
 *     left and right around a drawn hairline — never as an eyebrow above the
 *     headline, which is what the note on `meta` in the model is protecting;
 *   · the scroll invitation is a rail on the left edge — hairline, dripping
 *     light, label set vertical — instead of a cue under the middle of the
 *     composition, which is where the lockup now is.
 *
 * The photograph is the ground rather than a texture behind a wash: the
 * scrim no longer floods the centre of the frame, it protects only the two
 * bands the small type actually sits in (the masthead above, the credentials
 * below) and closes to a vignette at the corners.
 *
 * The section is five viewports tall and holds one 100svh `position: sticky`
 * frame. Sticky rather than a ScrollTrigger pin: no pin-spacer, no layout
 * jump, and the frame still holds if the script never loads. Two panels sit
 * inside that frame, stacked, and the scroll hands over from one to the
 * other. The animations are the ones each half already had:
 *
 *   1. HERO ENTRANCE, on load. The offer has to be legible in the first
 *      second, so the lockup, the credentials and the CTA arrive the moment
 *      the page settles — not held hostage to a scroll the visitor has not
 *      made yet. The two roman lines rise out of their own clip a beat
 *      apart, and the swash word resolves out of a blur behind them, later
 *      and slower, because it is the word the line turns on.
 *
 *   2. HERO DEPARTURE, on scroll, over the first viewport. The hero panel
 *      rides up and out, uncovering the photograph; only the photograph
 *      stays, which is what makes the two halves read as one place rather
 *      than two. Everything leaves at a different rate: the
 *      photograph drifts (it is already travelling), the two watermark petals
 *      counter-drift, the copy lifts faster than the panel carrying it and
 *      dissolves, the headline grows very slightly as if the camera were
 *      pushing in. That rate difference is the whole depth effect.
 *
 *   3. THE PINS come up as the hero clears, once, and then never animate
 *      again — from there the only thing moving them is the photograph they
 *      are pinned to. They are the whole content of the lower frame now, and
 *      they are glued to the picture rather than staked out on the frame:
 *      see the pin layer in the markup below, and ScenePin.
 *
 *      They stay clickable through Concept's overlap, which is three
 *      viewports of transparent box laid over the bottom of this section.
 *      That is paid for in Concept.module.css, not here — see the
 *      pointer-events note on `.reveal` there.
 *
 * All of it is skipped wholesale under prefers-reduced-motion via
 * useGsapScope. Without motion — or without JS — the sticky frame and the
 * `.motion-on` overrides in the stylesheet never apply, and the two panels
 * render as two ordinary full-height blocks over the same photograph.
 */

/**
 * How many viewports tall the continuous backdrop is rendered. The travel
 * distance is derived from it, so the two can never drift apart.
 *
 * It is also the crop: the frame is laid out at 100vw x SPAN viewports and
 * covered, so the taller it is rendered the more of the photograph's width is
 * thrown away at the sides. Two viewports is what the shipped opening frame
 * (2880 x 3240) asks for — at a 16:9 window the box and the picture are the
 * same shape and nothing is cropped at all, and at 16:10 it loses a tenth of
 * its width rather than the better part of a third. Raising this only pays
 * for itself with a much taller original.
 */
const BACKDROP_SPAN = 2;

/** Fraction of its own height the backdrop moves to show its whole length. */
const BACKDROP_TRAVEL = -(1 - 1 / BACKDROP_SPAN) * 100;

/**
 * Viewports of scroll the photograph takes to descend its full length.
 *
 * This is every viewport the section is actually LOOKED at: the frame is held
 * for four, but the story section's dome starts closing over it at three (its
 * overlap — see Concept.module.css), and anything after that happens behind
 * cream. So the picture finishes exactly as the section is handed on, and not
 * a viewport before: the reveal is the section.
 *
 * One viewport of travel over three of scroll — a third of scroll speed,
 * which is slow enough to read as a descent rather than a pan. The picture
 * still passes its whole length: the frame is BACKDROP_SPAN viewports tall
 * and the travel is what is left over after the one that is on screen.
 */
const BACKDROP_DESCENT = 3;

/** The camera push-in the hero departure ends on. The tour reads it too. */
const PUSH_SCALE = 1.06;

/**
 * THE TRACKING SHOT, for frames too narrow to hold every pin at once.
 *
 * The photograph is laid out BACKDROP_SPAN viewports tall and covered, so on
 * a portrait window it is painted several windows wide and the crop throws
 * away its sides — on a 390px phone only the middle quarter is on screen, and
 * five of the six pins are standing on subjects nobody can see.
 *
 * So when the pins do not fit, the camera travels across the terrace as well
 * as down it: on the hero's way out it turns toward the leftmost pins, holds
 * there while the terrace arrives, and then tracks right until the last pin
 * is in frame — just before the story dome starts closing over the foot of
 * the picture. Every figure below is in viewports of scroll.
 *
 * Nothing about it is authored per device. Whether the tour runs, and how far
 * it travels, are measured from the frame and the pins' own coordinates, so
 * a desktop window that already holds every pin gets no pan at all and a
 * tablet gets a short drift.
 */
/** The descent is quicker on a tour: the terrace has to arrive in time for it. */
const TOUR_DESCENT = 1.6;
/** Where the sweep from the leftmost pins to the rightmost starts and ends. */
const TOUR_SWEEP_FROM = 1.6;
const TOUR_SWEEP_TO = 2.7;
/** How far inside the window an edge pin is brought, in px. */
const PIN_MARGIN = 48;

type Props = {
  hero: HeroContent;
};

export function Journey({ hero }: Props) {
  const root = useRef<HTMLElement | null>(null);
  const pinFrame = useRef<HTMLDivElement | null>(null);

  /**
   * Size the pin layer to the photograph's PAINTED rectangle.
   *
   * The image is `object-fit: cover`, so at most window shapes it is larger
   * than the box it is drawn into and the overflow is cropped away evenly on
   * both sides. A pin placed at 39.6% of that BOX would therefore sit at some
   * other percentage of the PICTURE, and would slide across it as the window
   * changed shape. Measuring the cover rectangle and laying the pins out over
   * that instead is what makes a coordinate mean one fixed point on the
   * photograph at every size.
   *
   * `clientWidth`/`clientHeight` are layout values, so the camera push-in on
   * the parent never feeds back into this measurement; the pins are inside
   * that transform and are scaled by it along with the picture, which is
   * exactly what keeps them on their subjects.
   *
   * Outside useGsapScope on purpose: this is layout, not motion, and it has
   * to run for reduced-motion visitors too.
   */
  useEffect(() => {
    const frame = pinFrame.current;
    const box = frame?.parentElement;
    if (!frame || !box) return;

    const ratio = hero.background.width / hero.background.height;

    const measure = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      if (!width || !height) return;
      frame.style.width = `${Math.max(width, height * ratio)}px`;
      frame.style.height = `${Math.max(height, width / ratio)}px`;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [hero.background.width, hero.background.height]);

  /**
   * The credentials band is split around its own middle, so the two clusters
   * hang off the left and right edges of the frame with the hairline drawn
   * between them. Derived rather than authored: the band composes itself for
   * however many credentials the CMS carries, and still reads at one.
   */
  const split = Math.ceil(hero.meta.length / 2);
  const metaLead = hero.meta.slice(0, split);
  const metaTrail = hero.meta.slice(split);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;

    /**
     * Phase boundaries are measured in viewports, not in percentages of the
     * section: the section's height changes at the phone breakpoint, and a
     * percentage would quietly move the hand-over with it. Function values
     * are re-read on every ScrollTrigger.refresh(), so they survive a resize.
     */
    const vh = () => window.innerHeight;

    // ---- The camera's reach across the picture ---------------------------
    // Where the travel stacks have to sit, sideways, to bring the leftmost
    // and the rightmost pins inside the window. Measured from the frame on
    // every call, so it follows a resize or a rotation through the refresh.
    const frame = section.querySelector<HTMLElement>(`.${styles.viewport}`);
    const ratio = hero.background.width / hero.background.height;
    const pinXs = hero.pins.map((pin) => pin.x / 100);

    const camera = () => {
      const width = frame?.clientWidth ?? window.innerWidth;
      const height = frame?.clientHeight ?? vh();
      const painted = Math.max(width, height * BACKDROP_SPAN * ratio);
      // How far the picture can move before one of its edges shows.
      const reach = Math.max(0, (painted * PUSH_SCALE - width) / 2);
      if (!pinXs.length || reach === 0) return { from: 0, to: 0, tour: false };

      const clamp = gsap.utils.clamp(-reach, reach);
      const from = clamp(
        PIN_MARGIN - width / 2 + PUSH_SCALE * (0.5 - Math.min(...pinXs)) * painted,
      );
      const to = clamp(
        width / 2 - PIN_MARGIN - PUSH_SCALE * (Math.max(...pinXs) - 0.5) * painted,
      );
      // Every pin fits in one frame: no tour, just the smallest correction
      // (almost always none) that keeps them all inside it.
      if (to >= from) {
        const x = gsap.utils.clamp(from, to, 0);
        return { from: x, to: x, tour: false };
      }
      return { from, to, tour: true };
    };

    // ---- The continuous backdrop -----------------------------------------
    // One tween across everything the section is looked at: top edge of the
    // photograph at the top of the scroll, bottom edge reached just as the
    // story dome starts closing over it. See BACKDROP_DESCENT — and
    // TOUR_DESCENT, which a narrow frame uses instead.
    gsap.to(`.${styles.travel}`, {
      yPercent: BACKDROP_TRAVEL,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () =>
          `+=${vh() * (camera().tour ? TOUR_DESCENT : BACKDROP_DESCENT)}`,
        scrub: true,
      },
    });

    // ---- The tracking shot -------------------------------------------------
    // Sideways, on the same two stacks. The timeline is TOUR_SWEEP_TO long
    // and scrubbed over that many viewports, so its positions ARE viewports.
    // Where no tour is needed both ends resolve to the same place and this
    // does nothing. See TOUR_DESCENT.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${vh() * TOUR_SWEEP_TO}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      // As the hero leaves, the camera turns toward the leftmost pins.
      .fromTo(
        `.${styles.travel}`,
        { x: 0 },
        { x: () => camera().from, duration: 1, ease: "sine.inOut" },
        0,
      )
      // It holds while the terrace arrives, then tracks across it.
      .fromTo(
        `.${styles.travel}`,
        { x: () => camera().from },
        {
          x: () => camera().to,
          duration: TOUR_SWEEP_TO - TOUR_SWEEP_FROM,
          ease: "sine.inOut",
          immediateRender: false,
        },
        TOUR_SWEEP_FROM,
      );

    // ---- 1. Hero entrance -------------------------------------------------
    // The lockup is the moment. The two roman lines rise out of their own
    // clip a beat apart; the swash word resolves out of a blur across nearly
    // two seconds, arriving last and settling last, because it is the word
    // the whole line turns on. Everything else is furniture and follows it.
    gsap
      .timeline({ defaults: { ease: "expo.out", duration: 1.2 } })
      .to(`.${styles.mark}`, { opacity: 1, y: 0, duration: 1.4 })
      .to(
        `.${styles.lineInner}`,
        { y: 0, duration: 1.5, stagger: 0.14 },
        "-=1.15",
      )
      .to(
        `.${styles.script}`,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.9,
        },
        "-=1.3",
      )
      .to(`.${styles.standfirst}`, { opacity: 1, y: 0 }, "-=1.45")
      .to(`.${styles.cta}`, { opacity: 1, y: 0 }, "-=1.2")
      .to(`.${styles.rule}`, { scaleX: 1, duration: 1.6 }, "-=1.3")
      .to(`.${styles.metaItem}`, { opacity: 1, y: 0, stagger: 0.07 }, "-=1.45")
      .to(`.${styles.rail}`, { opacity: 1, duration: 0.9 }, "-=0.9");

    // ---- 2. Hero departure ------------------------------------------------
    // Exactly one viewport of scroll, whatever the section's total height.
    const departure = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${vh()}`,
        scrub: 0.6,
      },
    });

    departure
      // The panel itself leaves, upward and over the top of the figures —
      // it does not dim away underneath them. Only the photograph stays,
      // which is what makes the two halves read as one place.
      .to(`.${styles.hero}`, { yPercent: -100, ease: "none" }, 0)
      // The camera pushes in on the photograph while it travels.
      .to(`.${styles.push}`, { scale: PUSH_SCALE, ease: "none" }, 0)
      // The two watermark petals counter-drift against each other.
      .to(`.${styles.watermarkTop}`, { yPercent: -22, ease: "none" }, 0)
      .to(`.${styles.watermarkBottom}`, { yPercent: 16, ease: "none" }, 0)
      // The lower petal bleeds past the panel's own edge, so it would still
      // be hanging at the top of the frame after the panel has gone. It goes
      // out with it. (Timeline positions are on the 0–0.5 scale GSAP's
      // default duration gives every tween above; 0.5 is the end.)
      .to(
        `.${styles.watermarks}`,
        { opacity: 0, duration: 0.22, ease: "none" },
        0.28,
      )
      // Copy is nearest, so it leaves fastest and dissolves — it is already
      // riding the panel, and this is the extra distance on top of it. That
      // rate difference is the whole depth effect.
      .to(`.${styles.heroInner}`, { y: -90, opacity: 0.06, ease: "none" }, 0)
      .to(`.${styles.title}`, { scale: 1.07, ease: "none" }, 0)
      // The rail is chrome, not copy: it does not ride .heroInner, so it
      // takes its own exit, early, before the lockup has cleared.
      .to(`.${styles.rail}`, { opacity: 0, ease: "none", duration: 0.25 }, 0)
      // Ground swap: the hero's scrim goes out with it, so its lower edge
      // never draws a line across the frame, and the whole figures panel
      // comes up underneath.
      //
      // The panel is faded here, as one, rather than left to its own entrance
      // tweens below. Those run `once: true` — they are an arrival, not a
      // scroll-tracked effect — so on their own they would leave the figures
      // lit for good, showing through the hero's half-transparent scrim on
      // the way back up. Tying the panel to this scrub makes the hand-over
      // reverse exactly as it played.
      .to(`.${styles.scrim}`, { opacity: 0, ease: "none" }, 0);

    // ---- 3. The lower frame ----------------------------------------------
    // What the hero hands over to is the photograph itself, and the pins on
    // it. The scroll position where that hand-over is complete: the pins come
    // up on it, and it is where the frame stops taking clicks for the hero.
    const IMPACT_IN = 0.88;

    // The pins belong to the picture, not to either panel, so they arrive on
    // the same beat the hero clears and then never animate again — from here
    // the only thing moving them is the photograph they are pinned to.
    gsap.to(`.${styles.pinLayer}`, {
      opacity: 1,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: {
        trigger: section,
        start: () => `top top-=${vh() * IMPACT_IN}`,
        once: true,
      },
    });

    // Both panels occupy the same frame, so only the one being read may take
    // a click. The stylesheet reads this attribute; see "Phase" there.
    const setPhase = (isImpact: boolean) =>
      section.setAttribute("data-phase", isImpact ? "impact" : "hero");

    const phase = ScrollTrigger.create({
      trigger: section,
      start: () => `top top-=${vh() * IMPACT_IN}`,
      end: "bottom bottom",
      onToggle: (self) => setPhase(self.isActive),
    });
    // onToggle does not fire for a trigger that is already active when it is
    // created — a reload part-way down the page would otherwise start in the
    // wrong phase.
    setPhase(phase.isActive);
  }, []);

  return (
    <section
      ref={root}
      className={styles.journey}
      aria-labelledby="hero-title"
      data-phase="hero"
      style={
        {
          "--backdrop-span": BACKDROP_SPAN,
          "--backdrop-ratio": hero.background.width / hero.background.height,
        } as CSSProperties
      }
    >
      <div className={styles.viewport}>
        {/* The one continuous photograph — siteImage("mainheroimage.png"),
            sky at the top where the lockup sits, the terrace and the city at
            the bottom where the figures land. `travel` carries the long
            descent, `push` the hero's camera move, so the two transforms
            never fight. */}
        <div className={styles.backdrop} aria-hidden="true">
          <div className={`${styles.travel} u-parallax`}>
            <div className={styles.push}>
              <Image
                src={hero.background.src}
                alt=""
                fill
                sizes="100vw"
                quality={82}
                // Next 16: `priority` is deprecated. This is the LCP
                // candidate, so it loads eagerly and at high priority.
                loading="eager"
                fetchPriority="high"
                className={styles.backdropImage}
              />
            </div>
          </div>
        </div>

        {/* ---- The pins, glued to the photograph -------------------------- */}
        {/* A SECOND travel/push stack, class-identical to the backdrop's. The
            two tweens above select by class and so drive both of them with
            one set of values on one scrub — which is what makes it impossible
            for the pins to drift from the picture by a pixel, at any scroll
            position or refresh.

            It is a separate layer only because of z-order: the photograph
            sits UNDER both panels, and a pin has to sit over them to be
            clicked. The layer itself is inert; only the pins take a pointer.

            .pinFrame inside it is the photograph's painted rectangle — the
            cover box, measured above — so the coordinates on each pin are
            percentages of the picture rather than of the frame. */}
        <div className={styles.pinLayer}>
          <div className={`${styles.travel} u-parallax`}>
            <div className={styles.push}>
              <div ref={pinFrame} className={styles.pinFrame}>
                {hero.pins.map((pin) => (
                  <ScenePin key={pin.id} data={pin} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Panel one: the brand line ---------------------------------- */}
        <div className={styles.hero}>
          <div className={styles.scrim} aria-hidden="true" />

          {/* The brand guide bleeds the petal mark off two opposite corners
              of the cover (CP_Final p.1). Same device, made to move. */}
          <div className={styles.watermarks} aria-hidden="true">
            <LogoMark className={styles.watermarkTop} size={227} />
            <LogoMark className={styles.watermarkBottom} size={264} />
          </div>

          {/* The scroll invitation, on the left edge of the frame rather than
              under the middle of it — the middle is the lockup now. The label
              is set vertical and reads up out of the hairline it hangs from.
              Below the desktop breakpoint the gutter is too narrow to hold a
              rail, so it lies down under the band instead. */}
          <p className={styles.rail} aria-hidden="true">
            <span className={styles.railTrack}>
              <span className={styles.railFill} />
            </span>
            <span className={styles.railLabel}>{hero.scrollCue}</span>
          </p>

          <div className={styles.heroInner}>
            <div className={styles.lockup}>
              <LogoMark className={styles.mark} size={32} />

              {/* One heading, drawn in three parts: `before` and `after` are
                  the roman lines, `swash` nests between them, larger and in
                  the rose. The whitespace inside those strings is deliberate
                  — it is what keeps the accessible name a sentence. */}
              <h1 id="hero-title" className={styles.title}>
                {hero.heading.before && (
                  <span className={styles.line}>
                    <span className={styles.lineInner}>
                      {hero.heading.before}
                    </span>
                  </span>
                )}

                <em className={styles.script}>{hero.heading.swash}</em>

                {hero.heading.after && (
                  <span className={styles.line}>
                    <span className={styles.lineInner}>
                      {hero.heading.after}
                    </span>
                  </span>
                )}
              </h1>

              <p className={styles.standfirst}>{hero.standfirst}</p>

              <a className={styles.cta} href={hero.primaryCta.href}>
                <span className={styles.ctaLabel}>{hero.primaryCta.label}</span>
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
              </a>
            </div>

            {/* The credentials, along the foot of the frame: the first half
                hung on the left edge, the rest on the right, and the guide's
                hairline drawn between them. */}
            <div className={styles.band}>
              <ul className={styles.meta}>
                {metaLead.map((item) => (
                  <li key={item} className={styles.metaItem}>
                    {item}
                  </li>
                ))}
              </ul>

              <span className={styles.rule} aria-hidden="true" />

              <ul className={`${styles.meta} ${styles.metaTrail}`}>
                {metaTrail.map((item) => (
                  <li key={item} className={styles.metaItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Where #impact lands: past the hero, on the open photograph and the
          pins staked out over it. */}
      <span id="impact" className={styles.anchor} aria-hidden="true" />
    </section>
  );
}

export default Journey;
