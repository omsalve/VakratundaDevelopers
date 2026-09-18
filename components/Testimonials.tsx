"use client";

import { useRef } from "react";
import clsx from "clsx";
import type { TestimonialsContent } from "@/lib/content";
import {
  gsap,
  revealOnEnter,
  timelineOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "./Swash";
import styles from "./Testimonials.module.css";

/**
 * The clients, in their own words — set as a conversation.
 *
 * THE SLIDE HAD SPEECH BUBBLES, AND THE SITE DOES NOT FILL SHAPES. The
 * testimonial slide sets each quote in a white bubble with a tail; on this
 * page the only filled shapes are photographs. So the bubble is kept as the
 * thing it actually is — a line with a tail in it — and drawn in the guide's
 * rose, the way every other rule on the page is drawn. Each voice opens on
 * that edge, and the voices alternate sides down the shell, so the section
 * reads as a thread of people speaking rather than a grid of cards.
 *
 * THE WORDS INK IN AS THEY ARE READ. Each quote is set pale and darkens word
 * by word, scrubbed to the scroll, so the ink arrives at the pace the eye
 * does. Not a pin and not a carousel: the page already has its two scroll set
 * pieces and its one section driven by hand, and this one only has to be
 * read. The edge is drawn, and the name rises from its mask, once.
 *
 * With no JavaScript, or under reduced motion, every quote is in full ink and
 * every edge is drawn — the same bargain the rest of the site strikes.
 */

export function Testimonials({ content }: { content: TestimonialsContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;

    revealOnEnter(`.${styles.head} > *`, section, { stagger: 0.09 });

    for (const voice of section.querySelectorAll<HTMLElement>(
      `.${styles.voice}`,
    )) {
      /* ---- The edge: the near rule runs out to the tail, the tail is
         drawn up to its point and back down, and the far rule runs on from
         its foot — one stroke, in the order a pen would make it. */
      const tail = voice.querySelector<SVGPathElement>(`.${styles.tail} path`);
      const length = tail?.getTotalLength() ?? 0;
      if (tail && length) {
        gsap.set(tail, { strokeDasharray: length, strokeDashoffset: length });
      }

      timelineOnEnter({ trigger: voice, start: "top 82%", once: true }, (tl) => {
        tl.to(voice.querySelector(`.${styles.ruleNear}`), {
          scaleX: 1,
          duration: 0.55,
          ease: "power2.in",
        })
          .to(tail, { strokeDashoffset: 0, duration: 0.5, ease: "none" })
          .to(voice.querySelector(`.${styles.ruleFar}`), {
            scaleX: 1,
            duration: 1.1,
            ease: "expo.out",
          })
          .to(
            voice.querySelector(`.${styles.mark}`),
            // Back to the stylesheet's resting value, not to full strength.
            { opacity: 0.7, y: 0, duration: 1.2, ease: "expo.out" },
            0.35,
          )
          .to(
            voice.querySelectorAll(`.${styles.citeInk}`),
            { y: 0, duration: 1, ease: "expo.out", stagger: 0.08 },
            0.9,
          );
      });

      /* ---- The ink, scrubbed. The pale is set in CSS under `.motion-on`,
         so the ink it tweens to is read off the quote itself and stays the
         section's own text colour rather than a second copy of it here. */
      const quote = voice.querySelector<HTMLElement>(`.${styles.quote}`);
      if (quote) {
        gsap.to(quote.querySelectorAll(`.${styles.word}`), {
          color: getComputedStyle(quote).color,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: quote,
            start: "top 86%",
            end: "bottom 52%",
            scrub: 0.4,
          },
        });
      }
    }
  }, []);

  return (
    <section
      ref={root}
      id="testimonials"
      className={`on-cream ${styles.section}`}
      aria-labelledby="testimonials-title"
    >
      <div className={`u-shell u-head ${styles.head}`}>
        <h2 id="testimonials-title" className="u-h2" data-reveal="up">
          <Swash heading={content.heading} />
        </h2>
        <p data-reveal="up">{content.standfirst}</p>
      </div>

      <ol className={`u-shell ${styles.thread}`}>
        {content.voices.map((voice, index) => (
          <li
            key={voice.id}
            className={clsx(styles.voice, index % 2 === 1 && styles.isFar)}
          >
            <figure className={styles.figure}>
              {/* The bubble's edge, with its tail. Decorative: the figure is
                  the quote and its attribution, and nothing else. */}
              <div className={styles.edge} aria-hidden="true">
                <span className={styles.ruleNear} />
                <svg
                  className={styles.tail}
                  viewBox="0 0 34 30"
                  width="34"
                  height="30"
                  focusable="false"
                >
                  <path d="M0 29.5 L33.5 0.5 L33.5 29.5" />
                </svg>
                <span className={styles.ruleFar} />
              </div>

              <span className={styles.markSeat} aria-hidden="true">
                <span className={styles.mark}>“</span>
              </span>

              <blockquote className={styles.quote}>
                <p>
                  <span className={styles.hang} aria-hidden="true">
                    “
                  </span>
                  {voice.quote.split(/(\s+)/).map((part, i) =>
                    /^\s+$/.test(part) ? (
                      part
                    ) : (
                      <span key={i} className={styles.word}>
                        {part}
                      </span>
                    ),
                  )}
                  <span className={styles.word} aria-hidden="true">
                    ”
                  </span>
                </p>
              </blockquote>

              <figcaption className={styles.cite}>
                <span className={styles.citeMask}>
                  <span className={clsx(styles.citeInk, styles.name)}>
                    {voice.name}
                  </span>
                </span>
                <span className={styles.citeMask}>
                  <span className={clsx(styles.citeInk, styles.place)}>
                    {voice.place}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default Testimonials;
