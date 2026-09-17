"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import styles from "./AwardsSpotlight.module.css";

/**
 * /awards — the light on the glass, across the whole cabinet.
 *
 * THE PAGE IS THE CASE, NOT ONE SHELF OF IT. This used to be a layer inside
 * the certifications section, which meant the light switched on when that one
 * band was under the pointer and off again either side of it — a seam exactly
 * where the page is meant to read as one lit room. It now tracks the pointer
 * across every screen of the route: the seal, the case and the citations are
 * all under the same moving light.
 *
 * THE LAYER IS PUT ON <body> RATHER THAN RENDERED IN PLACE, for the reason
 * PageShell states at <main data-enclose-page>: that element carries a
 * transform while the footer closes around it, which makes it the containing
 * block for any `position: fixed` descendant and then clips it. Lightbox
 * portals to <body> for the same reason. Here there is nothing to portal — it
 * is one aria-hidden node that draws and does nothing else — so the component
 * renders null and owns the node from an effect, which also keeps it out of
 * hydration's way: the server sends no light and the client adds one.
 *
 * IT WRITES TWO CUSTOM PROPERTIES AND NOTHING ELSE. The gradient lives in CSS,
 * so a pointer move never touches layout and repaints nothing but this one
 * layer. Nothing on the page depends on it: with no JS there is no light, and
 * with no pointer — a phone, a visitor who has asked for less motion — the
 * layer rests above-centre and the page is evenly lit, which is what the
 * section-scoped version did at rest.
 */

export function AwardsSpotlight() {
  useEffect(() => {
    const el = document.createElement("div");
    el.className = styles.spotlight;
    el.setAttribute("aria-hidden", "true");
    document.body.append(el);

    /* A finger has no hover position to light from, and a tap would leave the
       light stranded wherever it last landed. Either way the layer stays, at
       the resting position its stylesheet gives it. */
    const tracks =
      !prefersReducedMotion() && window.matchMedia("(pointer: fine)").matches;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      gsap.to(el, {
        "--spot-x": `${(event.clientX / window.innerWidth) * 100}%`,
        "--spot-y": `${(event.clientY / window.innerHeight) * 100}%`,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
      });
    };

    if (tracks) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
      el.remove();
    };
  }, []);

  return null;
}

export default AwardsSpotlight;
