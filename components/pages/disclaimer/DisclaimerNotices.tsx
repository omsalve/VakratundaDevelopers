"use client";

import { useRef } from "react";
import type { PageHeroContent, ProseDoc } from "@/lib/pages";
import {
  drawOnEnter,
  gsap,
  maskReveal,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./DisclaimerNotices.module.css";

/**
 * /disclaimer — a set of separate notices.
 *
 * THE SECOND OF THREE LEGAL PAGES, AND THE SECOND SHAPE. The insight that
 * separates this page from /terms and /grievance-redressal is in the content
 * itself: a disclaimer's clauses are NOT sequential. "Renders are indicative",
 * "areas are carpet areas", "dates are estimates" — each stands entirely on
 * its own, is read in any order, and matters to a different reader. Setting
 * them as clauses 1 to 7 of a document implies a through-line that is not
 * there.
 *
 * SO THEY ARE CARDS, not clauses — a field of separate notices, each ruled in
 * its own box, in two columns that a reader can enter at any point. It is the
 * only legal page on the site with no reading order and no progress rule,
 * because there is nothing to be part-way through.
 *
 * THE OPENING IS CENTRED AND SHORT. /terms opens by laying out nine clauses;
 * /grievance-redressal opens on a ruled register of particulars. This one
 * opens on one sentence and a drawn mark, and then gets out of the way — the
 * notices are the page.
 *
 * THE MARK IS GEOMETRY, NOT AN ICON. A drawn circle with a rule through it,
 * from the same 1.4-stroke hand as ResponsibilityIcons — no warning triangle,
 * no exclamation mark. This site draws; it does not use dingbats.
 */

export function DisclaimerNotices({
  hero,
  doc,
  updatedLabel = "Last updated",
}: {
  hero: PageHeroContent;
  doc: ProseDoc;
  updatedLabel?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.markPath}`, rootEl, { duration: 1.3 });

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.08,
      delay: 0.2,
    });

    revealOnEnter(`.${styles.intro} > [data-reveal]`, rootEl, {
      start: "top 90%",
      stagger: 0.08,
    });

    /* Each notice is uncovered from its top edge and its own rule is drawn
       across it. They arrive in a short stagger rather than one at a time,
       because they are a set rather than a sequence — nothing here is being
       counted off. */
    maskReveal(`.${styles.notice}`, rootEl, {
      from: "top",
      duration: 0.95,
      stagger: 0.07,
      start: "top 86%",
    });

    revealOnEnter(`.${styles.closing} [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });
  }, [doc.clauses.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        {/* ---- The opening ---- */}
        <header className={styles.opening}>
          <span className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path className={styles.markPath} d="M24 4 A20 20 0 1 1 23.9 4" />
              <path className={styles.markPath} d="M24 15 V27" strokeLinecap="round" />
              <path className={styles.markPath} d="M24 33 V33.5" strokeLinecap="round" />
            </svg>
          </span>

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
              <span>{doc.updated}</span>
            </p>
          </div>
        </header>

        <div className={styles.intro}>
          {doc.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} data-reveal="up">
              {paragraph}
            </p>
          ))}
        </div>

        {/* ---- The notices ----
            A <ul>, not an <ol>: these have no order. That is the whole
            argument of the layout, and it should be true in the markup too. */}
        <ul className={styles.notices}>
          {doc.clauses.map((clause) => (
            <li key={clause.id} id={clause.id} className={styles.notice}>
              <h2 className={styles.noticeHeading}>{clause.heading}</h2>

              <div className={styles.noticeBody}>
                {clause.body?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}

                {clause.list ? (
                  <ul className={styles.list}>
                    {clause.list.map((point) => (
                      <li key={point.slice(0, 40)}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

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

export default DisclaimerNotices;
