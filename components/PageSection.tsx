"use client";

import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import type { SwashHeading } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "./Swash";
import styles from "./PageSection.module.css";

/**
 * A section of a standing page: an optional rubric ruled across the field, a
 * `u-head` (heading + standfirst), and whatever the page puts under it.
 *
 * It owns its head and NOTHING ELSE. Every child that animates — the card
 * grids, the project grid — carries its own GSAP scope, so this component
 * never reaches into a subtree it does not own and no element is ever bound
 * by two triggers. That is the same division the landing page keeps between
 * a section and the components inside it.
 *
 * `ground` is the page's only ground swap, and it is the existing one:
 * `.on-cream` re-points the semantic text tokens, so nothing inside needs a
 * light-mode branch.
 */

export function PageSection({
  id,
  label,
  heading,
  standfirst,
  ground = "navy",
  divider = false,
  size = "base",
  className,
  children,
}: {
  id?: string;
  label?: string;
  heading?: SwashHeading;
  standfirst?: string;
  ground?: "navy" | "cream";
  /**
   * Draws the shell-ranged rose hairline Responsibility rules above itself.
   * Use it where two sections share a ground: without it they read as one
   * field with a double interval in the middle of it.
   */
  divider?: boolean;
  /** `lg` takes the interval the landing page gives a section that closes a movement. */
  size?: "base" | "lg";
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    const rule = rootEl.querySelector(`.${styles.rubricRule}`);
    if (rule) {
      gsap.to(rule, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: rootEl, start: "top 82%", once: true },
      });
    }

    if (rootEl.querySelector(`.${styles.head} > [data-reveal]`)) {
      revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, {
        stagger: 0.09,
      });
    }
  }, []);

  const titleId = id ? `${id}-title` : undefined;

  return (
    <section
      ref={root}
      id={id}
      className={clsx(
        styles.section,
        size === "lg" && styles.isLarge,
        divider && styles.hasDivider,
        ground === "cream" && "on-cream",
        className,
      )}
      aria-labelledby={heading ? titleId : undefined}
    >
      {label ? (
        <div className="u-shell">
          <p className={styles.rubric}>
            <span className={`u-label ${styles.rubricLabel}`}>{label}</span>
            <span className={styles.rubricRule} aria-hidden="true" />
          </p>
        </div>
      ) : null}

      {heading ? (
        <div className={`u-shell u-head ${styles.head}`}>
          <h2 id={titleId} className="u-h2" data-reveal="up">
            <Swash heading={heading} />
          </h2>
          {standfirst ? <p data-reveal="up">{standfirst}</p> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

export default PageSection;
