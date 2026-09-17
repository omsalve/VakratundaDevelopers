"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { VenturesContent } from "@/lib/content";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "./Swash";
import PageLink from "./PageLink";
import styles from "./JointVentures.module.css";

/**
 * The joint ventures — one partnership at a time, in a single frame.
 *
 * ONE FRAME, THREE SLIDES, AND NOTHING MOVES BUT THE CONTENTS. Every slide is
 * laid into the SAME grid cell (see `.stage` in the stylesheet), so the frame
 * takes the height of the tallest of them once and then holds absolutely
 * still while the partnerships change inside it. That stillness is the whole
 * effect: the photograph is cut in from its foot, the partner's name rises
 * out of a mask across it, and the two columns of copy come up a beat apart —
 * the same grammar the scene pins open with, at section scale.
 *
 * The section is not a scroll set piece. The page already has two of those
 * (the arc, and the pinned team sequence); this one is operated by hand, with
 * arrows and arrow keys, and it earns its place by being the one section the
 * visitor drives. GSAP is used only for the section's own entrance, so it
 * arrives like every other section head on the page; the change from one
 * venture to the next is CSS, keyed off a single `isActive` class.
 *
 * With no JavaScript, or under reduced motion, the first venture is shown
 * complete and every slide is legible in document order — which is the same
 * bargain the rest of the site strikes.
 */

export function JointVentures({ content }: { content: VenturesContent }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  /* Which way the last change ran. The photograph and the name lean into the
     direction of travel, so a step back is not the step forward played
     again. */
  const [dir, setDir] = useState<"next" | "prev">("next");

  const total = content.slides.length;

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter(`.${styles.head} > *`, root.current, { stagger: 0.09 });
    revealOnEnter(`.${styles.stage}, .${styles.controls}`, root.current, {
      start: "top 74%",
      stagger: 0.12,
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const wrapped = (index + total) % total;
      setActive((current) => {
        if (wrapped === current) return current;
        // A wrap counts as a step in the direction it was asked for.
        setDir(wrapped === (current + 1) % total ? "next" : "prev");
        return wrapped;
      });
    },
    [total],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section
      ref={root}
      id="ventures"
      className={`on-cream ${styles.section}`}
      aria-labelledby="ventures-title"
      onKeyDown={onKeyDown}
    >
      <div className={`u-shell u-head ${styles.head}`}>
        <h2 id="ventures-title" className="u-h2" data-reveal="up">
          <Swash heading={content.heading} />
        </h2>
        <p data-reveal="up">{content.standfirst}</p>
      </div>

      <div
        className={`u-shell ${styles.stage}`}
        data-reveal="up"
        data-dir={dir}
      >
        {content.slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <article
              key={slide.id}
              className={clsx(styles.slide, isActive && styles.isActive)}
              aria-label={slide.partner}
              inert={!isActive}
            >
              {/* Left: what the partnership is, and its two measurements. */}
              <div className={styles.facts}>
                <p className={`u-label ${styles.kicker}`}>{slide.kicker}</p>
                {slide.stats.map((stat) => (
                  <div key={stat.label} className={styles.stat}>
                    <p className={styles.statLabel}>{stat.label}</p>
                    <p className={clsx(styles.statValue, "u-numeral")}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Centre: the built work. */}
              <figure className={styles.frame}>
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  sizes="(max-width: 64rem) 86vw, 34vw"
                  quality={82}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={styles.image}
                />
              </figure>

              {/* Right: the sentence, and the way in. */}
              <div className={styles.note}>
                <p className={styles.blurb}>{slide.blurb}</p>
                <a className={styles.cta} href={slide.cta.href}>
                  <span>{slide.cta.label}</span>
                </a>
              </div>

              {/* The partner's name, set across the foot of the photograph:
                  drawn after it in the markup so it lands above it, and cut
                  in out of its own mask. */}
              <h3 className={styles.partner}>
                <span className={styles.partnerInk}>{slide.partner}</span>
              </h3>
            </article>
          );
        })}
      </div>

      <div className={`u-shell ${styles.controls}`} data-reveal="up">
        <button
          type="button"
          className={styles.nav}
          onClick={() => goTo(active - 1)}
        >
          <Chevron direction="left" />
          <span className="u-visually-hidden">Previous venture</span>
        </button>

        <p className={styles.counter} aria-live="polite">
          <span className="u-visually-hidden">Showing venture </span>
          <span className={clsx(styles.counterNow, "u-numeral")}>
            {String(active + 1).padStart(2, "0")}
          </span>
        </p>

        {/* The rail is the progress, drawn rather than described: the fill is
            one venture's span of the track, and it slides. */}
        <div
          className={styles.rail}
          aria-hidden="true"
          style={
            {
              "--count": total,
              "--index": active,
            } as React.CSSProperties
          }
        >
          <span className={styles.railFill} />
        </div>

        <p className={styles.counter}>
          <span className="u-visually-hidden">of </span>
          <span className={clsx(styles.counterTotal, "u-numeral")}>
            {String(total).padStart(2, "0")}
          </span>
        </p>

        <button
          type="button"
          className={styles.nav}
          onClick={() => goTo(active + 1)}
        >
          <Chevron direction="right" />
          <span className="u-visually-hidden">Next venture</span>
        </button>
      </div>

      {/* The section is about who puts money alongside the group's, so the two
          pages written for people considering exactly that close it. Below the
          controls rather than inside a slide: they belong to the whole set,
          and a link that changes with the carousel is a link nobody trusts. */}
      <div className="u-shell">
        <div className={styles.onward}>
          <PageLink
            size="sm"
            href="/investors"
            label="The record partners build on"
          />
          <PageLink size="sm" href="/nri-corner" label="Your home, from abroad" />
        </div>
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default JointVentures;
