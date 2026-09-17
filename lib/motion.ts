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

/**
 * A timeline on its own trigger, measured the instant it is built.
 *
 * GSAP defers the first refresh of a timeline-attached ScrollTrigger by a tick,
 * because a timeline is usually still empty at the moment its trigger is
 * created. A trigger waiting like that has no start/end yet, so the next
 * trigger created in the same tick force-refreshes it from inside the loop it
 * runs over its predecessors — and a `once` trigger that is already scrolled
 * past kills itself there, shortening the very array that loop is walking.
 * Two or three of those in one pass (a grid of cards, then the copy reveal
 * over them) and the loop reads past the end of it and throws.
 *
 * So the timeline is populated by `build` and refreshed here, before control
 * returns: every trigger is measured before the next one is born, and nothing
 * is ever force-refreshed mid-loop. The refresh happens after `build` for the
 * same reason GSAP defers it — an empty timeline measures as nothing.
 */
export function timelineOnEnter(
  vars: ScrollTrigger.Vars,
  build: (timeline: gsap.core.Timeline) => void,
): gsap.core.Timeline {
  const timeline = gsap.timeline({ scrollTrigger: vars });
  build(timeline);
  timeline.scrollTrigger?.refresh();
  return timeline;
}

/* ============================================================================
   THE SHARED VOCABULARY OF MOVEMENT
   ============================================================================

   Every standing page now composes its own layout, so the thing that keeps
   fifteen different pages reading as one site cannot be the layout any more.
   It is this: the same six movements, drawn from the same easing family, on
   the same two durations. A page is distinctive because of WHICH of these it
   uses and WHERE — never because it invented a seventh.

   `expo.out` is the house entrance and stays that. `power1.out` is used only
   where a value grows with an area (the arc, a filling gauge) and a linear
   rate would read as acceleration — the reasoning is set out in lib/arc.ts.
   Nothing here introduces a bounce, an elastic or a back ease: the brand is
   drawn line-work and a serif at display size, and it does not overshoot.

   All of it inherits the contract at the top of this file — `useGsapScope`
   never runs under reduced motion, so none of these helpers needs to check.
   ========================================================================== */

/**
 * Draw an SVG path, as a pen would.
 *
 * The one movement the brand guide's line-work actually asks for: the mandala
 * petal, the rose hairline, the timeline spine and the certification seals are
 * all strokes, and a stroke should arrive by being drawn rather than by fading
 * up. Measures each path itself rather than trusting a CSS `stroke-dasharray`
 * to have guessed the length right, because a responsive path changes length
 * at every breakpoint and a hard-coded dash array is wrong at all but one.
 *
 * Returns the tween so a caller can drop it into its own timeline.
 */
export function drawOnEnter(
  targets: string,
  trigger: Element,
  options: {
    duration?: number;
    stagger?: number;
    start?: string;
    delay?: number;
    /** Scrub to the scroll position instead of playing once on entry. */
    scrub?: boolean | number;
    end?: string;
  } = {},
) {
  const paths = gsap.utils.toArray<SVGPathElement | SVGLineElement>(targets);
  if (paths.length === 0) return null;

  paths.forEach((path) => {
    // getTotalLength is on SVGGeometryElement, which every drawable shape is.
    const length =
      typeof path.getTotalLength === "function" ? path.getTotalLength() : 0;
    if (!length) return;
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });

  return gsap.to(paths, {
    strokeDashoffset: 0,
    duration: options.duration ?? 1.4,
    delay: options.delay ?? 0,
    ease: "expo.out",
    stagger: options.stagger ?? 0,
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 82%",
      end: options.end ?? "bottom 60%",
      scrub: options.scrub ?? false,
      once: !options.scrub,
    },
  });
}

/**
 * Count a figure up to the number already written in the markup.
 *
 * THE MARKUP IS THE SOURCE OF THE VALUE, never a prop: the final number is in
 * the HTML, so a visitor with no JS, a crawler, or anyone who has asked for
 * reduced motion reads the real figure and not a zero. This only ever replaces
 * that text for the length of the tween and puts the original back at the end.
 *
 * Formatting is preserved by re-deriving it, not by string-matching: the
 * decimal places are counted off the source, and the thousands separators are
 * re-applied by `toLocaleString`, so "2,500" counts through "1,340" rather
 * than "1340" and "2.1" never flickers to "2".
 */
