"use client";

import { useRef, useState } from "react";
import type { ProseDoc } from "@/lib/pages";
import {
  gsap,
  maskReveal,
  revealOnEnter,
  scrubProgress,
  trackSections,
  useGsapScope,
} from "@/lib/motion";
import styles from "./GrievanceProcedure.module.css";

/**
 * /grievance-redressal — the procedure itself.
 *
 * WHAT THIS REPLACES. `ProseDoc` inside a generic `PageSection` — the same
 * component, in the same wrapper, that /terms and /disclaimer also used, so
 * all three legal pages were one page with three sets of words in it. They are
 * not the same document: this one is a PROCEDURE with steps and deadlines, the
 * terms are an agreement read once, and the disclaimer is a set of separate
 * notices. Three shapes, three layouts.
 *
 * THIS ONE IS A REGISTER. A numbered clause index down the left, sticky, that
 * lights the clause under the reading line; the clauses themselves at a strict
 * measure with their numerals hung in the margin; and a progress rule that
 * fills across the head of the document as it is read. Somebody on this page
 * is looking for one specific clause — usually "how long will this take" — and
 * every part of the layout is there to get them to it.
 *
 * THE INDEX IS REAL NAVIGATION, not an ornament: each entry is an anchor to
 * its clause, so the rail works with no JavaScript at all. `trackSections`
 * only adds the lit state, and it is the same primitive that lights a station
 * on /about — one behaviour, two layouts that look nothing alike.
 *
 * THE MOTION IS DELIBERATELY SMALL. A statutory procedure that animated like a
 * portfolio would be a page that had misunderstood itself. What moves: the
 * rail's lit mark, the progress rule, and each clause ruled open as it is
 * reached. Nothing travels, nothing scales, nothing parallaxes.
 */

export function GrievanceProcedure({
  doc,
  contentsLabel = "Clauses",
}: {
  doc: ProseDoc;
  contentsLabel?: string;
}) {
  const root = useRef<HTMLElement | null>(null);
  const [current, setCurrent] = useState(-1);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.intro} > [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.08,
    });

    maskReveal(`.${styles.clauseRule}`, rootEl, {
      from: "left",
      duration: 0.9,
      start: "top 86%",
    });

    revealOnEnter(`.${styles.clause} [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.05,
    });

    revealOnEnter(`.${styles.closing} [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });

    // The progress rule across the head of the document.
    const bar = rootEl.querySelector<HTMLElement>(`.${styles.progressFill}`);
    const body = rootEl.querySelector<HTMLElement>(`.${styles.clauses}`);
    let progress: ReturnType<typeof scrubProgress> | undefined;
    if (bar && body) {
      progress = scrubProgress(
        body,
        (value) => gsap.set(bar, { scaleX: value }),
        { start: "top 60%", end: "bottom 80%" },
      );
    }

    const clauses = Array.from(
      rootEl.querySelectorAll<HTMLElement>(`.${styles.clause}`),
    );
    const untrack = trackSections(clauses, setCurrent);

    return () => {
      progress?.kill();
      untrack();
    };
  }, [doc.clauses.length]);

  return (
    <section ref={root} className={styles.section}>
      <div className={`u-shell ${styles.inner}`}>
        <div className="p-withRail">
          {/* ---- The clause index ---- */}
          <nav className={`p-rail ${styles.rail}`} aria-label={contentsLabel}>
            <p className={`u-label ${styles.railLabel}`}>{contentsLabel}</p>

            <ol className={styles.railList}>
              {doc.clauses.map((clause, index) => (
                <li key={clause.id}>
                  <a
                    className={styles.railLink}
                    href={`#${clause.id}`}
                    data-current={current === index}
                    aria-current={current === index ? "true" : undefined}
                  >
                    <span className={`p-numeral ${styles.railNumber}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.railText}>{clause.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ---- The document ---- */}
          <div className={styles.document}>
            <div className={styles.progress} aria-hidden="true">
              <span className={styles.progressFill} />
            </div>

            <div className={styles.intro}>
              {doc.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} data-reveal="up">
                  {paragraph}
                </p>
              ))}
            </div>

            <ol className={styles.clauses}>
              {doc.clauses.map((clause, index) => (
                <li key={clause.id} id={clause.id} className={styles.clause}>
                  <span className={styles.clauseRule} aria-hidden="true" />

                  <div className={styles.clauseHead}>
                    <span
                      className={`p-numeral ${styles.clauseNumber}`}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className={styles.clauseHeading} data-reveal="up">
                      {clause.heading}
                    </h2>
                  </div>

                  <div className={styles.clauseBody}>
                    {clause.body?.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)} data-reveal="up">
                        {paragraph}
                      </p>
                    ))}

                    {clause.list ? (
                      <ul className={styles.list} data-reveal="up">
                        {clause.list.map((point) => (
                          <li key={point.slice(0, 40)}>{point}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            {doc.closing ? (
              <div className={styles.closing}>
                <p data-reveal="up">{doc.closing}</p>

                {doc.cta ? (
                  <p data-reveal="up">
                    <a className={styles.cta} href={doc.cta.href}>
                      <span>{doc.cta.label}</span>
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
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GrievanceProcedure;
