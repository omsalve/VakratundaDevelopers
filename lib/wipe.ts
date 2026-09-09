"use client";

/**
 * The wipe sequence — the page's way of showing one frame out of several, and
 * the one implementation of it.
 *
 * The site shows a set of photographs in exactly two places: the showcase at
 * the foot of the story section, and the shared spaces at the foot of the
 * practice. Both are the same instrument, so they are the same module rather
 * than two components that resemble each other — the same decision, and for
 * the same reason, as `lib/arc.ts` being the one curve behind the page's two
 * changes of ground. Re-pace the cut here and both re-pace together; there is
 * no second place for them to drift apart in.
 *
 * ============================================================================
 * THE CUT
 * ============================================================================
 *
 * NOT A CROSSFADE. Each change is a hard-edged wipe travelling across the
 * frame, with three things riding it:
 *
 *   · A COUNTER-MOVE. The incoming frame is already travelling when the wipe
 *     uncovers it and settles a beat AFTER the edge lands — a longer duration
 *     and a different ease. That lag is the whole difference between a camera
 *     move and a curtain.
 *   · A PUSH on the outgoing frame. It is shoved out of shot and scaled up
 *     slightly, never faded — nothing in the frame is ever half-transparent.
 *   · A LIGHT SEAM. A hairline of warm light pinned to the wipe edge, sharing
 *     its duration and its ease so the two cannot drift apart.
 *
 * The caption cuts with the picture rather than fading with it: the old line
 * is pulled up out of its mask and the new one comes up behind it.
 *
 * ============================================================================
 * WHO OWNS WHAT
 * ============================================================================
 *
 * React owns the index; CSS owns each frame's resting state through
 * `data-active`; GSAP paints over both for the length of the cut and hands
 * back with `clearProps`. So with no JS, or under reduced motion, the
 * controls still change the picture — instantly, and correctly — and there is
 * no half-wiped state to get stuck in.
 *
 * The caller owns the MARKUP and nothing else: the frame's size, its shape,
 * where the caption sits and what the controls look like are composition, and
 * belong to the section they are in. What is shared is the behaviour.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "./motion";

/** Advance-to-advance, in seconds. */
export const WIPE_SLIDE = 3;

/** How long the cut itself takes, inside that. The rest is the still. */
export const WIPE_CUT = 0.95;

/** How far the incoming frame travels before it settles, in % of its width. */
export const WIPE_DOLLY = 12;

/** Fraction of the frame that has to be on screen before it advances itself. */
const ON_SCREEN = 0.35;

/**
 * THE CALLER OWNS THE REFS. A hook that hands its own refs back makes every
 * read of them a ref access during render — which the React compiler rejects,
 * and rightly: the node read that way is whatever was there on the last
 * commit. So the nodes stay where they are used, the hook is given them, and
 * what it returns has nothing ref-shaped in it at all.
 *
 * The arrays are filled from `ref` callbacks in the caller's own markup, so
 * they are populated by the time any effect in here runs.
 */
export type WipeRefs = {
  /** The element that should stop the sequence advancing itself. */
  root: RefObject<HTMLDivElement | null>;
  /** The box the frames are stacked in — measured for the seam. */
  frame: RefObject<HTMLDivElement | null>;
  /** The hairline that rides the wipe edge. */
  seam: RefObject<HTMLSpanElement | null>;
  /** Each frame's box, its inner (transformed) element, and its caption. */
  slides: RefObject<(HTMLElement | null)[]>;
  inners: RefObject<(HTMLElement | null)[]>;
  captions: RefObject<(HTMLElement | null)[]>;
};

export type WipeSequence = {
  /** The frame being shown. */
  index: number;
  /** Show frame `next`. A no-op if it is already showing. */
  go: (next: number) => void;
  /** Spread onto the same element as `refs.root`. */
  hold: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocusCapture: () => void;
    onBlurCapture: () => void;
  };
};

/**
 * Drive a set of `count` frames.
 *
 * Autoplay stops when the set is off screen, under a pointer, or focused, and
 * never starts at all for a visitor who has asked for less motion — the
 * controls are then the only way through, which is the correct behaviour
 * rather than a degraded one.
 */
