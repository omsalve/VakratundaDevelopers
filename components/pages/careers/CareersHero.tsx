"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { drawOnEnter, gsap, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./CareersHero.module.css";

/**
 * /careers — the doorway.
 *
 * THE FIGURE IS AN ARCH, drawn open. It is the brand mandala's own petal
 * curve — the same geometry lib/arc.ts uses for the landing page's change of
 * ground — standing on the baseline as an opening rather than sweeping across
 * as a wipe. One shape, two completely different uses, which is what a house
 * style is for.
 *
 * THE COPY STANDS INSIDE IT. The headline is set within the span of the arch
 * rather than beside it, so the first thing the page does is put the reader
 * in the doorway. No other hero on the site centres its copy inside a drawn
 * form; /sustainability centres, but on an open field with a horizon.
 *
 * NO FIGURES HERE. The group's numbers are on this page, but they come later
 * as a slim ruled rail — /investors is the page whose opening is data, and two
 * pages opening on big tabular numerals would make both of them forgettable.
 */

export function CareersHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.archPath}`, rootEl, {
      duration: 2,
      start: "top 95%",
    });

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      delay: 0.45,
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      {/* The arch. Decorative; the doorway is a figure, not information. */}
      <svg
        className={styles.arch}
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        {/* A petal standing on the baseline: two mirrored curves meeting at
            the apex, which is the mandala's own construction. */}
        <path
          className={styles.archPath}
          d="M40 300 C 40 130, 120 8, 200 4 C 280 8, 360 130, 360 300"
          strokeWidth="1.25"
        />
        <path
          className={styles.archPath}
          d="M78 300 C 78 150, 140 44, 200 40 C 260 44, 322 150, 322 300"
          strokeWidth="0.75"
        />
      </svg>

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

export default CareersHero;
