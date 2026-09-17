"use client";

import { useRef } from "react";
import type { PageHeroContent } from "@/lib/pages";
import { gsap, maskReveal, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./GrievanceHero.module.css";

/**
 * /grievance-redressal — the head of a filed instrument.
 *
 * THE ANTI-HERO, AND DELIBERATELY SO. Every other page on this site opens by
 * taking a screen and holding it: /about at 100svh with the founding year
 * behind the headline, /nri-corner with a meridian down the middle. A
 * statutory complaints procedure that opened like that would be lying about
 * what it is. This one opens the way a filed document opens — the title, then
 * immediately the particulars, ruled into a two-column register.
 *
 * ITS IDENTITY IS RESTRAINT, and restraint is a design decision rather than an
 * absence of one. The heading is set at `u-h1`, not `u-display`; the ground is
 * the lightest cream on the site; the rules are drawn in the deep rose that
 * reads as ruled rather than as a divider; and the only motion is the register
 * being ruled open, line by line. A visitor who has come here to complain is
 * not looking for an experience.
 *
 * THE DATE IS THE DOCUMENT'S OWN. `updated` comes from the ProseDoc, so the
 * register cannot show a date the clauses below disagree with.
 */

export function GrievanceHero({
  content,
  updated,
  updatedLabel = "Last updated",
}: {
  content: PageHeroContent;
  updated: string;
  updatedLabel?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.07,
    });

    // The register is ruled open a row at a time, the way a form is ruled.
    maskReveal(`.${styles.registerRow}`, rootEl, {
      from: "left",
      duration: 0.8,
      stagger: 0.09,
      delay: 0.3,
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>

          <h1 id="page-title" className={`u-h1 ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h1>

          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>
        </div>

        {/* The particulars. A <dl>, because every row is a term and its value. */}
        <dl className={styles.register}>
          <div className={styles.registerRow}>
            <dt className={`u-label ${styles.registerTerm}`}>{updatedLabel}</dt>
            <dd className={styles.registerValue}>{updated}</dd>
          </div>

          {content.meta.map((item, index) => (
            <div key={item} className={styles.registerRow}>
              {/* The credentials row carries values, not labelled pairs, so
                  the term column is a reference mark rather than a word
                  invented here to head it. */}
              <dt className={`p-numeral ${styles.registerTerm}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </dt>
              <dd className={styles.registerValue}>{item}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default GrievanceHero;
