"use client";

import { useRef } from "react";
import type { CardItem } from "@/lib/pages";
import type { Cta, SwashHeading } from "@/lib/content";
import {
  drawOnEnter,
  gsap,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import ResponsibilityIcons from "@/components/ResponsibilityIcons";
import Swash from "@/components/Swash";
import styles from "./SustainabilityStem.module.css";

/**
 * /sustainability — the four practices, branching off a stem.
 *
 * WHAT THIS REPLACES. A two-column `CardGrid` — the same four hairline boxes
 * this site put on six other pages, with the icons at 32px in the corner of
 * each. The drawings were the best thing on the page and they were treated as
 * bullet points.
 *
 * SO THE DRAWINGS ARE THE PAGE. Each practice gets its icon at display scale,
 * drawn stroke by stroke as it arrives, hung off a stem on a CURVED branch.
 * The curve is this page's signature and is the reason it cannot be mistaken
 * for /about or /nri-corner: both of those run straight lines with straight
 * leaders — a rope and a border, things that are ruled. This one grows, so
 * nothing on it is ruled, and the node where a branch meets the stem is the
 * brand mark's own petal rather than the dot the other pages stake.
 *
 * THE ICONS ARE DRAWN THE HOUSE WAY. ResponsibilityIcons gives every stroked
 * element `pathLength={1}`, so an icon is held undrawn at `stroke-dasharray: 1;
 * stroke-dashoffset: 1` in CSS with no measurement at all and one tween draws
 * all four. `drawOnEnter` is therefore NOT used on them — it measures real
 * geometry, which is the right tool for the stem and the wrong one here.
 *
 * ONE LEDGER, NOT TWO. This page used to carry a community ledger beside the
 * environmental one, built around Vihaa International School. The school is a
 * joint venture with its own section on the landing page; a stake the group
 * holds is not a line in what it owes, so it is not restated here. That
 * decision is carried over from the old page unchanged.
 */

export function SustainabilityStem({
  label,
  heading,
  lead,
  items,
  coda,
  cta,
}: {
  label: string;
  heading: SwashHeading;
  lead: string;
  items: CardItem[];
  coda: string;
  cta?: Cta;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // The trunk is grown by the reader's own scrolling, from the point the
    // hero's sprout broke the ground line to the last branch.
    drawOnEnter(`.${styles.trunkPath}`, rootEl, {
      scrub: true,
      start: "top 85%",
      end: "bottom 65%",
    });

    // Each branch curves out as its practice arrives.
    drawOnEnter(`.${styles.branchPath}`, rootEl, {
      duration: 1.1,
      start: "top 80%",
      stagger: 0.12,
    });

    // The petal opens at the node, after the branch has reached it.
    gsap.fromTo(
      `.${styles.petal}`,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.12,
        delay: 0.35,
        scrollTrigger: { trigger: rootEl, start: "top 80%", once: true },
      },
    );

    // The icons, drawn on their own pathLength — see the note above.
    for (const figure of rootEl.querySelectorAll<HTMLElement>(
      `.${styles.icon}`,
    )) {
      gsap.to(figure.querySelectorAll("path, circle, line, polyline, rect"), {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "power1.inOut",
        stagger: 0.07,
        scrollTrigger: { trigger: figure, start: "top 84%", once: true },
      });
    }

    revealOnEnter(`.${styles.practiceBody} > [data-reveal]`, rootEl, {
      start: "top 82%",
      stagger: 0.06,
    });

    revealOnEnter(`.${styles.close} > [data-reveal]`, rootEl, {
      start: "top 90%",
      stagger: 0.1,
    });
  }, [items.length]);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="environment-title"
    >
      {/* The trunk. */}
      <div className={styles.trunk} aria-hidden="true">
        <svg
          className={styles.trunkSvg}
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
        >
          <path
            className={styles.trunkPath}
            d="M1 0 L1 100"
            stroke="currentColor"
            strokeWidth="1.5"
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
          <h2
            id="environment-title"
            className={`u-h2 ${styles.heading}`}
            data-reveal="up"
          >
            <Swash heading={heading} />
          </h2>
          <p className={styles.lead} data-reveal="up">
            {lead}
          </p>
        </div>

        <ul className={styles.practices}>
          {items.map((item, index) => (
            <li
              key={item.id}
              className={styles.practiceItem}
              /* Alternating sides of the stem. Derived from position, so a
                 fifth practice added in /admin keeps the alternation. */
              data-side={index % 2 === 0 ? "right" : "left"}
            >
              {/* The node: the brand mark's petal, opening where the branch
                  leaves the stem. */}
              <span className={styles.petal} aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path
                    d="M8 1 C 11.5 4.5, 11.5 11.5, 8 15 C 4.5 11.5, 4.5 4.5, 8 1 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </span>

              {/* The branch, curving out to the practice. */}
              <svg
                className={styles.branch}
                viewBox="0 0 120 48"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className={styles.branchPath}
                  d="M0 2 C 52 2, 70 40, 118 42"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                />
              </svg>

              <article className={styles.practice}>
                {item.icon ? (
                  <span className={styles.icon}>
                    <ResponsibilityIcons name={item.icon} />
                  </span>
                ) : null}

                <div className={styles.practiceBody}>
                  <h3 className={`u-h3 ${styles.title}`} data-reveal="up">
                    {item.title}
                  </h3>
                  <p className={styles.body} data-reveal="up">
                    {item.body}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/* The same coda the landing page's responsibility band ends on. */}
        <div className={styles.close}>
          <p className={styles.coda} data-reveal="up">
            {coda}
          </p>

          {cta ? (
            <p data-reveal="up">
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

export default SustainabilityStem;
