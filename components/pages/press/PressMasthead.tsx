"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { gsap, maskReveal, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./PressMasthead.module.css";

/**
 * /press — the masthead.
 *
 * A NEWSPAPER'S MASTHEAD, not a hero. The title is ruled between two hairlines
 * that run the full width of the page, with the standfirst set as a deck
 * beneath it and the credentials as a dateline. That arrangement exists
 * nowhere else on the site, and it is the whole reason this page cannot be
 * confused with /awards — which is also a dark page holding a ledger of dated
 * entries, and which would otherwise be its twin.
 *
 * FULL BLEED, NOT SHELL WIDTH. The rules run edge to edge. Every other page on
 * the site holds its content inside `u-shell`; a masthead that stopped at the
 * gutter would be a heading with lines near it rather than a masthead.
 *
 * Motion: the two rules are ruled open from the centre outward, then the title
 * rises between them, then the dateline. It is the sequence a press is set in,
 * and it takes well under a second.
 */

export function PressMasthead({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.fromTo(
      `.${styles.rule}`,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.3, ease: "expo.out", stagger: 0.1 },
    );

    gsap.to(`.${styles.titleRow} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.08,
      delay: 0.3,
    });

    maskReveal(`.${styles.deck}`, rootEl, {
      from: "left",
      duration: 1.1,
      delay: 0.5,
    });

    gsap.to(`.${styles.datelineItem}`, {
      opacity: 1,
      duration: 0.7,
      ease: "expo.out",
      stagger: 0.08,
      delay: 0.6,
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <span className={styles.rule} aria-hidden="true" />

      <div className={`u-shell ${styles.titleRow}`}>
        <p className={`u-label ${styles.label}`} data-reveal="up">
          {content.label}
        </p>

        <h1 id="page-title" className={`u-display ${styles.title}`} data-reveal="up">
          <Swash heading={content.heading} />
        </h1>
      </div>

      <span className={styles.rule} aria-hidden="true" />

      <div className={`u-shell ${styles.deckRow}`}>
        <p className={styles.deck}>{content.standfirst}</p>

        <ul className={styles.dateline}>
          {content.meta.map((item) => (
            <li key={item} className={styles.datelineItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PressMasthead;
