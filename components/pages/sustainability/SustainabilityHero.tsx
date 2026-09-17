"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { drawOnEnter, gsap, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./SustainabilityHero.module.css";

/**
 * /sustainability — the ground line.
 *
 * LIT FROM THE FIRST PIXEL. identity.css gives this page cream as its ground,
 * which is the loudest single difference available inside a two-colour system
 * and is spent here on purpose: /about and /nri-corner open on navy, and a
 * visitor who arrives on this page from either of them knows before reading a
 * word that they are somewhere else.
 *
 * THE FIGURE IS A HORIZON, not a spine. ResponsibilityIcons draws all four
 * commitments standing on one ground line — a wall and a tree on the same
 * ground, rain arriving in the tank that keeps it. This hero is that same
 * drawing at page scale: the headline sits above the line, the credentials sit
 * on it, and the stem that carries the four practices grows down out of it
 * into the section below.
 *
 * So the page's structure is not borrowed from another page and re-tinted. It
 * is the page's own subject, drawn once at the top and then used.
 */

export function SustainabilityHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "expo.out",
      stagger: 0.09,
    });

    // The horizon is ruled open from the centre outward — it is a ground line
    // being established, not a wipe travelling across the page.
    gsap.fromTo(
      `.${styles.horizonRule}`,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: "expo.out", delay: 0.3 },
    );

    gsap.to(`.${styles.meta}`, {
      opacity: 1,
      duration: 0.9,
      ease: "expo.out",
      delay: 0.75,
    });

    // The first inch of the stem, breaking the horizon downward. The rest of
    // it belongs to the section below and is drawn by the reader's scrolling.
    drawOnEnter(`.${styles.sproutPath}`, rootEl, {
      duration: 1.1,
      delay: 0.95,
      start: "top 95%",
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>

          <h1 id="page-title" className={`u-display ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h1>

          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>
        </div>
      </div>

      {/* The horizon: full-bleed, with the credentials standing on it. */}
      <div className={styles.horizon}>
        <span className={styles.horizonRule} aria-hidden="true" />

        <div className={`u-shell ${styles.metaWrap}`}>
          <ul className={styles.meta}>
            {content.meta.map((item) => (
              <li key={item} className={styles.metaItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* The stem breaking the ground line. */}
        <svg
          className={styles.sprout}
          viewBox="0 0 24 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className={styles.sproutPath}
            d="M12 0 C 12 22, 12 34, 12 60"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>
      </div>
    </section>
  );
}

export default SustainabilityHero;
