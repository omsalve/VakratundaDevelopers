"use client";

import { useRef } from "react";
import type { CardItem, LedgerBand } from "@/lib/pages";
import type { Cta, SwashHeading } from "@/lib/content";
import { maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./InvestorsRecord.module.css";

/**
 * /investors — governance, and the documents.
 *
 * GOVERNANCE IS A TABLE, NOT A CARD GRID. Each commitment is a term and what
 * it means, ruled across the full width in two columns — the shape a schedule
 * to an agreement has. Cards would have made four independent claims of equal
 * weight floating in space; a ruled register makes them a set of undertakings
 * that can be read straight down, which is what they are.
 *
 * THE DOCUMENTS ARE A FILING LIST. Monospaced-feeling reference in the left
 * column, the document's name in the middle, and its standing on the right —
 * a row either resolves to a file or says plainly that it is on request. This
 * is the one ledger on the site where the ACTION is the point, so it is the
 * only one that sets the action at full strength rather than as a quiet mark.
 *
 * ⚠️ Rows without an `href` carry a `state` instead. The shipped content marks
 * several as available on request rather than linking to files that are not
 * published; nothing here manufactures a download.
 */

export function InvestorsRecord({
  governance,
  documents,
  coda,
  cta,
}: {
  governance: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  documents: LedgerBand;
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
      duration: 0.85,
      stagger: 0.07,
      start: "top 88%",
    });

    revealOnEnter(`.${styles.row} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.04,
      delay: 0.1,
    });

    revealOnEnter(`.${styles.close} > [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });
  }, [governance.items.length, documents.entries.length]);

  return (
    <section ref={root} className={`on-cream ${styles.section}`}>
      <div className={`u-shell ${styles.inner}`}>
        {/* ---- Governance ---- */}
        <div aria-labelledby="governance-title">
          <div className={styles.head}>
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {governance.label}
            </p>
            <h2
              id="governance-title"
              className={`u-h2 ${styles.heading}`}
              data-reveal="up"
            >
              <Swash heading={governance.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {governance.standfirst}
            </p>
          </div>

          <dl className={styles.schedule}>
            {governance.items.map((item) => (
              <div key={item.id} className={styles.row}>
                <span className={styles.rowRule} aria-hidden="true" />

                <dt className={styles.term} data-reveal="up">
                  {item.eyebrow ? (
                    <span className={`u-label ${styles.termEyebrow}`}>
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
        </div>

        {/* ---- Documents ---- */}
        <div aria-labelledby="documents-title">
          <div className={styles.head}>
            {documents.label ? (
              <p className={`u-label ${styles.label}`} data-reveal="up">
                {documents.label}
              </p>
            ) : null}
            <h2
              id="documents-title"
              className={`u-h2 ${styles.heading}`}
              data-reveal="up"
            >
              <Swash heading={documents.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {documents.standfirst}
            </p>
          </div>

          <ul className={styles.filing}>
            {documents.entries.map((entry) => (
              <li key={entry.id} className={styles.row}>
                <span className={styles.rowRule} aria-hidden="true" />

                <span className={`p-numeral ${styles.reference}`} data-reveal="up">
                  {entry.meta}
                </span>

                <span className={styles.file} data-reveal="up">
                  <span className={styles.fileTitle}>{entry.title}</span>
                  {entry.note ? (
                    <span className={styles.fileNote}>{entry.note}</span>
                  ) : null}
                </span>

                {entry.href ? (
                  <a className={styles.download} href={entry.href} data-reveal="up">
                    <span>{entry.action ?? "Download"}</span>
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 4v12M7 12l5 5 5-5M5 20h14" />
                    </svg>
                  </a>
                ) : entry.state ? (
                  <span className={styles.state} data-reveal="up">
                    {entry.state}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className={styles.close}>
            {documents.note ? (
              <p className={`u-caption ${styles.note}`} data-reveal="up">
                {documents.note}
              </p>
            ) : null}

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
      </div>
    </section>
  );
}

export default InvestorsRecord;
