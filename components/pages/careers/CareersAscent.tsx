"use client";

import { useRef } from "react";
import type { CardItem, Stat } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import {
  countUp,
  drawOnEnter,
  maskReveal,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./CareersAscent.module.css";

/**
 * /careers — what the practice is like, as a staircase.
 *
 * WHAT THIS REPLACES. A two-column `CardGrid`, then a `StatRow`, then another
 * `CardGrid` — the identical three-component sequence /investors used, which
 * is why the two pages were indistinguishable at a glance.
 *
 * THE FIGURE IS A STAIRCASE. Each principle steps down AND across from the one
 * before it, joined by a drawn L-shaped connector: down from the last tread,
 * then along to the next. It is the fourth distinct way this site draws a line
 * through a set of things, and it is the one that fits a page about joining —
 * you arrive at the bottom and the page climbs.
 *
 *   /about              a straight line down the left edge      a rope
 *   /nri-corner         a straight line down the middle         a border
 *   /sustainability     a curved stem with branches             growth
 *   /careers            a stepped line, down and across         an ascent
 *
 * Same rose hairline, same drawn-on-entry motion, four different arguments.
 *
 * THE FIGURES ARE A RAIL, NOT A HERO. They close the staircase as a slim ruled
 * strip — deliberately small, because /investors is the page whose opening is
 * data and two pages leading on big tabular numerals would blunt both.
 */

export function CareersAscent({
  label,
  heading,
  standfirst,
  items,
  stats,
}: {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  items: CardItem[];
  stats: Stat[];
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // The connectors are drawn in order, so the staircase builds downward.
    drawOnEnter(`.${styles.connectorPath}`, rootEl, {
      duration: 1,
      start: "top 82%",
      stagger: 0.16,
    });

    revealOnEnter(`.${styles.tread} [data-reveal]`, rootEl, {
      start: "top 84%",
      stagger: 0.06,
    });

    maskReveal(`.${styles.railRule}`, rootEl, {
      from: "left",
      duration: 1.1,
      start: "top 88%",
    });

    revealOnEnter(`.${styles.stat} > [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.07,
    });

    for (const el of rootEl.querySelectorAll<HTMLElement>(`.${styles.value}`)) {
      countUp(el, { duration: 1.5 });
    }
  }, [items.length, stats.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="culture-title">
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {label}
          </p>
          <h2 id="culture-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <ol className={styles.stair}>
          {items.map((item, index) => (
            <li
              key={item.id}
              className={styles.tread}
              /* The step's depth across the grid. Capped at four so a fifth
                 principle starts the flight again rather than walking off the
                 right edge of the page. */
              style={{ "--step": index % 4 } as React.CSSProperties}
            >
              {/* The connector: down from the previous tread, then across.
                  Drawn for every tread except the first of a flight — the
                  first has nothing above and to its left to come down from,
                  and after four steps the flight starts again at the left
                  margin, where an L-shaped joint would have to span the whole
                  page to reach. */}
              {index % 4 !== 0 ? (
                <svg
                  className={styles.connector}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    className={styles.connectorPath}
                    d="M2 0 L2 98 L100 98"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    fill="none"
                  />
                </svg>
              ) : null}

              <div className={styles.treadBody}>
                {item.eyebrow ? (
                  <p className={`u-label ${styles.eyebrow}`} data-reveal="up">
                    {item.eyebrow}
                  </p>
                ) : null}
                <h3 className={`u-h3 ${styles.title}`} data-reveal="up">
                  {item.title}
                </h3>
                <p className={styles.body} data-reveal="up">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* The figures, as a rail closing the flight. */}
        <dl className={styles.rail}>
          <span className={styles.railRule} aria-hidden="true" />

          {stats.map((stat) => (
            <div key={stat.id} className={styles.stat}>
              <dd className={styles.statValue} data-reveal="up">
                <span className={`p-numeral ${styles.value}`}>{stat.value}</span>
                {stat.suffix ? (
                  <span className={styles.suffix}>{stat.suffix}</span>
                ) : null}
                {stat.unit ? (
                  <span className={styles.unit}>{stat.unit}</span>
                ) : null}
              </dd>
              <dt className={styles.statNote} data-reveal="up">
                {stat.note}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default CareersAscent;
