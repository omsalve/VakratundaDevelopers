"use client";

import { useRef } from "react";
import type { Cta } from "@/lib/content";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./SectionCoda.module.css";

/**
 * The sentence that covers a whole band, with the one action worth taking
 * beside it.
 *
 * BOTH HALVES ARE QUOTED, NOT INVENTED. The sentence is Responsibility's coda,
 * set the way that section sets it — display face, italic, ranged to the far
 * edge of the field, because a line that covers everything above it cannot sit
 * under any one part of it. The action is Journey's ghost pill, unchanged: a
 * rose hairline that fills from the left on hover with the label inverting to
 * navy.
 */

export function SectionCoda({ text, cta }: { text: string; cta?: Cta }) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter(`.${styles.row} > [data-reveal]`, root.current, {
      start: "top 92%",
      stagger: 0.1,
    });
  }, []);

  return (
    <div ref={root} className={styles.row}>
      <p className={styles.coda} data-reveal="up">
        {text}
      </p>

      {cta ? (
        <p className={styles.action} data-reveal="up">
          <a className={styles.cta} href={cta.href}>
            <span>{cta.label}</span>
            <svg
              className={styles.ctaIcon}
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
  );
}

export default SectionCoda;
