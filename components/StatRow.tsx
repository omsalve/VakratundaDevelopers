"use client";

import { useRef } from "react";
import type { Stat } from "@/lib/pages";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./StatRow.module.css";

/**
 * The figures, ruled across the field.
 *
 * SAME COUNT-UP THE LEGACY LATTICE USES on the landing page, and the same
 * restraint about it: the number counts once, on arrival, and only where it
 * is a number. `--dur` is not involved — the count is a GSAP tween over the
 * value itself, rounded on each tick, so it lands exactly on the figure that
 * was written rather than near it.
 *
 * A figure that cannot be counted (a ratio, a phrase) is set as written; the
 * component decides that from the data, not from a prop.
 */

const COUNTABLE = /^[\d.,]+$/;

export function StatRow({ stats }: { stats: Stat[] }) {
  const root = useRef<HTMLUListElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.stat}`, rootEl, {
      start: "top 86%",
      stagger: 0.08,
    });

    for (const figure of rootEl.querySelectorAll<HTMLElement>(
      `.${styles.value}`,
    )) {
      const target = Number(figure.dataset.value);
      if (!Number.isFinite(target)) continue;

      // One decimal where the written figure has one, none where it does not:
      // counting "2.1" up through "1" and landing on "2" would be a different
      // claim for most of the tween.
      const decimals = (figure.dataset.decimals ?? "0") === "1" ? 1 : 0;
      const counter = { n: 0 };

      gsap.to(counter, {
        n: target,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: rootEl, start: "top 82%", once: true },
        onUpdate: () => {
          figure.textContent = counter.n.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
        },
      });
    }
  }, [stats.length]);

  return (
    <ul ref={root} className={styles.row}>
      {stats.map((stat) => {
        const countable = COUNTABLE.test(stat.value);
        const numeric = Number(stat.value.replace(/,/g, ""));

        return (
          <li key={stat.id} className={styles.stat} data-reveal="up">
            <p className={styles.figure}>
              <span
                className={`u-numeral ${styles.value}`}
                data-value={countable ? numeric : undefined}
                data-decimals={stat.value.includes(".") ? "1" : "0"}
              >
                {stat.value}
              </span>
              {stat.suffix ? (
                <span className={styles.suffix}>{stat.suffix}</span>
              ) : null}
              {stat.unit ? (
                <span className={styles.unit}>{stat.unit}</span>
              ) : null}
            </p>
            <p className={styles.note}>{stat.note}</p>
          </li>
        );
      })}
    </ul>
  );
}

export default StatRow;
