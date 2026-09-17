"use client";

import { useRef } from "react";
import type { LedgerBand, LedgerEntry } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import { gsap, maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./PressWire.module.css";

/**
 * /press — the coverage, and the desk to write to.
 *
 * WHAT THIS REPLACES. Two `LedgerList`s in two `PageSection`s — the same
 * component /awards, /careers, /investors and /contact all used, so a press
 * cutting looked exactly like an open job and a downloadable PDF.
 *
 * SET AS A BROADSHEET. Cuttings run in two columns with a rule between them,
 * each item a dateline, a headline and its source — the shape a wire item has
 * actually had for a century, and one that lets a reader skim sources rather
 * than dates. That is the right bias here and the wrong one on /awards, where
 * the year is the only ordering that matters and is therefore set large.
 *
 * ⚠️ PLACEHOLDER COPY. The entries carry no `href` — see the notice at the
 * head of lib/pages/newsroom.ts. A row with no link ends in its `state`, set
 * as a struck mark, so nothing on the page pretends to lead to a cutting that
 * has not been published.
 *
 * THE ENQUIRIES BAND IS NOT A THIRD LEDGER. It is a short ruled register of
 * who to write to, set against the coverage rather than under it, because a
 * journalist on deadline should not have to scroll past the archive to find
 * the desk.
 */

function WireItem({ entry }: { entry: LedgerEntry }) {
  return (
    <li className={styles.item}>
      <span className={styles.itemRule} aria-hidden="true" />

      <p className={`u-label ${styles.itemDateline}`} data-reveal="up">
        {entry.meta}
      </p>

      <h3 className={styles.itemTitle} data-reveal="up">
        {entry.href ? (
          <a className={`p-row ${styles.itemLink}`} href={entry.href}>
            {entry.title}
          </a>
        ) : (
          entry.title
        )}
      </h3>

      {entry.note ? (
        <p className={styles.itemSource} data-reveal="up">
          {entry.note}
        </p>
      ) : null}

      {entry.href ? (
        <p className={styles.itemAction} data-reveal="up">
          {entry.action ?? "Read"}
        </p>
      ) : entry.state ? (
        <p className={styles.itemState} data-reveal="up">
          {entry.state}
        </p>
      ) : null}
    </li>
  );
}

export function PressWire({
  coverage,
  enquiries,
}: {
  coverage: LedgerBand;
  enquiries: { heading: SwashHeading; standfirst: string; entries: LedgerEntry[] };
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Items print in: the rule sets first, the type comes up behind it. Fast
    // and tight, because a wire feed arrives rather than unfolds.
    maskReveal(`.${styles.itemRule}`, rootEl, {
      from: "left",
      duration: 0.7,
      stagger: 0.06,
      start: "top 88%",
    });

    revealOnEnter(`.${styles.item} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.04,
      delay: 0.1,
    });

    // The column rule between the two columns of cuttings.
    gsap.fromTo(
      `.${styles.columnRule}`,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: rootEl, start: "top 80%", once: true },
      },
    );

    revealOnEnter(`.${styles.desk} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.06,
    });
  }, [coverage.entries.length, enquiries.entries.length]);

  return (
    <section ref={root} className={styles.section}>
      <div className={`u-shell ${styles.inner}`}>
        {/* ---- Coverage ---- */}
        <div className={styles.coverage} aria-labelledby="coverage-title">
          <div className={styles.head}>
            {coverage.label ? (
              <p className={`u-label ${styles.label}`} data-reveal="up">
                {coverage.label}
              </p>
            ) : null}
            <h2
              id="coverage-title"
              className={`u-h2 ${styles.heading}`}
              data-reveal="up"
            >
              <Swash heading={coverage.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {coverage.standfirst}
            </p>
          </div>

          <div className={styles.columns}>
            <span className={styles.columnRule} aria-hidden="true" />

            <ul className={styles.items}>
              {coverage.entries.map((entry) => (
                <WireItem key={entry.id} entry={entry} />
              ))}
            </ul>
          </div>

          {coverage.note ? (
            <p className={`u-caption ${styles.note}`} data-reveal="up">
              {coverage.note}
            </p>
          ) : null}
        </div>

        {/* ---- The desk ---- */}
        <aside className={styles.desk} aria-labelledby="enquiries-title">
          <h2 id="enquiries-title" className={`u-h3 ${styles.deskHeading}`} data-reveal="up">
            <Swash heading={enquiries.heading} />
          </h2>

          <p className={styles.deskStandfirst} data-reveal="up">
            {enquiries.standfirst}
          </p>

          <ul className={styles.deskList}>
            {enquiries.entries.map((entry) => (
              <li key={entry.id} className={styles.deskRow} data-reveal="up">
                <span className={`u-label ${styles.deskTerm}`}>{entry.meta}</span>

                <span className={styles.deskValue}>
                  {entry.href ? (
                    <a className={styles.deskLink} href={entry.href}>
                      {entry.title}
                    </a>
                  ) : (
                    <span>{entry.title}</span>
                  )}
                  {entry.note ? (
                    <span className={styles.deskNote}>{entry.note}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default PressWire;
