"use client";

/**
 * Motion primitives shared by every animated section.
 *
 * The contract, in one line: animation is additive. Markup renders in its
 * final visible state, `motion-on` (set in <head> before first paint) is the
 * only thing that hides a `[data-reveal]` element, and every helper here
 * no-ops when the visitor has asked for reduced motion. Nothing can be
 * stranded invisible by a failed script or a disabled plugin.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, type RefObject } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Pinned sections + a fixed header would otherwise fight over scroll math.
  ScrollTrigger.config({ ignoreMobileResize: true });
  /* Sections name their targets by selector and render optional blocks, so an
     empty match is a section being itself. The selectors have to stay strings
     for gsap.context to scope them per instance — resolving them here to test
     for emptiness would collect every instance on the page — so the empty case
     is settled at GSAP's end instead. */
  gsap.config({ nullTargetWarn: false });
}

export { gsap, ScrollTrigger };

/** useLayoutEffect that does not warn during SSR. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** True when the visitor has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scope a GSAP setup function to a container ref and clean it up on unmount.
 *
 * `setup` is skipped entirely under reduced motion, so a component never has
 * to branch internally — it just describes the full-motion version. It may
 * return a cleanup function, which GSAP runs on revert alongside its own —
 * for the odd listener or promise a context cannot know about.
 */
export function useGsapScope(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: gsap.Context) => void | (() => void),
  deps: unknown[] = [],
) {
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const el = scope.current;
    if (!el) return;

    const ctx = gsap.context(setup, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * The house entrance: an exponential ease-out from an already-visible
 * default, staggered down the group. One authored moment, reused, rather
 * than a different flourish per section.
 */
export function revealOnEnter(
  targets: gsap.DOMTarget,
  trigger: Element,
  options: { stagger?: number; start?: string; delay?: number } = {},
) {
  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 1.05,
    delay: options.delay ?? 0,
    ease: "expo.out",
    stagger: options.stagger ?? 0.09,
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 78%",
      once: true,
    },
  });
}
