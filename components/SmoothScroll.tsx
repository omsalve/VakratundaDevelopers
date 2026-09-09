"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger, gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Optional smooth-scroll layer (Lenis), wired into GSAP's ticker so
 * ScrollTrigger and Lenis share one clock. Two loops driving scroll-linked
 * animation is how pinned sections start to judder.
 *
 * TO TURN IT OFF: pass `enabled={false}` where this is mounted in
 * app/(frontend)/layout.tsx, or delete the component from the tree. Nothing
 * else depends on it — every animation on the site is driven by native scroll
 * position and works identically without it.
 *
 * It disables itself under prefers-reduced-motion: hijacking the scroll of
 * someone who asked for less motion is the one thing this must never do.
 */

export function SmoothScroll({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;

    const lenis = new Lenis({
      // Lower = heavier, more cinematic. Above ~0.15 it feels ordinary.
      lerp: 0.085,
      wheelMultiplier: 0.9,
      // Lenis owns in-page anchor jumps so they ease instead of teleporting.
      anchors: true,
      // GSAP's ticker drives the frame instead — see below.
      autoRaf: false,
      autoToggle: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Without this, a tab returning from the background fires one enormous
    // delta and every scrubbed animation lurches.
    gsap.ticker.lagSmoothing(0);

    document.documentElement.classList.add("lenis");

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, [enabled]);

  return null;
}

export default SmoothScroll;
