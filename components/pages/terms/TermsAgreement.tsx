"use client";

import { useRef } from "react";
import type { PageHeroContent, ProseDoc } from "@/lib/pages";
import {
  gsap,
  maskReveal,
  revealOnEnter,
  scrubProgress,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./TermsAgreement.module.css";

/**
 * /terms — the agreement, read once, start to finish.
 *
 * THE THIRD OF THREE LEGAL PAGES, AND THE THIRD SHAPE. /grievance-redressal is
 * a register: somebody arrives looking for ONE clause, so it gets a sticky
 * index and a narrow column. /disclaimer is a set of separate notices, so it
 * gets a field of cards. This is neither — an agreement is read through in
 * order, by somebody who has decided to read it, and it is the only one of the
 * three that has a beginning and an end.
 *
 * SO IT ANNOUNCES ITSELF WHOLE. The contents are IN THE OPENING, laid across
 * the full width, every clause visible before a word of the agreement is read.
 * That is what an agreement does — it tells you what it is going to cover —
 * and it is the opposite of the register's approach, which hides the list in a
 * rail and expects you to hunt.
 *
 * THEN IT RUNS IN TWO COLUMNS. Each clause holds its heading in the left
 * column while its own body scrolls past in the right: the heading is sticky
 * WITHIN ITS CLAUSE, so you always know which clause you are inside, and it
 * releases at the clause boundary rather than following you into the next one.
 * No global rail, because there is nothing to navigate — you are reading it
 * through.
 *
 * ONE PROGRESS RULE, at the very top, because the only question a reader of an
 * agreement has is how much is left.
 */

export function TermsAgreement({
  hero,
  doc,
  contentsLabel = "What this covers",
  updatedLabel = "Last updated",
}: {
  hero: PageHeroContent;
  doc: ProseDoc;
  contentsLabel?: string;
  updatedLabel?: string;
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

    maskReveal(`.${styles.contentsRule}`, rootEl, {
      from: "left",
      duration: 1.2,
      delay: 0.25,
    });

    revealOnEnter(`.${styles.contentsItem}`, rootEl, {
      start: "top 92%",
      stagger: 0.04,
      delay: 0.35,
    });

    revealOnEnter(`.${styles.intro} > [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.08,
    });

    maskReveal(`.${styles.clauseRule}`, rootEl, {
      from: "left",
      duration: 0.9,
      start: "top 88%",
    });

    revealOnEnter(`.${styles.clause} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.05,
    });

    revealOnEnter(`.${styles.closing} [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });

    const bar = rootEl.querySelector<HTMLElement>(`.${styles.progressFill}`);
    if (!bar) return;
    const progress = scrubProgress(
      rootEl,
      (value) => gsap.set(bar, { scaleX: value }),
      { start: "top top", end: "bottom bottom" },
    );
    return () => progress.kill();
  }, [doc.clauses.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      {/* How much is left. Pinned to the masthead for the whole document. */}
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.progressFill} />
      </div>

      <div className={`u-shell ${styles.inner}`}>
        {/* ---- The opening ---- */}
        <header className={styles.opening}>
          <div className={styles.stack}>
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {hero.label}
            </p>

            <h1 id="page-title" className={`u-h1 ${styles.heading}`} data-reveal="up">
              <Swash heading={hero.heading} />
            </h1>

            <p className={styles.standfirst} data-reveal="up">
              {hero.standfirst}
            </p>

            <p className={`u-caption ${styles.updated}`} data-reveal="up">
              <span className={styles.updatedTerm}>{updatedLabel}</span>
              <span className={styles.updatedValue}>{doc.updated}</span>
            </p>
          </div>

          {/* The contents, across the full width. An agreement says what it
              is going to cover before it covers it. */}
          <nav className={styles.contents} aria-label={contentsLabel}>
            <p className={`u-label ${styles.contentsLabel}`}>{contentsLabel}</p>
            <span className={styles.contentsRule} aria-hidden="true" />

            <ol className={styles.contentsList}>
              {doc.clauses.map((clause, index) => (
                <li key={clause.id} className={styles.contentsItem} data-reveal="up">
                  <a className={styles.contentsLink} href={`#${clause.id}`}>
                    <span className={`p-numeral ${styles.contentsNumber}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.contentsText}>{clause.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {/* ---- The agreement ---- */}
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

              {/* Sticky WITHIN the clause: it holds while its own body runs
                  past and lets go at the next clause, so the heading on screen
                  is always the heading of what you are reading. */}
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
    </section>
  );
}

export default TermsAgreement;
