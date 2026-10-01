"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import type { HeroContent } from "@/lib/content";
import {
  ScrollTrigger,
  gsap,
  timelineOnEnter,
  useGsapScope,
} from "@/lib/motion";
import { LogoMark } from "./Logo";
import ScenePin, {
  PIN_OPENED,
  PINS_WITHDRAWN,
  closeUpStand,
  placeCloseUpCard,
} from "./ScenePin";
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
 *   3. THE PINS come up as the hero clears, with the hint over them, and go
 *      again if the visitor scrolls back up into the hero — otherwise the
 *      only thing moving them is the photograph they are pinned to. They are
 *      the whole content of the lower frame now, and
 *      they are glued to the picture rather than staked out on the frame:
 *      see the pin layer in the markup below, and ScenePin.
 *
 *      They stay clickable through Concept's overlap, which is three
 *      viewports of transparent box laid over the bottom of this section.
 *      That is paid for in Concept.module.css, not here — see the
 *      pointer-events note on `.reveal` there.
 *
 *   4. ON A PORTRAIT FRAME THERE IS NO SIDEWAYS SHOT. The camera pulls back
 *      instead, until the whole photograph lies across the foot of the
 *      screen with every pin standing on it, and a key to the six is
 *      written in the sky above as the scroll goes on. See THE PLATE below.
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
 * covered, anchored to the photograph's FOOT (see `.backdropImage`). The top
 * half of the shipped file is open sky with nothing in it, and at two
 * viewports the whole first screen was that sky — nothing on it said there
 * was a terrace, a city or a page underneath. At one and a half the picture
 * is cut from the top instead: the frame loses the emptiest sky, the skyline
 * and the edge of the terrace are already standing at the foot of the first
 * screen, and the descent is a third shorter. The pins are laid out against
 * the same foot-anchored rectangle, so they stay on their subjects.
 */
const BACKDROP_SPAN = 1.5;

/** Fraction of its own height the backdrop moves to show its whole length. */
const BACKDROP_TRAVEL = -(1 - 1 / BACKDROP_SPAN) * 100;

/**
 * Viewports of scroll the photograph takes to descend its full length.
 *
 * This is every viewport the section is actually LOOKED at: the frame is held
 * for four, but the story section's dome starts closing over it at two (it is
 * pulled back three viewports over a five-viewport section — see
 * Concept.module.css), and anything after that happens behind cream. So the
 * picture finishes exactly as the section is handed on.
 */
const BACKDROP_DESCENT = 2;

/** The camera push-in the hero departure ends on. The tour and the plate
 *  read it too. */
const PUSH_SCALE = 1.06;

/**
 * THE TRACKING SHOT, for frames too narrow to hold every pin at once.
 *
 * The photograph is laid out BACKDROP_SPAN viewports tall and covered, so on
 * a narrow window it is painted wider than the window and the crop throws
 * away its sides, with whichever pins stand on them.
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
 * window only just wider than it is tall gets a short drift. A PORTRAIT frame
 * never gets it — there the camera pulls back instead. See THE PLATE.
 */
/** The descent is quicker on a tour: the terrace has to arrive in time for it. */
const TOUR_DESCENT = 1.2;
/** Where the sweep from the leftmost pins to the rightmost starts and ends —
 *  finished just before the dome starts closing, at two viewports. */
const TOUR_SWEEP_FROM = 1.15;
const TOUR_SWEEP_TO = 1.95;
/** How far inside the window an edge pin is brought, in px. */
const PIN_MARGIN = 48;

