"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import type { Stat } from "@/lib/pages";
import { countUp, gsap, maskReveal, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./InvestorsStatement.module.css";

/**
 * /investors — the statement of account.
 *
 * THE ONLY PAGE ON THE SITE WHOSE OPENING IS DATA. Everywhere else the first
 * screen is a headline and a photograph or a drawing; here the figures are
 * ruled across the full width directly under the title, because the reader is
 * an investor and the first question is the record. A page that made them
 * scroll past a mood to reach the numbers would have misread its own visitor.
 *
 * THE FIGURES COUNT UP FROM THE MARKUP'S OWN VALUE. `countUp` reads the number
 * that is already in the HTML and puts the authored string back at the end, so
 * a crawler, a visitor with no JavaScript, and anyone who has asked for reduced
 * motion all read the real figure — separators, decimals and all — and the
 * tween is only ever a way of arriving at it. Nothing here is a prop that could
 * disagree with what is on the page.
 *
 * `--fs-display` IS NOT USED. The figures are set larger than the title, which
 * is the correct hierarchy for a statement and is the opposite of every other
 * page on the site. The title is `u-h1`.
 */

export function InvestorsStatement({
  content,
  statsLabel,
  stats,
}: {
  content: PageHeroContent;
  statsLabel: string;
  stats: Stat[];
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.08,
    });

    maskReveal(`.${styles.figureRule}`, rootEl, {
      from: "left",
      duration: 1,
      stagger: 0.08,
      delay: 0.25,
    });

    gsap.to(`.${styles.figure} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.06,
      delay: 0.35,
    });

    for (const el of rootEl.querySelectorAll<HTMLElement>(`.${styles.value}`)) {
      countUp(el, { duration: 1.9, delay: 0.45 });
    }
  }, [stats.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>

          <h1 id="page-title" className={`u-h1 ${styles.heading}`} data-reveal="up">
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

        {/* The record. A <dl>: each figure is a value and what it counts. */}
        <section className={styles.record} aria-label={statsLabel}>
          <p className={`u-label ${styles.recordLabel}`}>{statsLabel}</p>

          <dl className={styles.figures}>
            {stats.map((stat) => (
              <div key={stat.id} className={styles.figure}>
                <span className={styles.figureRule} aria-hidden="true" />

                <dd className={styles.figureValue} data-reveal="up">
                  <span className={`p-numeral ${styles.value}`}>
                    {stat.value}
                  </span>
                  {stat.suffix ? (
                    <span className={styles.suffix}>{stat.suffix}</span>
                  ) : null}
                  {stat.unit ? (
                    <span className={styles.unit}>{stat.unit}</span>
                  ) : null}
                </dd>

                <dt className={styles.figureNote} data-reveal="up">
                  {stat.note}
                </dt>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
}

export default InvestorsStatement;
