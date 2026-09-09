"use client";

import { useRef } from "react";
import type { FaqItem } from "@/lib/pages";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./FaqList.module.css";

/**
 * Questions and their answers, as disclosures.
 *
 * BUILT ON `<details>`, NOT ON STATE. The element already gives the whole
 * interaction — keyboard operation, the open/closed state exposed to
 * assistive technology, find-in-page that opens the section it lands in — and
 * every line of that is lost the moment it is rebuilt out of a button and a
 * `useState`. The only thing this component adds is the site's own type and
 * hairlines, and the entrance the rest of the page uses.
 *
 * THE FIRST IS OPEN. A stack of closed rows reads as a wall; one open answer
 * shows what is behind the others and sets the height of the thing being
 * opened.
 */

export function FaqList({ items }: { items: FaqItem[] }) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter(`.${styles.item}`, root.current, {
      start: "top 88%",
      stagger: 0.06,
    });
  }, [items.length]);

  return (
    <div ref={root} className={styles.list}>
      {items.map((item, index) => (
        <details
          key={item.id}
          className={styles.item}
          data-reveal="up"
          open={index === 0}
        >
          <summary className={styles.summary}>
            <span className={styles.question}>{item.question}</span>
            <span className={styles.marker} aria-hidden="true" />
          </summary>

          <div className={styles.answer}>
            {item.answer.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default FaqList;