/**
 * THE PLATE, for portrait frames — every phone held upright, and a tablet.
 *
 * A portrait window holds about a quarter of the terrace, so the tracking
 * shot had to drag the picture sideways past it, and the pins with it: small
 * targets sliding under the thumb, two or three on the glass at a time, the
 * ones at its edges half off it. No amount of steering fixes that. The crop
 * is the trouble, so a portrait frame stops cropping.
 *
 * THE PULL-BACK. As the hero leaves, the camera draws straight back — down
 * and out, never sideways — until the terrace spans the window with every pin
 * on it, PLATE_MARGIN inside the glass, standing on the window's foot. Its sky
 * dissolves upward into the section's navy (`.backdrop .push` carries the
 * mask), so the picture never shows a top edge: the terrace and the lit city
 * lie across the foot of the screen with the evening over them, every pin
 * standing on it at once and none of them moving. The zoom is even (see
 * `even` below): the scale changes by the same ratio for every pixel of
 * scroll, which is what a camera move looks like.
 *
 * THE KEY. In the sky above the terrace, the six are listed the way a drawing
 * keys its marks — a numeral and a title on a hairline each — and the scroll
 * that used to carry the tracking shot writes them out, one line at a time
 * (KEY_FROM to KEY_TO). As each line is written its pin answers with a single
 * ring, so the key teaches which pin is which without a press. Each line is
 * the way into its pin, as the pin is.
 *
 * THE CARD is opened by a press on a pin or a line of the key, and stands up
 * out of the pin into the sky, over the key: leader, unfold, copy, the three
 * beats a card always opens in. ‹ and ›, a sideways swipe or the arrow keys
 * move it to the neighbouring pin; scrolling on, a tap on the photograph, ×
 * or Escape fold it away. Nothing moves to make room for it, except on a
 * phone too short for the card above its pin: there the picture dips just as
 * far as it has to (closeUpStand, read off the card) and rises again after.
 *
 * It costs the scroll nothing — the section is exactly as long as on any
 * other frame, and nothing settles or snaps.
 */
const PORTRAIT_QUERY = "(max-aspect-ratio: 1/1)";
/** Every other frame keeps the camera above, exactly as it was. */
const LANDSCAPE_QUERY = "(min-aspect-ratio: 1001/1000)";
/** Viewports of scroll the pull-back takes: the hero's own departure. */
const PLATE_SETTLE = 1;
/** How far inside the window the outermost pins stand once it has drawn
 *  back, in px from their centres. The camera stops there rather than at the
 *  photograph's own edges: the picture is a sixth larger, and nothing that
 *  is cropped has a pin on it. */
const PLATE_MARGIN = 30;
/** The most it will close in on the pins, against the whole photograph — so
 *  pins that stood close together could never zoom a picture past its
 *  resolution. */
const PLATE_ZOOM_MAX = 1.5;
/** Its lag behind the thumb — the departure's, so the two move as one. */
const PLATE_SCRUB = 0.6;
/** Where the key's first line is written, and its last, in viewports. All
 *  six are down before the story dome starts to rise at two. */
const KEY_FROM = 1;
const KEY_TO = 1.8;
/** The least air kept under a pin whose card it has to make room for, in px
 *  from its centre to the foot of the frame. */
const CLOSE_UP_FOOT = 40;
/** That dip, and the rise back, in seconds. */
const CLOSE_UP_GLIDE = 0.9;
/** How far into the dip the card starts to draw: as the picture settles. */
const CLOSE_UP_DRAW = 0.6;
/** Scroll that counts as going on, in px — more than a thumb's tremor. */
const CLOSE_UP_RELEASE = 40;
/** A sideways swipe that turns to the next pin, in px. */
const CLOSE_UP_SWIPE = 44;

type Props = {
  hero: HeroContent;
};