export function useWipeSequence(
  count: number,
  refs: WipeRefs,
): WipeSequence {
  const { root, frame, seam, slides, inners, captions } = refs;

  const [index, setIndex] = useState(0);
  /** A pointer or the keyboard focus is on the set: stop advancing. */
  const [held, setHeld] = useState(false);
  /* Lazily, so the no-observer case needs no state write at all: where there
     is no IntersectionObserver there is nothing to observe with, and the set
     should advance rather than sit still forever. */
  const [onScreen, setOnScreen] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  // Mirrors of state the callbacks below read synchronously. Setting them
  // inside a state updater would run them twice under StrictMode.
  const current = useRef(0);
  const direction = useRef(1);
  const previous = useRef(0);

  const go = useCallback((next: number) => {
    if (next === current.current) return;
    direction.current = next > current.current ? 1 : -1;
    current.current = next;
    setIndex(next);
  }, []);

  const advance = useCallback(() => {
    const next = (current.current + 1) % count;
    // The wrap from the last frame to the first is still forward motion.
    direction.current = 1;
    current.current = next;
    setIndex(next);
  }, [count]);

  /* ---- Autoplay -------------------------------------------------------- */

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { threshold: ON_SCREEN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    if (!onScreen || held || prefersReducedMotion()) return;
    const timer = window.setTimeout(advance, WIPE_SLIDE * 1000);
    return () => window.clearTimeout(timer);
  }, [index, onScreen, held, advance]);

  /* ---- The cut --------------------------------------------------------- */

  useIsomorphicLayoutEffect(() => {
    const from = previous.current;
    previous.current = index;
    // Mount, and every visitor who has asked for reduced motion: `data-active`
    // alone decides what is on screen, and the change is a plain cut.
    if (from === index || prefersReducedMotion()) return;

    const enter = slides.current[index];
    const leave = slides.current[from];
    const enterInner = inners.current[index];
    const leaveInner = inners.current[from];
    const enterCaption = captions.current[index];
    const leaveCaption = captions.current[from];
    if (!enter || !leave || !enterInner || !leaveInner) return;

    // Anything left mid-flight by a cut that was interrupted — a third frame
    // the visitor jumped away from — is handed back to CSS before this one
    // starts, so a fast clicker cannot strand a frame half-lit.
    slides.current.forEach((el, i) => {
      if (i === index || i === from) return;
      const stale = [el, inners.current[i], captions.current[i]].filter(
        (node): node is HTMLElement => node !== null,
      );
      if (stale.length > 0) gsap.set(stale, { clearProps: "all" });
    });

    const d = direction.current;
    const width = frame.current?.getBoundingClientRect().width ?? 0;
    // `inset(top right bottom left)`. Going forward the frame is uncovered
    // from its right edge, so the LEFT inset is what retreats; going back,
    // the mirror of that.
    const closed = d > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
    const open = "inset(0% 0% 0% 0%)";

    const tl = gsap.timeline();

    tl
      // Both frames are lit and stacked before anything moves. The outgoing
      // one needs this explicitly: React has already flipped its
      // `data-active` to false, and CSS would otherwise have hidden it.
      // `clipPath` too: if the previous cut was interrupted this frame may
      // still be carrying a half-open wipe from when it was the incoming one.
      .set(
        leave,
        {
          zIndex: 1,
          opacity: 1,
          visibility: "visible",
          clipPath: open,
          webkitClipPath: open,
        },
        0,
      )
      .set(
        enter,
        {
          zIndex: 2,
          opacity: 1,
          visibility: "visible",
          clipPath: closed,
          webkitClipPath: closed,
        },
        0,
      )
      .set(enterInner, { xPercent: WIPE_DOLLY * d, scale: 1.16 }, 0)

      // The wipe.
      .to(
        enter,
        {
          clipPath: open,
          webkitClipPath: open,
          duration: WIPE_CUT,
          ease: "expo.inOut",
        },
        0,
      )
      // The counter-move. Longer than the wipe and on a different ease, so
      // the picture is still settling for a beat after the edge has landed.
      .to(
        enterInner,
        { xPercent: 0, scale: 1, duration: WIPE_CUT * 1.35, ease: "expo.out" },
        0,
      )
      // The outgoing frame is pushed out of shot, never faded.
      .to(
        leaveInner,
        {
          xPercent: -WIPE_DOLLY * 0.75 * d,
          scale: 1.05,
          duration: WIPE_CUT,
          ease: "expo.inOut",
        },
        0,
      )

      // The light seam, pinned to the wipe edge: same duration, same ease, so
      // the two cannot drift apart at any point in the cut.
      .set(seam.current, { opacity: 1, x: d > 0 ? width : 0 }, 0)
      .to(
        seam.current,
        { x: d > 0 ? 0 : width, duration: WIPE_CUT, ease: "expo.inOut" },
        0,
      )
      .to(
        seam.current,
        { opacity: 0, duration: WIPE_CUT * 0.3, ease: "none" },
        WIPE_CUT * 0.7,
      )

      // The caption cuts with the picture rather than fading with it: the old
      // line is pulled up out of its mask, the new one comes up behind it.
      .set(leaveCaption, { opacity: 1 }, 0)
      .set(enterCaption, { yPercent: 110, opacity: 1 }, 0)
      .to(
        leaveCaption,
        { yPercent: -110, duration: WIPE_CUT * 0.55, ease: "power3.in" },
        0,
      )
      .to(
        enterCaption,
        { yPercent: 0, duration: WIPE_CUT * 0.9, ease: "expo.out" },
        WIPE_CUT * 0.4,
      )

      // Hand the outgoing frame back to CSS, which has been holding its
      // resting state — hidden — since React re-rendered.
      .set([leave, leaveInner, leaveCaption], { clearProps: "all" });

    return () => {
      tl.kill();
    };
  }, [index]);

  return {
    index,
    go,
    hold: {
      onMouseEnter: () => setHeld(true),
      onMouseLeave: () => setHeld(false),
      onFocusCapture: () => setHeld(true),
      onBlurCapture: () => setHeld(false),
    },
  };
}
