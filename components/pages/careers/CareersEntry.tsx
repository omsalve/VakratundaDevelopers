"use client";

import { useRef } from "react";
import type { CardItem, LedgerBand } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import {
  drawOnEnter,
  maskReveal,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./CareersEntry.module.css";

/**
 * /careers — the open roles, and how joining actually works.
 *
 * THE ROLES ARE THE ONLY THING ON THIS PAGE THAT IS ACTIONABLE, so they are
 * the only thing set at heading scale on the light ground: big ruled rows, the
 * title in the display face, the department and location as a dateline, and
 * the standing on the right. A row with an `href` reads as a door; a row
 * without one says so plainly rather than looking clickable.
 *
 * THE PROCESS IS A STEPPER LAID ACROSS, not down. Every other set of steps on
 * this site descends — /nri-corner's four stages, /about's four stations, the
 * staircase above. This one runs horizontally with its connectors drawn
 * between the nodes, because it is short, finite, and the point is that you
 * can see the whole of it at once: somebody deciding whether to apply wants to
 * know how many conversations it is before they start, not to scroll through
 * them.
 *
 * So the page has a vertical figure and a horizontal one, and they close it in
 * that order — the climb, then the door, then the walk through it.
 */

export function CareersEntry({
  roles,
  process,
}: {
  roles: LedgerBand;
  process: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} [data-reveal]`, rootEl, { stagger: 0.09 });

    maskReveal(`.${styles.roleRule}`, rootEl, {
      from: "left",
      duration: 0.9,
      stagger: 0.08,
      start: "top 88%",
    });

    revealOnEnter(`.${styles.role} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.05,
      delay: 0.1,
    });

    // The stepper's connectors are drawn left to right, in order.
    drawOnEnter(`.${styles.stepLinePath}`, rootEl, {
      duration: 0.8,
      start: "top 84%",
      stagger: 0.14,
    });

    revealOnEnter(`.${styles.step} [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.08,
    });
  }, [roles.entries.length, process.items.length]);

  return (
    <section ref={root} className={`on-cream ${styles.section}`}>
      <div className={`u-shell ${styles.inner}`}>
        {/* ---- The roles ---- */}
        <div aria-labelledby="roles-title">
          <div className={styles.head}>
            {roles.label ? (
              <p className={`u-label ${styles.label}`} data-reveal="up">
                {roles.label}
              </p>
            ) : null}
            <h2 id="roles-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
              <Swash heading={roles.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {roles.standfirst}
            </p>
          </div>

          <ul className={styles.roles}>
            {roles.entries.map((entry) => (
              <li key={entry.id} className={styles.role}>
                <span className={styles.roleRule} aria-hidden="true" />

                {entry.href ? (
                  <a className={`p-row ${styles.roleLink}`} href={entry.href}>
                    <RoleBody entry={entry} />
                  </a>
                ) : (
                  <div className={styles.roleStatic}>
                    <RoleBody entry={entry} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {roles.note ? (
            <p className={`u-caption ${styles.note}`} data-reveal="up">
              {roles.note}
            </p>
          ) : null}
        </div>

        {/* ---- The process ---- */}
        <div aria-labelledby="process-title">
          <div className={styles.head}>
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {process.label}
            </p>
            <h2 id="process-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
              <Swash heading={process.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {process.standfirst}
            </p>
          </div>

          <ol className={styles.stepper}>
            {process.items.map((item, index) => (
              <li key={item.id} className={styles.step}>
                <div className={styles.stepMark}>
                  <span className={`p-numeral ${styles.stepNumber}`} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* The run to the next node. The last step has nowhere to
                      go, which is how a stepper shows it is the end. */}
                  {index < process.items.length - 1 ? (
                    <svg
                      className={styles.stepLine}
                      viewBox="0 0 100 2"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        className={styles.stepLinePath}
                        d="M0 1 L100 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        fill="none"
                      />
                    </svg>
                  ) : null}
                </div>

                <h3 className={styles.stepTitle} data-reveal="up">
                  {item.title}
                </h3>
                <p className={styles.stepBody} data-reveal="up">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** The inside of a role row, shared by the linked and unlinked shapes. */
function RoleBody({ entry }: { entry: LedgerBand["entries"][number] }) {
  return (
    <>
      <span className={`u-label ${styles.roleMeta}`} data-reveal="up">
        {entry.meta}
      </span>

      <span className={styles.roleMain} data-reveal="up">
        <span className={styles.roleTitle}>{entry.title}</span>
        {entry.note ? (
          <span className={styles.roleNote}>{entry.note}</span>
        ) : null}
      </span>

      {entry.href ? (
        <span className={styles.roleAction} data-reveal="up">
          <span>{entry.action ?? "Apply"}</span>
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
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      ) : entry.state ? (
        <span className={styles.roleState} data-reveal="up">
          {entry.state}
        </span>
      ) : null}
    </>
  );
}

export default CareersEntry;
