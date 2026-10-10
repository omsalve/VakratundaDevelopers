"use client";

import { useRef } from "react";
import type { AboutPageContent } from "@/lib/pages";
import type { TeamMember } from "@/lib/content";
import { drawOnEnter, maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import PortraitPlate from "@/components/PortraitPlate";
import Swash from "@/components/Swash";
import styles from "./AboutFamily.module.css";

/**
 * /about — the Chairman and the Director, husband and wife.
 *
 * TWO PORTRAITS, ONE PAIR. They stand side by side at the same size, joined
 * by an ampersand rather than set one above the other, because the point of
 * the section is that they lead together. On a phone they stay side by side,
 * at half the width each, rather than becoming two screens of scroll.
 *
 * THE LINE RUNS THROUGH IT. It sits between the story and the cream stations,
 * so it carries the page's rose thread on from AboutThread to AboutStations
 * the way every other section here does, scrubbed by the reader's own scroll.
 *
 * Names, titles, lines and portraits are the landing page's `team.chairman`
 * and `team.director`, passed in by the route, so they are edited in one
 * place in /admin. Only the heading and standfirst are this page's.
 */

export function AboutFamily({
  content,
  people,
}: {
  content: AboutPageContent["family"];
  people: [TeamMember, TeamMember];
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.threadPath}`, rootEl, {
      scrub: true,
      start: "top 80%",
      end: "bottom 80%",
    });

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Uncovered from the bottom edge, the way the story's plate is.
    maskReveal(`.${styles.portrait}`, rootEl, {
      from: "bottom",
      duration: 1.3,
      stagger: 0.14,
      start: "top 70%",
    });

    revealOnEnter(`.${styles.pair} [data-reveal]`, rootEl, {
      start: "top 70%",
      stagger: 0.07,
      delay: 0.2,
    });
  }, []);

  const [first, second] = people;

  return (
    <section ref={root} className={styles.section} aria-labelledby="family-title">
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
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>
          <h2 id="family-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>
        </div>

        <div className={styles.pair}>
          <Person person={first} />
          <span className={styles.amp} aria-hidden="true" data-reveal="up">
            &amp;
          </span>
          <Person person={second} />
        </div>
      </div>
    </section>
  );
}

function Person({ person }: { person: TeamMember }) {
  return (
    <figure className={styles.person}>
      {/* 2:3, the shape both portraits were shot in. At that ratio a
          portrait the CMS has flagged as a cut-out (and so sets with
          `contain`) fills its box exactly as a photograph does, and the
          two stand at the same size. */}
      <PortraitPlate
        className={styles.portrait}
        image={person.portrait}
        name={person.name}
        ratio="2 / 3"
        sizes="(max-width: 47.99rem) 42vw, 19rem"
      />
      <figcaption className={styles.caption}>
        <span className={styles.name} data-reveal="up">
          {person.name}
        </span>
        <span className={`u-label ${styles.role}`} data-reveal="up">
          {person.title}
        </span>
        {person.superpower ? (
          <span className={styles.line} data-reveal="up">
            {person.superpower}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default AboutFamily;
