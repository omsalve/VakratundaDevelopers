"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { ProjectSlide, ProjectStatus } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./ProjectGrid.module.css";

/**
 * The portfolio as a field of frames, with the stage filter over it.
 *
 * IT IS THE SAME PORTFOLIO THE LANDING PAGE SCROLLS THROUGH — the identical
 * `gallery.slides` array, read from the same place, so a project added in
 * /admin appears in both without being written twice. ProjectsShowcase walks
 * that array one frame at a time because it is arguing; this page lays it out
 * flat because a visitor who has come to /projects is looking for an address.
 *
 * THE FRAMES ARE CUT IN FROM THEIR FOOT, exactly as Responsibility's are: two
 * rates inside each card, the mask finishing first and the push a beat behind
 * it, so a frame settles rather than stopping.
 *
 * THE FILTER IS THREE BUTTONS AND A useState — no router, no query string, no
 * layout library. Changing it re-keys the GSAP scope, which reverts every
 * inline style GSAP set before rebuilding, so a card revealed under one filter
 * can never be stranded invisible under the next.
 */

const STAGES: ProjectStatus[] = ["Ongoing", "Upcoming", "Completed"];

type Stage = ProjectStatus | "all";

export function ProjectGrid({
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
  /** The small print under the field — what the photographs are of. */
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
      stage === "all" ? slides : slides.filter((slide) => slide.status === stage),
    [slides, stage],
  );

  useGsapScope(
    root,
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      for (const card of rootEl.querySelectorAll<HTMLElement>(
        `.${styles.card}`,
      )) {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
        timeline.to(card.querySelector(`.${styles.frame}`), {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          ease: "expo.out",
        });
        timeline.to(
          card.querySelector(`.${styles.image}`),
          { scale: 1, duration: 1.5, ease: "expo.out" },
          0,
        );
      }

      revealOnEnter(`.${styles.card} [data-reveal]`, rootEl, {
        start: "top 86%",
        stagger: 0.05,
        delay: 0.12,
      });
    },
    [stage],
  );

  return (
    <div ref={root} className="u-shell">
      <div className={styles.controls} role="group" aria-label={filterLabel}>
        <p className={`u-label ${styles.controlsLabel}`}>{filterLabel}</p>

        <div className={styles.stages}>
          <button
            type="button"
            className={clsx(styles.stage, stage === "all" && styles.isActive)}
            aria-pressed={stage === "all"}
            onClick={() => setStage("all")}
          >
            {allLabel}
            <span className={`u-numeral ${styles.count}`}>{slides.length}</span>
          </button>

          {stages.map((item) => (
            <button
              key={item}
              type="button"
              className={clsx(styles.stage, stage === item && styles.isActive)}
              aria-pressed={stage === item}
              onClick={() => setStage(item)}
            >
              {item}
              <span className={`u-numeral ${styles.count}`}>
                {slides.filter((slide) => slide.status === item).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The count is announced rather than left to the eye: a filter that
          silently swaps a grid tells a screen reader nothing. */}
      <p className="u-visually-hidden" role="status">
        {shown.length} projects shown.
      </p>

      {shown.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <ul className={styles.grid}>
          {shown.map((slide) => (
            <li key={slide.id} className={styles.card}>
              <div className={styles.frame}>
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  sizes="(max-width: 47.99rem) 92vw, (max-width: 63.99rem) 46vw, 31vw"
                  quality={82}
                  className={styles.image}
                />
              </div>

              <p className={styles.meta} data-reveal="up">
                <span className={`u-label ${styles.status}`}>{slide.status}</span>
                <span className={styles.locality}>{slide.locality}</span>
              </p>

              <h3 className={styles.name} data-reveal="up">
                {slide.name}
              </h3>

              <p className={styles.blurb} data-reveal="up">
                {slide.blurb}
              </p>
            </li>
          ))}
        </ul>
      )}

      {note ? <p className={`u-caption ${styles.note}`}>{note}</p> : null}
    </div>
  );
}

export default ProjectGrid;
