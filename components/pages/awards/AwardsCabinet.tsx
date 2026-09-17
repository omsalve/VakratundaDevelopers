"use client";

import { useRef } from "react";
import type { CardItem } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import { drawOnEnter, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./AwardsCabinet.module.css";

/**
 * /awards — the certifications, as seals in a case.
 *
 * THIS SECTION NOW COMES FIRST, and that is an editorial change, not just a
 * visual one. The old page led with the award citations and put the ISO
 * standards under them on cream. The page's own closing line argues the
 * opposite — "An award celebrates a good year. A certificate is earned again
 * every year" — and the old comment in the route said the same thing while the
 * layout did the reverse. The audited half now leads, and the citations follow
 * it.
 *
 * IT MATTERS MORE THAN USUAL HERE BECAUSE THE AWARDS ARE PLACEHOLDERS. They
 * carry no `href`, and the notice at the head of lib/pages/newsroom.ts says
 * they are not yet real. If they were deleted tomorrow this page would still
 * open on four verifiable standings and still stand up — which is the test the
 * old arrangement claimed to pass and this one actually does.
 *
 * WHAT A SEAL IS HERE: a drawn ring with the standard's own number set inside
 * it, the ring drawn open as it arrives. Not an icon and not a badge graphic —
 * `eyebrow` already carries "ISO 9001:2015", so the seal is that text given a
 * frame, and there is no second place for the number to be wrong.
 *
 * THE LIGHT ON THE GLASS IS NOT THIS SECTION'S. A pointer-tracked spotlight
 * used to live here, which switched on over this one band and off again either
 * side of it. It belongs to the whole route — see AwardsSpotlight — so that
 * the seal, the case and the citations are lit by one moving light rather than
 * three different rooms.
 */

export function AwardsCabinet({
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

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    drawOnEnter(`.${styles.sealPath}`, rootEl, {
      duration: 1.5,
      stagger: 0.14,
      start: "top 80%",
    });

    revealOnEnter(`.${styles.sealBody} > [data-reveal]`, rootEl, {
      start: "top 82%",
      stagger: 0.05,
    });
  }, [items.length]);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="certification-title"
    >
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {label}
          </p>
          <h2
            id="certification-title"
            className={`u-h2 ${styles.heading}`}
            data-reveal="up"
          >
            <Swash heading={heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <ul className={styles.case}>
          {items.map((item) => (
            <li key={item.id} className={styles.standing}>
              {/* The seal: the standard's own number, framed. */}
              <span className={styles.seal}>
                <svg
                  className={styles.sealRings}
                  viewBox="0 0 120 120"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <circle
                    className={styles.sealPath}
                    cx="60"
                    cy="60"
                    r="57"
                    strokeWidth="1"
                  />
                  <circle
                    className={styles.sealPath}
                    cx="60"
                    cy="60"
                    r="50"
                    strokeWidth="1"
                    strokeDasharray="1 4"
                    strokeLinecap="round"
                  />
                </svg>

                {item.eyebrow ? (
                  <span className={`p-numeral ${styles.sealText}`}>
                    {item.eyebrow}
                  </span>
                ) : null}
              </span>

              <div className={styles.sealBody}>
                <h3 className={`u-h3 ${styles.title}`} data-reveal="up">
                  {item.title}
                </h3>
                <p className={styles.body} data-reveal="up">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AwardsCabinet;