export function countUp(
  el: HTMLElement,
  options: { duration?: number; start?: string; delay?: number } = {},
) {
  const source = el.textContent?.trim() ?? "";
  // Strip anything that is not part of the number before parsing.
  const target = Number(source.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(target) || target === 0) return null;

  const fraction = source.includes(".") ? source.split(".")[1] : undefined;
  const decimals = fraction ? fraction.replace(/[^0-9]/g, "").length : 0;
  const grouped = source.includes(",");
  const counter = { value: 0 };

  return gsap.to(counter, {
    value: target,
    duration: options.duration ?? 1.8,
    delay: options.delay ?? 0,
    ease: "expo.out",
    onUpdate: () => {
      el.textContent = grouped
        ? counter.value.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : counter.value.toFixed(decimals);
    },
    // Hand the authored string back, so what is on screen at rest is exactly
    // what the CMS wrote — separators, suffix and all.
    onComplete: () => {
      el.textContent = source;
    },
    scrollTrigger: {
      trigger: el,
      start: options.start ?? "top 88%",
      once: true,
    },
  });
}

/**
 * Uncover a block from one edge, the way lib/wipe.ts cuts between frames.
 *
 * The site's rule is that nothing is ever half-transparent — a thing is
 * revealed by an edge travelling across it, not by opacity. This is that rule
 * made available to any block: a photograph, a plate, a rule, a table row.
 *
 * `from` names the edge the cover retreats TO, so "left" reads left-to-right.
 */
export function maskReveal(
  targets: gsap.DOMTarget,
  trigger: Element,
  options: {
    from?: "left" | "right" | "top" | "bottom";
    duration?: number;
    stagger?: number;
    start?: string;
    delay?: number;
  } = {},
) {
  const closed = {
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
    top: "inset(0% 0% 100% 0%)",
    bottom: "inset(100% 0% 0% 0%)",
  }[options.from ?? "left"];

  return gsap.fromTo(
    targets,
    { clipPath: closed, webkitClipPath: closed },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      webkitClipPath: "inset(0% 0% 0% 0%)",
      duration: options.duration ?? 1.2,
      delay: options.delay ?? 0,
      ease: "expo.out",
      stagger: options.stagger ?? 0,
      scrollTrigger: {
        trigger,
        start: options.start ?? "top 82%",
        once: true,
      },
    },
  );
}

/**
 * Move a layer against the scroll.
 *
 * Deliberately small by default. A photograph that travels 80px over a
 * viewport of scroll reads as depth; one that travels 400px reads as a bug,
 * and on a long page it eventually leaves its own frame. `scrub: true` rather
 * than a number, because a parallax that lags the scroll is a parallax that is
 * in the wrong place whenever the visitor stops.
 */
export function parallax(
  targets: gsap.DOMTarget,
  trigger: Element,
  options: { distance?: number; start?: string; end?: string } = {},
) {
  const distance = options.distance ?? 8;

  return gsap.fromTo(
    targets,
    { yPercent: -distance },
    {
      yPercent: distance,
      ease: "none",
      scrollTrigger: {
        trigger,
        start: options.start ?? "top bottom",
        end: options.end ?? "bottom top",
        scrub: true,
      },
    },
  );
}

/**
 * Hand a section its own scroll progress, 0 to 1.
 *
 * For the pages whose identity IS a progression — the day moving from dawn to
 * dusk on /experiences, the meridian crossing on /nri-corner. Those set a
 * custom property from the progress and let CSS interpolate the rest, which
 * keeps colour mixing out of JavaScript and off the main thread.
 */
export function scrubProgress(
  trigger: Element,
  onUpdate: (progress: number) => void,
  options: { start?: string; end?: string } = {},
) {
  return ScrollTrigger.create({
    trigger,
    start: options.start ?? "top bottom",
    end: options.end ?? "bottom top",
    scrub: true,
    onUpdate: (self) => onUpdate(self.progress),
    onRefresh: (self) => onUpdate(self.progress),
  });
}

/**
 * Light the entry whose section is currently under the reading line.
 *
 * The shared behaviour behind every index on the site — the clause rail on
 * /grievance-redressal, the contents column on an article. Calls back with the
 * index of the section in view.
 *
 * ONE TRIGGER PER SECTION but a SINGLE reading line at 45% of the viewport, so
 * two adjacent short clauses cannot both claim the rail and flicker between
 * themselves on every frame — the one whose band contains the line wins, and
 * bands do not overlap.
 */
export function trackSections(
  sections: Element[],
  onChange: (index: number) => void,
): () => void {
  if (sections.length === 0) return () => {};

  const triggers = sections.map((section, index) =>
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (self.isActive) onChange(index);
      },
    }),
  );

  return () => triggers.forEach((trigger) => trigger.kill());
}
