"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { drawOnEnter, gsap, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./AwardsHero.module.css";

/**
 * /awards — the seal.
 *
 * THE DEEPEST GROUND ON THE SITE. identity.css puts this page on navy-900, a
 * step below the landing page's own navy, because a cabinet of citations is
 * looked INTO rather than read across — the same reason a jeweller's case is
 * lined in something darker than the room.
 *
 * THE FIGURE IS A SEAL: concentric drawn rings with a ticked outer bezel, from
 * the same 1.4-stroke hand as every other drawing on the site. It is the only
 * thing on the whole site that moves continuously — one slow rotation, never
 * finishing, because that is exactly what a certification is. Everything else
 * here animates once on arrival and then stops.
 *
 * The rotation is added by script and only outside reduced motion, so it can
 * never become a thing a visitor has to sit through.
 */

export function AwardsHero({ content }: { content: PageHeroContent }) {
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

    drawOnEnter(`.${styles.sealPath}`, rootEl, {
      duration: 1.9,
      stagger: 0.12,
      start: "top 95%",
    });

    // The one continuous movement on the site. Very slow, and linear — a
    // mechanism turning, not an animation easing.
    gsap.to(`.${styles.sealSpin}`, {
      rotate: 360,
      duration: 140,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%",
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      {/* The seal. Decorative: the standards it is drawn around are listed in
          the credentials row as text. */}
      <span className={styles.seal} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <g className={styles.sealSpin}>
            <circle className={styles.sealPath} cx="100" cy="100" r="96" strokeWidth="0.75" />
            <circle
              className={styles.sealPath}
              cx="100"
              cy="100"
              r="84"
              strokeWidth="0.75"
              strokeDasharray="1 5"
              strokeLinecap="round"
            />
          </g>
          <circle className={styles.sealPath} cx="100" cy="100" r="66" strokeWidth="0.75" />
          <circle className={styles.sealPath} cx="100" cy="100" r="40" strokeWidth="0.75" />
        </svg>
      </span>

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

          <ul className={styles.meta} data-reveal="up">
            {content.meta.map((item) => (
              <li key={item} className={styles.metaItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AwardsHero;
