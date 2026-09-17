"use client";

import { useRef } from "react";
import type { CardItem } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import { drawOnEnter, gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./NriCrossing.module.css";

/**
 * /nri-corner — the four stages, crossing the meridian.
 *
 * WHAT THIS REPLACES. A two-column `CardGrid`: four hairline boxes side by
 * side, which is how /about, /careers, /investors, /experiences, /hospitality
 * and /sustainability all showed their four-of-something. Four boxes in a grid
 * are four options. These are four STAGES, they happen in order, and the whole
 * value of the page is that the order is survivable from eight thousand
 * kilometres away.
 *
 * THE CROSSING. Stages one and two sit on the departure side of the meridian.
 * Stages three and four sit on the Mumbai side. Between them the line carries
 * a drawn crossing mark — the one place on the page where anything touches the
 * meridian. So the reader does not read about a journey; they make one, and
 * the moment they arrive is the moment the layout changes sides under them.
 *
 * Which stage goes on which side is derived from the COUNT, not hard-coded to
 * four: the set crosses at its own midpoint, so a fifth stage added in /admin
 * puts three on the near side and two on the far side rather than breaking the
 * figure.
 *
 * THE GROUND DOES NOT MOVE. The crossing used to warm from a departure navy
 * toward a lighter one, and the questions below started on the colour it had
 * arrived at — which read as the page being two different shades either side
 * of the meridian rather than as one journey. The field is now the navy the
 * opening is on, the whole way down. What marks the crossing is the line
 * going, not the ground changing under it.
 */

export function NriCrossing({
  label,
  heading,
  standfirst,
  items,
}: {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  items: CardItem[];
}) {
  const root = useRef<HTMLElement | null>(null);

  /* The midpoint. Everything before it is on the departure side. */
  const crossAt = Math.ceil(items.length / 2);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.meridianPath}`, rootEl, {
      scrub: true,
      start: "top 80%",
      end: "bottom 70%",
    });

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Each stage reaches the meridian by a leader drawn out to it, so a stage
    // is attached to the line rather than floating beside it.
    drawOnEnter(`.${styles.leaderPath}`, rootEl, {
      duration: 0.85,
      start: "top 80%",
      stagger: 0.1,
    });

    revealOnEnter(`.${styles.stage} [data-reveal]`, rootEl, {
      start: "top 82%",
      stagger: 0.05,
    });

    // The crossing mark is the one event on the line: it is drawn, then the
    // ring around it opens, and nothing else on the page does either.
    const mark = rootEl.querySelector(`.${styles.cross}`);
    if (mark) {
      drawOnEnter(`.${styles.crossPath}`, mark, {
        duration: 1.1,
        start: "top 78%",
      });
      gsap.fromTo(
        `.${styles.crossRing}`,
        { scale: 0.4, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          delay: 0.2,
          scrollTrigger: { trigger: mark, start: "top 78%", once: true },
        },
      );
    }
  }, [items.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="stages-title">
      <div className={styles.meridian} aria-hidden="true">
        <svg
          className={styles.meridianSvg}
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
        >
          <path
            className={styles.meridianPath}
            d="M1 0 L1 100"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>
      </div>

      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {label}
          </p>
          <h2 id="stages-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <ol className={styles.stages}>
          {items.map((item, index) => {
            const side = index < crossAt ? "near" : "far";
            const isCrossing = index === crossAt;

            return (
              <li key={item.id} className={styles.stageItem} data-side={side}>
                {/* The crossing mark, drawn once, on the line, at the exact
                    point the content changes sides. */}
                {isCrossing ? (
                  <span className={styles.cross} aria-hidden="true">
                    <span className={styles.crossRing} />
                    <svg className={styles.crossSvg} viewBox="0 0 40 40">
                      <path
                        className={styles.crossPath}
                        d="M2 20 H38"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ) : null}

                <article className={styles.stage}>
                  <svg
                    className={styles.leader}
                    viewBox="0 0 100 2"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className={styles.leaderPath}
                      d="M0 1 L100 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      fill="none"
                    />
                  </svg>

                  {/* The stage number is authored (`eyebrow` is "01".."04"),
                      and the list is an <ol>, so the position is already in
                      the semantics — this is the drawn version of it. */}
                  {item.eyebrow ? (
                    <span
                      className={`p-numeral ${styles.number}`}
                      aria-hidden="true"
                    >
                      {item.eyebrow}
                    </span>
                  ) : null}

                  <h3 className={`u-h3 ${styles.title}`} data-reveal="up">
                    {item.title}
                  </h3>
                  <p className={styles.body} data-reveal="up">
                    {item.body}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default NriCrossing;
