"use client";

import { useRef } from "react";
import clsx from "clsx";
import type { CardItem } from "@/lib/pages";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import ResponsibilityIcons from "./ResponsibilityIcons";
import styles from "./CardGrid.module.css";

/**
 * The card, as the site already draws one: a hairline ruled across the top,
 * the drawing or the eyebrow on it, the title, the detail. No panel, no
 * border box, no radius, no shadow — the same rule Responsibility states and
 * the whole site keeps: the only containers are hairlines, and the only
 * filled shapes are photographs.
 *
 * ONE COMPONENT, THREE SHAPES, chosen by the data rather than by a prop: an
 * icon card when `icon` is set (the four environment drawings), a ruled entry
 * when `eyebrow` is set (Vision / Mission, or a place), and a plain pair when
 * neither is. A fourth shape would need its own section, not a mode here.
 *
 * MOTION IS THE HOUSE ENTRANCE. The cards reveal on the grid's own trigger,
 * and the drawings are inked last with the same one-tween trick Responsibility
 * uses — every path carries `pathLength={1}`, so nothing is measured.
 * `resetKey` re-runs the whole scope when a caller filters the list; the GSAP
 * context reverts first, so no card can be stranded mid-tween.
 */

export function CardGrid({
  items,
  columns = 2,
  resetKey,
  className,
}: {
  items: CardItem[];
  /** Widest-viewport track count. It halves at 64rem and stacks at 48rem. */
  columns?: 2 | 3 | 4;
  resetKey?: string;
  className?: string;
}) {
  const root = useRef<HTMLUListElement | null>(null);

  useGsapScope(
    root,
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      revealOnEnter(`.${styles.card}`, rootEl, {
        start: "top 84%",
        stagger: 0.07,
      });

      if (rootEl.querySelector(`.${styles.icon} path`)) {
        gsap.to(`.${styles.icon} path`, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power1.inOut",
          stagger: 0.05,
          scrollTrigger: { trigger: rootEl, start: "top 78%", once: true },
        });
      }
    },
    [resetKey, items.length],
  );

  return (
    <ul
      ref={root}
      className={clsx(styles.grid, styles[`cols${columns}`], className)}
    >
      {items.map((item) => (
        <li key={item.id} className={styles.card} data-reveal="up">
          {item.icon ? (
            <span className={styles.icon}>
              <ResponsibilityIcons name={item.icon} />
            </span>
          ) : null}

          {item.eyebrow ? (
            <p className={`u-label ${styles.eyebrow}`}>{item.eyebrow}</p>
          ) : null}

          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.body}>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

export default CardGrid;
