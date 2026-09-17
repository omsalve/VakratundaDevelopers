"use client";

import { useRef, useState } from "react";
import type { CardItem } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import {
  drawOnEnter,
  revealOnEnter,
  trackSections,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./AboutStations.module.css";

/**
 * /about — the four commitments, as stations on the line.
 *
 * WHAT THIS REPLACES. A two-column `CardGrid`: four hairline boxes, the same
 * four boxes /sustainability, /careers, /investors, /experiences, /hospitality
 * and /nri-corner all put in the same place. A grid says "here are four
 * comparable items". These are not four comparable items — they are four
 * things the practice has committed to IN ORDER, and the page is about the
 * order holding for fifty years.
 *
 * THE GROUND CHANGES HERE AND THE LINE DOES NOT. This is the page's one swap
 * to cream, kept from the old design because the site's rule is that a ground
 * change is rare enough to be an event. What is new is that the thread runs
 * straight through it: the same line, re-drawn in the deep rose the cream
 * ground needs, arriving from the navy above. A line that survives the change
 * of ground is the argument of the page in one gesture.
 *
 * THE STATION UNDER THE READING LINE IS LIT, through `trackSections` — the
 * same primitive that drives the clause rail on /grievance-redressal and the
 * contents column on an article. Three pages, three completely different
 * layouts, one behaviour.
 */

export function AboutStations({
  heading,
  standfirst,
  items,
}: {
  heading: SwashHeading;
  standfirst: string;
  items: CardItem[];
}) {
  const root = useRef<HTMLElement | null>(null);
  const [current, setCurrent] = useState(-1);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.threadPath}`, rootEl, {
      scrub: true,
      start: "top 85%",
      end: "bottom 85%",
    });

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Each station's leader is drawn out from the line as the station arrives,
    // so the number is reached BY the thread rather than placed beside it.
    drawOnEnter(`.${styles.leaderPath}`, rootEl, {
      duration: 0.9,
      start: "top 78%",
      stagger: 0.14,
    });

    revealOnEnter(`.${styles.stationBody} > [data-reveal]`, rootEl, {
      start: "top 80%",
      stagger: 0.06,
    });

    const stations = Array.from(
      rootEl.querySelectorAll<HTMLElement>(`.${styles.station}`),
    );
    return trackSections(stations, setCurrent);
  }, [items.length]);

  return (
    <section
      ref={root}
      className={`on-cream ${styles.section}`}
      aria-labelledby="principles-title"
    >
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
        <div className={styles.head}>
          <h2 id="principles-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <ol className={styles.stations}>
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`p-node ${styles.station}`}
              data-current={current === index}
            >
              {/* The leader: the line reaching out to the station number. */}
              <svg
                className={styles.leader}
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className={styles.leaderPath}
                  d="M0 1 L100 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                />
              </svg>

              {/* Decorative: the list is already an <ol>, so the position is
                  in the semantics and the numeral is there to be looked at. */}
              <span className={`p-numeral ${styles.number}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className={styles.stationBody}>
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
      </div>
    </section>
  );
}

export default AboutStations;
