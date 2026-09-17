"use client";

import { useCallback, useRef } from "react";
import type { FaqItem } from "@/lib/pages";
import type { Cta, SwashHeading } from "@/lib/content";
import {
  gsap,
  prefersReducedMotion,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./NriQuestions.module.css";

/**
 * /nri-corner — the questions, on the arrival side.
 *
 * THE MERIDIAN IS GONE HERE, and that is the point. It runs through the hero
 * and through all four stages, and it stops the moment the crossing is over:
 * this band is full width, on the lighter navy the wash has been climbing
 * toward, with nothing down the middle of it. The border is behind you. No
 * copy says so.
 *
 * THE DISCLOSURE IS ANIMATED WITHOUT GIVING UP `<details>`. The element stays a
 * real `<details>`/`<summary>`, so it is keyboard-operable, findable by the
 * browser's own in-page search, and fully working with no JavaScript at all.
 * What the script adds is the height tween: the click is intercepted, the
 * panel is measured and travelled, and the `open` attribute is set at the
 * correct end of it — on open before the tween so the content is in the
 * accessibility tree immediately, on close after it so the panel is not
 * removed from under its own animation.
 *
 * Under reduced motion the handler returns before it touches anything and the
 * browser's native toggle runs, which is the correct behaviour rather than a
 * degraded one.
 *
 * THE DISCLAIMER IS PART OF THE PAGE, not a footnote under it — the reasoning
 * the old page carried, and it is kept. On a page about money moving between
 * two countries, "this is not advice" is a load-bearing sentence. It closes the
 * band as a ruled statement rather than as small print.
 */

export function NriQuestions({
  label,
  heading,
  standfirst,
  items,
  disclaimer,
  cta,
}: {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  items: FaqItem[];
  disclaimer: string;
  cta?: Cta;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });
    revealOnEnter(`.${styles.item}`, rootEl, {
      start: "top 88%",
      stagger: 0.07,
    });
    revealOnEnter(`.${styles.close} > [data-reveal]`, rootEl, {
      start: "top 90%",
      stagger: 0.1,
    });
  }, [items.length]);

  const onToggle = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;

    const summary = event.currentTarget;
    const details = summary.closest("details");
    const panel = details?.querySelector<HTMLElement>(`.${styles.answer}`);
    if (!details || !panel) return;

    event.preventDefault();
    gsap.killTweensOf(panel);

    if (details.open) {
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.42,
        ease: "power2.inOut",
        // Closed only once the panel has finished travelling, or the browser
        // pulls the content out from under the tween on the first frame.
        onComplete: () => {
          details.open = false;
          gsap.set(panel, { clearProps: "all" });
        },
      });
      return;
    }

    // Open first: the content has to be in the tree to be measured, and a
    // reader on the keyboard should reach it without waiting for the tween.
    details.open = true;
    gsap.fromTo(
      panel,
      { height: 0, opacity: 0 },
      {
        height: "auto",
        opacity: 1,
        duration: 0.62,
        ease: "expo.out",
        onComplete: () => gsap.set(panel, { clearProps: "height" }),
      },
    );
  }, []);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="questions-title"
    >
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {label}
          </p>
          <h2
            id="questions-title"
            className={`u-h2 ${styles.heading}`}
            data-reveal="up"
          >
            <Swash heading={heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <div className={styles.list}>
          {items.map((item, index) => (
            <details key={item.id} className={styles.item} data-reveal="up">
              <summary className={styles.summary} onClick={onToggle}>
                <span className={`p-numeral ${styles.index}`} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.question}>{item.question}</span>
                {/* The marker is a drawn cross that rotates to a dash — the
                    site draws, it does not use a glyph from the body face. */}
                <span className={styles.marker} aria-hidden="true">
                  <span className={styles.markerBar} />
                  <span
                    className={`${styles.markerBar} ${styles.markerBarV}`}
                  />
                </span>
              </summary>

              <div className={styles.answer}>
                <div className={styles.answerInner}>
                  {item.answer.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className={styles.close}>
          <p className={styles.disclaimer} data-reveal="up">
            {disclaimer}
          </p>

          {cta ? (
            <p className={styles.action} data-reveal="up">
              <a className={styles.cta} href={cta.href}>
                <span>{cta.label}</span>
                <svg
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
      </div>
    </section>
  );
}

export default NriQuestions;
