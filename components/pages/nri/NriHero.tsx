"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { drawOnEnter, gsap, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./NriHero.module.css";

/**
 * /nri-corner — the departure side.
 *
 * THE PAGE IS ABOUT DISTANCE, so the page has a middle and the reader starts
 * on one side of it. A meridian is drawn down the CENTRE of the frame — not
 * the left edge, which is where /about runs its line, and the difference is
 * the whole point: /about's line is a rope you follow, this one is a border
 * you have to get across.
 *
 * THE OPENING STACK SITS LEFT OF IT. Everything in this first screen is on the
 * far side: the rubric, the headline, the standfirst, the credentials. By the
 * foot of the page the content is on the right of the same line, and the
 * crossing happens in the middle of the four stages. Nothing announces this
 * and nothing needs to — it is felt as the page descends.
 *
 * THE TWO MARKERS on the meridian name the ends of the journey. They are read
 * off the hero's own credentials row rather than written here, so the page
 * cannot say "Mumbai" in a graphic while the CMS says somewhere else.
 *
 * Motion: the meridian draws down from the top edge; the stack rises on the
 * house entrance. Under reduced motion the line is simply there.
 */

export function NriHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  /* The far end of the journey, taken from the credentials row — the entry
     that names a place. Without one the marker is not drawn at all, rather
     than falling back to a city this component has decided on for itself. */
  const destination = content.meta.find((item) => item.includes("·"));

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.meridianPath}`, rootEl, {
      duration: 1.8,
      start: "top 95%",
    });

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
      delay: 0.3,
    });

    gsap.to(`.${styles.marker}`, {
      opacity: 1,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.14,
      delay: 0.9,
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      {/* The meridian. Centred, full-bleed vertically, and drawn open. */}
      <div className={styles.meridian} aria-hidden="true">
        <svg
          className={styles.meridianSvg}
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
        >
          <path
            className={styles.meridianPath}
            d="M1 0 L1 100"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>

        {destination ? (
          <span className={`u-label ${styles.marker} ${styles.markerEnd}`}>
            {destination}
          </span>
        ) : null}
      </div>

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

export default NriHero;
