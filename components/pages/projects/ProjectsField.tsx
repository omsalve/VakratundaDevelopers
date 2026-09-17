"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { ProjectSlide, ProjectStatus } from "@/lib/content";
import { gsap, maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./ProjectsField.module.css";

const STAGES: ProjectStatus[] = ["Ongoing", "Upcoming", "Completed"];

type Stage = ProjectStatus | "all";

/**
 * /projects — the field of work.
 *
 * WHAT THIS REPLACES. A three-column grid of identical cards under a row of
 * filter pills. Uniform cards say every project is the same size and the same
 * importance, which is exactly what a portfolio must not say, and a filter row
 * that scrolls away leaves the visitor with no way back to it.
 *
 * THE RHYTHM. Entries take four different widths in a repeating four-beat
 * figure, alternating which edge of the grid they hang off. It is a drawing
 * index, not a product listing: the eye is meant to travel down the page in a
 * zig-zag rather than to compare tiles row by row. The rhythm is set by
 * position, so it survives filtering — a filtered set re-flows into the same
 * four beats rather than collapsing into a column of identical cards.
 *
 * THE RAIL STAYS. The status filter is a sticky rail, not a row: on a page
 * that can run to thirty addresses, the control that narrows them has to be
 * reachable from anywhere in the set. It carries the counts, so choosing a
 * status is never a guess at whether anything is filed under it.
 *
 * THE NUMBERS ARE THE INDEX'S OWN and are decorative: they count the visitor's
 * current view, so they renumber when the set is filtered. That is right for a
 * drawing index and wrong for a catalogue reference, which is why they are
 * `aria-hidden` — the name and the status are the addressable facts.
 */

export function ProjectsField({
  slides,
  filterLabel,
  allLabel,
  emptyMessage,
  note,
}: {
  slides: ProjectSlide[];
  filterLabel: string;
  allLabel: string;
  emptyMessage: string;
  note?: string;
}) {
  const [stage, setStage] = useState<Stage>("all");
  const root = useRef<HTMLDivElement | null>(null);

  /* Only the stages actually present get a button — a filter that offers an
     empty result is a dead control. */
  const stages = useMemo(
    () => STAGES.filter((s) => slides.some((slide) => slide.status === s)),
    [slides],
  );

  const shown = useMemo(
    () =>
      stage === "all"
        ? slides
        : slides.filter((slide) => slide.status === stage),
    [slides, stage],
  );

  useGsapScope(
    root,
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      /* Re-runs on every filter change, because `stage` is in the deps and
         gsap.context reverts the previous pass first. So a card that has just
         been filtered INTO the set arrives the same way it would have on first
         load, and nothing is left holding a clip-path from the set before. */
      for (const card of rootEl.querySelectorAll<HTMLElement>(
        `.${styles.card}`,
      )) {
        const frame = card.querySelector(`.${styles.frame}`);
        if (!frame) continue;

        const timeline = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
        timeline.fromTo(
          frame,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.out" },
        );
        timeline.fromTo(
          card.querySelector(`.${styles.image}`),
          { scale: 1.18 },
          { scale: 1, duration: 1.6, ease: "expo.out" },
          0,
        );
        timeline.scrollTrigger?.refresh();
      }

      revealOnEnter(`.${styles.card} [data-reveal]`, rootEl, {
        start: "top 88%",
        stagger: 0.05,
        delay: 0.1,
      });

      maskReveal(`.${styles.railRule}`, rootEl, { from: "left", duration: 1 });
    },
    [stage, slides.length],
  );

  return (
    <div ref={root} className={`u-shell ${styles.field}`}>
      <div className="p-withRail">
        {/* ---- The rail ---- */}
        <div className={`p-rail ${styles.rail}`}>
          <p className={`u-label ${styles.railLabel}`} id="stage-filter">
            {filterLabel}
          </p>
          <span className={styles.railRule} aria-hidden="true" />

          <div
            className={styles.stages}
            role="group"
            aria-labelledby="stage-filter"
          >
            <button
              type="button"
              className={clsx(styles.stage, stage === "all" && styles.isActive)}
              aria-pressed={stage === "all"}
              onClick={() => setStage("all")}
            >
              <span className={styles.stageName}>{allLabel}</span>
              <span className={`u-numeral ${styles.stageCount}`}>
                {slides.length}
              </span>
            </button>

            {stages.map((item) => (
              <button
                key={item}
                type="button"
                className={clsx(styles.stage, stage === item && styles.isActive)}
                aria-pressed={stage === item}
                onClick={() => setStage(item)}
              >
                <span className={styles.stageName}>{item}</span>
                <span className={`u-numeral ${styles.stageCount}`}>
                  {slides.filter((slide) => slide.status === item).length}
                </span>
              </button>
            ))}
          </div>

          {note ? (
            <p className={`u-caption ${styles.note}`}>{note}</p>
          ) : null}
        </div>

        {/* ---- The field ---- */}
        <div className={styles.setWrap}>
          {/* The count is announced rather than left to the eye: a filter that
              silently swaps a grid tells a screen reader nothing. */}
          <p className="u-visually-hidden" role="status">
            {shown.length} projects shown.
          </p>

          {shown.length === 0 ? (
            <p className={styles.empty}>{emptyMessage}</p>
          ) : (
            <ul className={styles.set}>
              {shown.map((slide, index) => (
                <li
                  key={slide.id}
                  className={styles.card}
                  /* The four-beat figure. Read by CSS, which owns the spans. */
                  data-beat={index % 4}
                >
                  <article className={styles.cardInner}>
                    <div className={styles.frame}>
                      <Image
                        src={slide.image.src}
                        alt={slide.image.alt}
                        width={slide.image.width}
                        height={slide.image.height}
                        sizes="(max-width: 62rem) 92vw, 46vw"
                        quality={82}
                        className={styles.image}
                      />
                    </div>

                    <div className={styles.caption} data-reveal="up">
                      <span
                        className={`p-numeral ${styles.index}`}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(3, "0")}
                      </span>

                      <div className={styles.captionBody}>
                        <h3 className={styles.name}>{slide.name}</h3>
                        <p className={styles.meta}>
                          <span className={styles.status}>{slide.status}</span>
                          <span className={styles.locality}>
                            {slide.locality}
                          </span>
                        </p>
                        <p className={styles.blurb}>{slide.blurb}</p>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectsField;
