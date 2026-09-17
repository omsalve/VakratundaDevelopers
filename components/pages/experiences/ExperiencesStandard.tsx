"use client";

import { useRef } from "react";
import type { CardItem } from "@/lib/pages";
import type { Cta, SwashHeading } from "@/lib/content";
import { maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ExperiencesStandard.module.css";

/**
 * /experiences — what comes as standard, after the day is over.
 *
 * THE PAGE'S ONE CHANGE OF GROUND, and it is spent on the change of register.
 * Everything above is a day: photographs, an hour set over each one, the light
 * climbing and falling. This is the specification — what is true of every home
 * whatever hour it is — so it is on cream, in daylight, with no photography at
 * all and nothing moving but the rules.
 *
 * The site's rule that the ground changes rarely enough to be an event is what
 * makes this work: after four full-bleed frames on deep navy, arriving at a
 * quiet ruled list on cream reads as the lights coming up.
 *
 * SET AS A SPECIFICATION, NOT AS CARDS. Each item is a ruled row: the title in
 * the display face on the left, what it means on the right. It is the same
 * register /investors uses for its governance schedule, and for the same
 * reason — a list of things that are simply true does not want four floating
 * boxes making four independent claims.
 */

export function ExperiencesStandard({
  label,
  heading,
  standfirst,
  items,
  coda,
  cta,
}: {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  items: CardItem[];
  coda: string;
  cta?: Cta;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    maskReveal(`.${styles.rowRule}`, rootEl, {
      from: "left",
      duration: 0.9,
      stagger: 0.08,
      start: "top 88%",
    });

    revealOnEnter(`.${styles.row} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.05,
      delay: 0.1,
    });

    revealOnEnter(`.${styles.close} > [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });
  }, [items.length]);

  return (
    <section
      ref={root}
      className={`on-cream ${styles.section}`}
      aria-labelledby="standard-title"
    >
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {label}
          </p>
          <h2 id="standard-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <dl className={styles.spec}>
          {items.map((item) => (
            <div key={item.id} className={styles.row}>
              <span className={styles.rowRule} aria-hidden="true" />

              <dt className={styles.term} data-reveal="up">
                {item.eyebrow ? (
                  <span className={`u-label ${styles.eyebrow}`}>
                    {item.eyebrow}
                  </span>
                ) : null}
                <span className={styles.termTitle}>{item.title}</span>
              </dt>

              <dd className={styles.definition} data-reveal="up">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>

        <div className={styles.close}>
          <p className={styles.coda} data-reveal="up">
            {coda}
          </p>

          {cta ? (
            <p data-reveal="up">
              <a className={styles.cta} href={cta.href}>
                <span>{cta.label}</span>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ExperiencesStandard;