export function Journey({ hero }: Props) {
  const root = useRef<HTMLElement | null>(null);
  const pinFrame = useRef<HTMLDivElement | null>(null);

  /* ---- The plate ---------------------------------------------------------- */
  const count = hero.pins.length;
  /** True while the plate is built — a portrait frame, with motion. */
  const [guided, setGuided] = useState(false);
  /** The pin whose card is up, or -1. */
  const [shown, setShown] = useState(-1);
  /** Its card is drawn — once the picture is still under it. */
  const [drawn, setDrawn] = useState(false);
  /** `shown`, for the handlers below, which run outside render. */
  const shownRef = useRef(-1);
  /** Set by the plate's setup: makes room for a pin's card (or gives the room
   *  back, on `null`) and calls back once the picture is still. */
  const room = useRef<
    ((index: number | null, onSettle?: () => void) => void) | null
  >(null);
  /** The pager control a keyboard was on when its card folded. */
  const refocus = useRef<string | null>(null);

  const openAt = useCallback((index: number) => {
    const make = room.current;
    const section = root.current;
    if (!make || !section) return;

    const begin = () => {
      shownRef.current = index;
      setShown(index);
      setDrawn(false);
      make(index, () => setDrawn(true));
      window.dispatchEvent(new CustomEvent(PIN_OPENED));
    };

    // Once the story dome has started rising over the foot of the frame, the
    // pin's card would open under the cream. Step back to the edge of the
    // dome first, and open there.
    const edge =
      section.offsetTop + window.innerHeight * (BACKDROP_DESCENT - 0.05);
    if (window.scrollY > edge + 2) {
      window.scrollTo({ top: edge, behavior: "smooth" });
      window.setTimeout(begin, 480);
    } else {
      begin();
    }
  }, []);

  const close = useCallback(() => {
    if (shownRef.current === -1) return;
    shownRef.current = -1;
    setShown(-1);
    setDrawn(false);
    room.current?.(null);
  }, []);

  /** The next pin, or the one before: the pager, a swipe, an arrow key. */
  const step = useCallback(
    (by: number) => {
      const from = shownRef.current;
      if (from === -1) return;
      const to = Math.max(0, Math.min(count - 1, from + by));
      if (to === from) return;
      const active = document.activeElement;
      refocus.current =
        active instanceof HTMLElement ? (active.dataset.step ?? null) : null;
      openAt(to);
    },
    [count, openAt],
  );

  /* A press on the pin whose card is up closes it; on any other, opens that
     one's — from the photograph or from the key. */
  const onPinPress = useCallback(
    (index: number) => {
      if (index === shownRef.current) close();
      else openAt(index);
    },
    [close, openAt],
  );

  /* Going on closes it — scrolling past a tremor, or a tap on the open
     photograph. A sideways swipe, or an arrow key, turns to the next pin, and
     Escape closes it with focus handed back to the pin. Bound only while a
     card is up, so the page is exactly as it was the rest of the time. */
  useEffect(() => {
    const section = root.current;
    if (shown === -1 || !section) return;
    const from = window.scrollY;

    const onScroll = () => {
      if (Math.abs(window.scrollY - from) > CLOSE_UP_RELEASE) close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        const node = section.querySelectorAll<HTMLElement>(
          "[data-scene-pin] > button",
        )[shownRef.current];
        close();
        node?.focus({ preventScroll: true });
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
      }
    };

    // A swipe is told from a scroll by its direction; the frame hands the
    // browser vertical panning only (see `.viewport`), so a sideways one
    // arrives here whole instead of being cancelled.
    let press: { id: number; x: number; y: number; open: boolean } | null =
      null;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      press = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        // Nothing to press under it: the photograph itself.
        open: !target?.closest("[data-scene-pin], a, button"),
      };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id) return;
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      const onPhotograph = press.open;
      press = null;
      if (Math.abs(dx) > CLOSE_UP_SWIPE && Math.abs(dx) > Math.abs(dy) * 1.4) {
        step(dx < 0 ? 1 : -1);
      } else if (onPhotograph && Math.hypot(dx, dy) < 10) {
        close();
      }
    };
    const onPointerCancel = () => {
      press = null;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    section.addEventListener("pointerdown", onPointerDown);
    section.addEventListener("pointerup", onPointerUp);
    section.addEventListener("pointercancel", onPointerCancel);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKeyDown);
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("pointerup", onPointerUp);
      section.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [shown, close, step]);

  /* The pager a keyboard was on folds with its card. Hand focus to the same
     control on the card that replaces it, once that one is drawn. */
  useEffect(() => {
    const which = refocus.current;
    if (!drawn || shown === -1 || !which) return;
    refocus.current = null;
    const pin =
      root.current?.querySelectorAll<HTMLElement>("[data-scene-pin]")[shown];
    const same = pin?.querySelector<HTMLButtonElement>(`[data-step="${which}"]`);
    const control =
      same && !same.disabled
        ? same
        : pin?.querySelector<HTMLButtonElement>("[data-step]:not(:disabled)");
    control?.focus({ preventScroll: true });
  }, [drawn, shown]);

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
   * The hint under the pins has done its job the first time any pin is
   * opened, and steps aside for good. State, not motion, so it runs for
   * reduced-motion visitors too.
   */
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const onOpen = () => section.setAttribute("data-explored", "true");
    window.addEventListener(PIN_OPENED, onOpen);
    return () => window.removeEventListener(PIN_OPENED, onOpen);
  }, []);

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

    // The camera is one of two, chosen by the frame's shape and rebuilt
    // whenever that changes: a phone turned on its side gets the tracking
    // shot, and one stood back up gets the plate again. Scoped to the
    // section, like the context around it.
    const mm = gsap.matchMedia(section);

    mm.add(LANDSCAPE_QUERY, () => {
      // ---- The continuous backdrop ---------------------------------------
      // One tween across everything the section is looked at: top edge of
      // the photograph at the top of the scroll, bottom edge reached just as
      // the story dome starts closing over it. See BACKDROP_DESCENT — and
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

      // ---- The tracking shot -----------------------------------------------
      // Sideways, on the same two stacks. The timeline is TOUR_SWEEP_TO long
      // and scrubbed over that many viewports, so its positions ARE
      // viewports. Where no tour is needed both ends resolve to the same
      // place and this does nothing. See TOUR_DESCENT.
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
    });

    mm.add(PORTRAIT_QUERY, () => {
      const travels = gsap.utils.toArray<HTMLElement>(`.${styles.travel}`, section);
      const travel = travels[0];
      const push = section.querySelector<HTMLElement>(`.${styles.push}`);
      const pinLayer = section.querySelector<HTMLElement>(`.${styles.pinLayer}`);
      const layers = gsap.utils.toArray<HTMLElement>(
        `.${styles.backdrop}, .${styles.pinLayer}`,
        section,
      );
      const pins = gsap.utils.toArray<HTMLElement>("[data-scene-pin]", section);
      const lines = gsap.utils.toArray<HTMLElement>(`.${styles.keyItem}`, section);
      if (!frame || !travel || !push || !pinLayer) return;

      section.dataset.guided = "on";
      setGuided(true);

      // ---- The pull-back ---------------------------------------------------
      // Both travel stacks, with one tween, so a pin can no more slip off its
      // subject here than on any other frame. They scale about their own
      // foot, which is the photograph's, so the picture stays standing on the
      // foot of the window all the way back.
      /** Where the camera comes to rest: the scale that brings the outermost
       *  pins PLATE_MARGIN inside the window — never less than the whole
       *  photograph's width, never more than PLATE_ZOOM_MAX of it — and the
       *  small sideways set that centres the pins between the window's edges.
       *  Laid out, not measured off the screen, so it can be asked at any
       *  point of the scroll and follows a rotation through the refresh. */
      const framing = () => {
        const vw = frame.clientWidth;
        const wide = travel.offsetWidth * PUSH_SCALE;
        const whole = vw / wide;
        if (!pinXs.length) return { scale: whole, x: 0 };
        const lo = Math.min(...pinXs);
        const hi = Math.max(...pinXs);
        const scale = gsap.utils.clamp(
          whole,
          whole * PLATE_ZOOM_MAX,
          (vw - PLATE_MARGIN * 2) / (Math.max(hi - lo, 0.01) * wide),
        );
        const half = (wide * scale) / 2;
        const x = gsap.utils.clamp(
          vw / 2 - half, // the picture's right edge on the window's
          half - vw / 2, // its left edge on the window's
          (0.5 - (lo + hi) / 2) * 2 * half,
        );
        return { scale, x };
      };
      /* An even zoom: the scale changes by the same RATIO for every pixel of
         scroll — s^t — which is how a camera drawing back looks. A linear
         scale would seem to gather speed, each step a bigger share of what is
         left of the picture. Written as an ease so the tween can stay
         function-valued and follow a rotation through the refresh. */
      let ratioLog = Math.log(framing().scale);
      const even = (t: number) => {
        const r = Math.exp(ratioLog);
        return Math.abs(1 - r) < 1e-4 ? t : (1 - Math.pow(r, t)) / (1 - r);
      };

      gsap.set(travels, { transformOrigin: "50% 100%" });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${vh() * PLATE_SETTLE}`,
            scrub: PLATE_SCRUB,
            invalidateOnRefresh: true,
            onRefresh: () => {
              ratioLog = Math.log(framing().scale);
            },
          },
        })
        .fromTo(
          travels,
          { yPercent: 0, scale: 1, x: 0 },
          {
            yPercent: BACKDROP_TRAVEL,
            scale: () => framing().scale,
            x: () => framing().x,
            ease: even,
            duration: 1,
          },
        );

      // ---- The pins, at their own size --------------------------------------
      // They ride the photograph's transforms, which is what keeps them on
      // their subjects — so the pull-back would take them down to a third of
      // their size with it. Each is scaled back up by exactly what the camera
      // has taken off (`--pin-counter`, read by `.pin`), cards and all, and it
      // is only written when it changes.
      let counter = 0;
      const hold = () => {
        const scale =
          (Number(gsap.getProperty(travel, "scale")) || 1) *
          (Number(gsap.getProperty(push, "scale")) || 1);
        const next = Math.round(10000 / scale) / 10000;
        if (next === counter) return;
        counter = next;
        pinLayer.style.setProperty("--pin-counter", String(next));
      };
      gsap.ticker.add(hold);
      hold();

      // ---- The key ---------------------------------------------------------
      // Each line is written as the scroll reaches it: its rule drawn from
      // the left, then its numeral, title and arrow rising out of their own
      // boxes, as the hero's roman lines do. Played rather than scrubbed — a
      // line is written or it is not — and taken back the same way if the
      // visitor scrolls up past it.
      //
      // As a line is written, its pin answers: one ring out of the disc (the
      // stylesheet plays it on `data-called`, and only on the way down), so
      // which pin a line belongs to is learnt by watching, not by pressing.
      const call = (pin: HTMLElement | undefined) => {
        if (!pin) return;
        delete pin.dataset.called;
        // Read layout between the two, so a second call restarts the ring.
        void pin.offsetWidth;
        pin.dataset.called = "";
      };
      const spacing =
        lines.length > 1 ? (KEY_TO - KEY_FROM) / (lines.length - 1) : 0;
      lines.forEach((line, i) => {
        timelineOnEnter(
          {
            trigger: section,
            start: () => `top top-=${vh() * (KEY_FROM + i * spacing)}`,
            toggleActions: "play none none reverse",
            onEnter: () => call(pins[i]),
          },
          (timeline) => {
            timeline
              .fromTo(
                line.querySelectorAll(`.${styles.keyRule}`),
                { scaleX: 0 },
                { scaleX: 1, duration: 1, ease: "expo.out" },
                0,
              )
              .fromTo(
                line.querySelectorAll(`.${styles.keyRise}`),
                { yPercent: 110 },
                { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 },
                0.1,
              );
          },
        );
      });

      // ---- Room for a card -------------------------------------------------
      // A card stands up out of its pin into the sky, so a pin needs the
      // card's height above it. On most phones every pin already has it, and
      // nothing moves. On one too short for that, the picture dips just as
      // far as this pin needs — never further than leaves it clear of the
      // foot — and rises again when the card goes. The dip moves the two
      // outer layers, which nothing else transforms, in window px.
      let dip: gsap.core.Tween | null = null;
      let settle: gsap.core.Tween | null = null;

      room.current = (index, onSettle) => {
        dip?.kill();
        settle?.kill();

        const was = Number(gsap.getProperty(pinLayer, "y")) || 0;
        let y = 0;
        const pin = index === null ? undefined : pins[index];
        const node = pin?.querySelector("button");
        if (pin && node) {
          const at = node.getBoundingClientRect();
          const cx = at.left + at.width / 2;
          // Where the pin stands with no dip at all.
          const cy = at.top + at.height / 2 - was;
          // The card's width first: its height, and so the sky it needs,
          // follow from it. The pins are at their own size (see above), so
          // the card's px are the window's.
          placeCloseUpCard(pin, { x: cx, y: cy }, 1);
          const stand = Math.min(
            closeUpStand(pin, 1),
            frame.clientHeight - CLOSE_UP_FOOT,
          );
          y = Math.max(0, stand - cy);
          placeCloseUpCard(pin, { x: cx, y: cy + y }, 1);
        }

        const moving = Math.abs(y - was) > 1;
        if (moving) {
          dip = gsap.to(layers, {
            y,
            duration: CLOSE_UP_GLIDE,
            ease: "power2.inOut",
          });
        }
        if (onSettle) {
          settle = gsap.delayedCall(
            moving ? CLOSE_UP_GLIDE * CLOSE_UP_DRAW : 0,
            onSettle,
          );
        }
      };

      return () => {
        gsap.ticker.remove(hold);
        dip?.kill();
        settle?.kill();
        gsap.set(layers, { clearProps: "transform" });
        pinLayer.style.removeProperty("--pin-counter");
        pins.forEach((pin) => delete pin.dataset.called);
        room.current = null;
        shownRef.current = -1;
        delete section.dataset.guided;
        setGuided(false);
        setShown(-1);
        setDrawn(false);
      };
    });

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
    // the same beat the hero clears — and withdraw again, with the hint over
    // them, when the visitor scrolls back up into the hero. Played rather
    // than scrubbed: an arrival and a departure, not a scroll-tracked fade.
    // `autoAlpha`, so a withdrawn pin is `visibility: hidden` and can be
    // neither clicked nor tabbed to under the hero. On a portrait frame the
    // key over them comes and goes with them; elsewhere it is not displayed.
    const pinChrome = [
      `.${styles.pinLayer}`,
      `.${styles.pinHint}`,
      `.${styles.key}`,
    ];
    const showPins = () =>
      gsap.to(pinChrome, {
        autoAlpha: 1,
        duration: 1.1,
        ease: "expo.out",
        overwrite: true,
      });
    ScrollTrigger.create({
      trigger: section,
      start: () => `top top-=${vh() * IMPACT_IN}`,
      // Back up from below the section (or a reload that landed past it)
      // arrives from the far end, which is onEnterBack, not onEnter.
      onEnter: showPins,
      onEnterBack: showPins,
      onLeaveBack: () => {
        window.dispatchEvent(new CustomEvent(PINS_WITHDRAWN));
        gsap.to(pinChrome, {
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
        });
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

    return () => mm.revert();
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
                // The frame is BACKDROP_SPAN viewports tall and covered, so on
                // a portrait screen the picture is PAINTED ~134vh wide (1.5 x
                // the 1182/1330 ratio) and the camera pans across it. Asking
                // for 100vw there fetched a fraction of the pixels a phone
                // shows. Landscape windows paint at or near 100vw and keep it.
                sizes="(orientation: portrait) 134vh, 100vw"
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
                {hero.pins.map((pin, index) => (
                  <ScenePin
                    key={pin.id}
                    data={pin}
                    index={index}
                    total={hero.pins.length}
                    guide={
                      guided
                        ? {
                            live: index === shown,
                            open: index === shown && drawn,
                            aside: shown !== -1 && index !== shown,
                            first: index === 0,
                            last: index === count - 1,
                            onPress: onPinPress,
                            onClose: close,
                            onStep: step,
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What the pins are for, said once, in the open sky over them. Under the hero panel in the stacking order, so it is
            covered whenever the hero is on screen; faded in with the pins. */}
        <div className={styles.pinHint}>
          <p className={styles.pinHintInner}>
            <span className={styles.pinHintDot} aria-hidden="true">
              +
            </span>
            {hero.pinHint ?? "Press a + on the photograph to explore"}
          </p>
        </div>

        {/* ---- The key ----------------------------------------------------- */}
        {/* Portrait frames only — see THE PLATE. The six pins, listed in the
            sky over the terrace the way a drawing keys its marks: the hint as
            the key's caption, then a numeral and a title on a hairline for
            each pin, every line the way into its card. Written out one line
            at a time as the scroll goes on, and stood aside while a card is
            up, since the card stands in the same sky.

            Rendered everywhere and displayed only on the plate (the stylesheet
            reads `data-guided`), because the plate's setup has to find its
            lines the moment it is built. Elsewhere it is `display: none`, out
            of the tree and out of the tab order. */}
        <nav className={styles.key} aria-label="The story, pin by pin">
          <div
            className={`${styles.keyInner} ${shown !== -1 ? styles.keyAside : ""}`}
          >
            <p className={styles.keyCaption}>
              <span className={styles.pinHintDot} aria-hidden="true">
                +
              </span>
              {hero.pinHint ?? "Press a + on the photograph to explore"}
            </p>
            <ol className={styles.keyList}>
              {hero.pins.map((pin, index) => (
                <li key={pin.id} className={styles.keyItem}>
                  <span className={styles.keyRule} aria-hidden="true" />
                  <button
                    type="button"
                    className={styles.keyButton}
                    onClick={() => onPinPress(index)}
                  >
                    {/* Each part rises out of a box of its own — inside the
                        button, not on it, so the focus ring is never
                        clipped. */}
                    <span className={styles.keyLine}>
                      <span className={styles.keyMask}>
                        <span
                          className={`u-numeral ${styles.keyNumber} ${styles.keyRise}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </span>
                      <span className={styles.keyMask}>
                        <span className={`${styles.keyTitle} ${styles.keyRise}`}>
                          {pin.title}
                        </span>
                      </span>
                      <span className={styles.keyMask} aria-hidden="true">
                        <svg
                          className={`${styles.keyArrow} ${styles.keyRise}`}
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </span>
                  </button>
                  {/* The key is closed by a rule of its own, drawn with
                      the last line. */}
                  {index === hero.pins.length - 1 && (
                    <span
                      className={`${styles.keyRule} ${styles.keyRuleEnd}`}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

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
