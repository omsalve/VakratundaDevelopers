"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "./Swash";
import styles from "./PageHero.module.css";

/**
 * The opening frame of a standing page.
 *
 * It is the landing page's hero with the photograph taken away, not a new
 * kind of opening: the same navy ground, the same rubric in `u-label`, the
 * same display headline with one swash word, the same rose hairline ruled
 * open under it, and the same credentials row set in the display face at
 * caption size that Journey closes its frame on.
 *
 * IT IS NOT A FULL VIEWPORT. Journey's hero is 100svh because it carries a
 * photograph the pins are staked out on; there is nothing here to hold a
 * screen open for, and a screen of empty navy above the first real section
 * would read as a loading state. It clears the fixed masthead and takes the
 * page's largest interval below, and that is all.
 *
 * MOTION IS THE HOUSE ENTRANCE, UNCHANGED — `revealOnEnter` on the stack, the
 * rule ruled open by the same clip the responsibility rubrics use. Under
 * reduced motion, or with no JS, every element is already in its final state.
 */

export function PageHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.inner} > [data-reveal]`, rootEl, {
      start: "top 95%",
      stagger: 0.09,
    });

    gsap.to(`.${styles.rule}`, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.1,
      delay: 0.18,
      ease: "expo.out",
      scrollTrigger: { trigger: rootEl, start: "top 95%", once: true },
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        <p className={`u-label ${styles.label}`} data-reveal="up">
          {content.label}
        </p>

        <h1 id="page-title" className={`u-display ${styles.heading}`} data-reveal="up">
          <Swash heading={content.heading} />
        </h1>

        <span className={styles.rule} aria-hidden="true" />

        <p className={styles.standfirst} data-reveal="up">
          {content.standfirst}
        </p>

        <ul className={styles.meta} data-reveal="up">
          {content.meta.map((item) => (
            <li key={item} className={styles.metaItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PageHero;
