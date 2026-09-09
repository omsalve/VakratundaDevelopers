"use client";

import { useRef } from "react";
import type { ProseClause, ProseDoc as ProseDocContent } from "@/lib/pages";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./ProseDoc.module.css";

/**
 * A document: clauses in order, at a measure written to be read.
 *
 * THIS IS THE ONE PLACE ON THE SITE THAT IS NOT PERSUADING. Terms, the
 * disclaimer, the grievance procedure and the articles are all read rather
 * than looked at, so the section drops to a single column at
 * `--measure-narrow`, sets its body at `--fs-body` on `--lh-body`, and lets
 * the numbered rail down the left do all the structural work. No pull-quotes,
 * no photographs, no motion beyond the house entrance — a legal clause that
 * animates is a legal clause nobody finishes.
 *
 * THE NUMBERS ARE REAL, NOT DECORATION. Each clause carries an `id`, the
 * contents rail links to it, and the anchors survive being copied out of the
 * address bar — which is the whole reason anyone links to a clause of a terms
 * page in the first place.
 */

export function ProseDoc({
  doc,
  contentsLabel = "Contents",
  updatedLabel = "Last updated",
}: {
  doc: ProseDocContent;
  /** Set to null to drop the rail — a short document does not need one. */
  contentsLabel?: string | null;
  /** "Last updated" for a legal document; "Published" for an article. */
  updatedLabel?: string;
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter(`.${styles.doc} > [data-reveal]`, root.current, {
      start: "top 88%",
      stagger: 0.05,
    });
  }, []);

  return (
    <div ref={root} className={`u-shell ${styles.field}`}>
      {contentsLabel ? (
        <nav className={styles.contents} aria-label={contentsLabel}>
          <p className={`u-label ${styles.contentsLabel}`}>{contentsLabel}</p>
          <ol className={styles.contentsList}>
            {doc.clauses.map((clause, index) => (
              <li key={clause.id}>
                <a className={styles.contentsLink} href={`#${clause.id}`}>
                  <span className={`u-numeral ${styles.contentsNumber}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {clause.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className={styles.doc}>
        <p className={styles.updated} data-reveal="up">
          {updatedLabel} {doc.updated}
        </p>

        {doc.intro.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className={styles.intro}
            data-reveal="up"
          >
            {paragraph}
          </p>
        ))}

        {doc.clauses.map((clause, index) => (
          <Clause key={clause.id} clause={clause} index={index} />
        ))}

        {doc.closing ? (
          <p className={styles.closing} data-reveal="up">
            {doc.closing}
          </p>
        ) : null}

        {doc.cta ? (
          <p data-reveal="up">
            <a className={styles.cta} href={doc.cta.href}>
              {doc.cta.label}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Clause({ clause, index }: { clause: ProseClause; index: number }) {
  return (
    <section className={styles.clause} id={clause.id} data-reveal="up">
      <h2 className={styles.clauseHeading}>
        <span className={`u-numeral ${styles.clauseNumber}`} aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        {clause.heading}
      </h2>

      {clause.body?.map((paragraph) => (
        <p key={paragraph.slice(0, 40)} className={styles.para}>
          {paragraph}
        </p>
      ))}

      {clause.list ? (
        <ul className={styles.points}>
          {clause.list.map((point) => (
            <li key={point.slice(0, 40)} className={styles.point}>
              {point}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default ProseDoc;
