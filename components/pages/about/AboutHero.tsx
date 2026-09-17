"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { drawOnEnter, gsap, parallax, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./AboutHero.module.css";

/**
 * /about — the opening.
 *
 * THE PAGE'S ARGUMENT IS CONTINUITY, so the page is one line. It starts at the
 * top edge of this screen, runs down the left through everything below, and is
 * only ever interrupted where the page wants an interruption to mean
 * something. That is the whole identity of /about, and it begins here.
 *
 * NOT THE CENTRED STACK the old PageHero used on all fifteen pages. The
 * headline is ranged left ON the line and sits LOW in the frame, with the
 * founding year set enormous behind it and bleeding off the right edge. A
 * fifty-year-old practice opens on its own first year, at the largest size the
 * page ever sets anything, and the eye reads the year before it reads the
 * sentence.
 *
 * THE YEAR IS DECORATION AND IS MARKED AS SUCH. It repeats `1973`, which the
 * meta row below states in words, so it carries `aria-hidden` and a screen
 * reader is not read the same fact twice.
 *
 * Motion: the line draws down from the top edge, the stack rises on the house
 * entrance, and the year drifts against the scroll. Under reduced motion the
 * line is simply there, the stack is in place, and the year does not move.
 */

export function AboutHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  /* THE YEAR IS READ OFF THE CREDENTIALS ROW, not passed in and not written
     here. The row already says "Established 1973", so the digits behind the
     headline are that same fact rendered large — there is no second copy of it
     to fall out of step when the CMS changes the row. A row with no year in it
     simply gets no figure, which is the correct behaviour for a page whose
     opening image is a date it cannot find. */
  const year = content.meta
    .map((item) => item.match(/\b(1[89]\d{2}|20\d{2})\b/)?.[0])
    .find(Boolean);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    // The line arrives first and everything else is staked onto it, so it is
    // drawn before the stack rather than with it.
    drawOnEnter(`.${styles.threadPath}`, rootEl, {
      duration: 1.6,
      start: "top 95%",
    });

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
      delay: 0.25,
    });

    parallax(`.${styles.year}`, rootEl, { distance: 14 });
  }, []);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="page-title"
    >
      {/* The founding year, behind everything, bleeding off the right edge. */}
      {year ? (
        <span className={`p-numeral ${styles.year}`} aria-hidden="true">
          {year}
        </span>
      ) : null}

      {/* The line. An SVG rather than a border so it can be drawn open, and
          full-bleed vertically so it reads as arriving from off-screen above
          and leaving off-screen below — it does not begin or end on this
          page, which is the point being made. */}
      <svg
        className={styles.thread}
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.threadPath}
          d="M1 0 L1 100"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          fill="none"
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

export default AboutHero;
