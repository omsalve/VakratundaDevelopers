"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { gsap, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ExperiencesHero.module.css";

/**
 * /experiences — before the day starts.
 *
 * THE PAGE'S SUBJECT IS TIME PASSING, so the page's material is LIGHT. This
 * opening sits on the deepest navy the palette holds and NOTHING WASHES OVER
 * IT — the hour before the light arrives is one flat field, not a gradient.
 * The band below runs the four moments of the day; the close settles onto
 * cream.
 *
 * NO DRAWN FIGURE HERE, and that is the distinction from every other opening
 * on the site. /about draws a line, /nri-corner a meridian, /sustainability a
 * horizon rule, /careers an arch, /awards a seal. This one draws nothing: it
 * is lit rather than ruled, because the thing being shown is an atmosphere and
 * not a structure.
 *
 * The only movement in the frame is the opening line settling in.
 */

export function ExperiencesHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.15,
      ease: "expo.out",
      stagger: 0.1,
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

export default ExperiencesHero;
