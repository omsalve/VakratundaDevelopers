"use client";

import { useRef } from "react";
import type { LedgerEntry } from "@/lib/pages";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./LedgerList.module.css";

/**
 * A ledger: rows ruled across the field, each one a date or a year in the
 * left-hand column and the thing it refers to in the right.
 *
 * IT IS THE SITE'S RULE, NOT A TABLE. The landing page's responsibility band
 * carries its second school as a single ruled entry rather than a card,
 * because a list of records is not a set of things to compare — it is a
 * sequence to read down. This is that entry, repeated: one hairline per row,
 * two columns, no zebra striping, no borders down the sides.
 *
 * A ROW WITH NO `href` IS NOT A DEAD LINK. Press cuttings that are not online,
 * documents available on request, roles that are closed — each renders as a
 * statement of record with its `state` set beside it, and nothing on the page
 * invites a click that goes nowhere. That is the whole reason `href` is
 * optional rather than assumed.
 */

export function LedgerList({
  entries,
  note,
}: {
  entries: LedgerEntry[];
  /** The small print under the ledger — where the records are held, usually. */
  note?: string;
}) {
  const root = useRef<HTMLUListElement | null>(null);

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter(`.${styles.row}`, root.current, {
      start: "top 88%",
      stagger: 0.06,
    });
  }, [entries.length]);

  return (
    <ul ref={root} className={styles.list}>
      {entries.map((entry) => {
        const body = (
          <>
            <span className={styles.meta}>{entry.meta}</span>

            <span className={styles.main}>
              <span className={styles.title}>{entry.title}</span>
              {entry.note ? (
                <span className={styles.note}>{entry.note}</span>
              ) : null}
            </span>

            {entry.href ? (
              <span className={styles.action}>
                <span>{entry.action ?? "Read"}</span>
                <svg
                  className={styles.actionIcon}
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
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            ) : entry.state ? (
              <span className={styles.state}>{entry.state}</span>
            ) : null}
          </>
        );

        return (
          <li key={entry.id} className={styles.row} data-reveal="up">
            {entry.href ? (
              <a className={styles.link} href={entry.href}>
                {body}
              </a>
            ) : (
              <div className={styles.static}>{body}</div>
            )}
          </li>
        );
      })}

      {note ? (
        <li className={`u-caption ${styles.note}`} data-reveal="up">
          {note}
        </li>
      ) : null}
    </ul>
  );
}

export default LedgerList;
