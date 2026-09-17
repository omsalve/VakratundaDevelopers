"use client";

import { useRef } from "react";
import type { LedgerBand } from "@/lib/pages";
import { maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./AwardsLedger.module.css";

/**
 * /awards — the citations.
 *
 * SECOND, NOW, AND ON CREAM. This is the page's one change of ground, and it
 * is spent marking the difference between the two halves of the page: the
 * audited standings are in the dark case above, the citations are out in the
 * light where they can be read as what they are.
 *
 * ⚠️ THE ENTRIES ARE PLACEHOLDERS and carry no `href` — see the notice at the
 * head of lib/pages/newsroom.ts. The layout is built so that is not hidden:
 * every row ends in its `state` ("Citation") set as a struck mark rather than
 * in an action, so nothing reads as a link to a press release that does not
 * exist, and the note under the ledger says where the citations actually are.
 *
 * THE YEAR IS THE ROW. Set at heading scale in the display face down the left
 * — because on a page of recognition the only ordering that matters is when,
 * and a reader scanning for "have they done anything lately" should be able to
 * answer it without reading a word of the titles.
 */

export function AwardsLedger({
  band,
  coda,
}: {
  band: LedgerBand;
  coda?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Each row is ruled open, then its type rises behind the rule.
    maskReveal(`.${styles.rowRule}`, rootEl, {
      from: "left",
      duration: 0.9,
      stagger: 0.08,
      start: "top 86%",
    });

    revealOnEnter(`.${styles.row} [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.05,
      delay: 0.12,
    });

    revealOnEnter(`.${styles.close} > [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });
  }, [band.entries.length]);

  return (
    <section
      ref={root}
      className={`on-cream ${styles.section}`}
      aria-labelledby="recognition-title"
    >
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          {band.label ? (
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {band.label}
            </p>
          ) : null}
          <h2
            id="recognition-title"
            className={`u-h2 ${styles.heading}`}
            data-reveal="up"
          >
            <Swash heading={band.heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {band.standfirst}
          </p>
        </div>

        <ol className={styles.ledger}>
          {band.entries.map((entry) => (
            <li key={entry.id} className={styles.row}>
              <span className={styles.rowRule} aria-hidden="true" />

              <span className={`p-numeral ${styles.year}`} data-reveal="up">
                {entry.meta}
              </span>

              <span className={styles.main} data-reveal="up">
                <span className={styles.title}>{entry.title}</span>
                {entry.note ? (
                  <span className={styles.note}>{entry.note}</span>
                ) : null}
              </span>

              {/* A citation is not a link. The row ends in its own standing,
                  struck as a mark, so nothing here pretends to be actionable. */}
              {entry.href ? (
                <a className={styles.action} href={entry.href}>
                  {entry.action ?? "Read"}
                </a>
              ) : entry.state ? (
                <span className={styles.state} data-reveal="up">
                  {entry.state}
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className={styles.close}>
          {band.note ? (
            <p className={`u-caption ${styles.ledgerNote}`} data-reveal="up">
              {band.note}
            </p>
          ) : null}

          {coda ? (
            <p className={styles.coda} data-reveal="up">
              {coda}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default AwardsLedger;
