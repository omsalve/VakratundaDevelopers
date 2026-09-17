"use client";

import { useRef } from "react";
import Image from "next/image";
import type { StoryContent } from "@/lib/pages";
import {
  drawOnEnter,
  gsap,
  maskReveal,
  parallax,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./AboutThread.module.css";

/**
 * /about — the story, threaded on the line.
 *
 * WHAT THIS REPLACES. The old page put `BrandStory` here: a photograph beside
 * three paragraphs, the same block /hospitality used, in a section headed the
 * same way every other section on the site was headed. Nothing about it said
 * "fifty years" — it was a two-column band that happened to contain a history.
 *
 * WHAT IT DOES INSTEAD. The photograph is PINNED and the prose travels past
 * it. That is the page's argument made physical: one thing that does not move
 * while time runs over it. The line drawn in the hero continues down the left
 * edge and is SCRUBBED rather than played, so it is drawn by the reader's own
 * scrolling and always ends exactly where they have got to.
 *
 * THE LINE BREAKS ONCE, for the pullquote, and nowhere else on the page. An
 * interruption that happens twice is a pattern; one that happens once is an
 * event, which is the same reasoning lib/arc.ts gives for spending the petal
 * wipe exactly twice on the landing page.
 *
 * The sticky column is `position: sticky`, not a GSAP pin: a pin would need
 * ScrollTrigger to own the layout of a section that is otherwise plain flow,
 * and sticky degrades to a static column on a narrow screen by itself.
 */

export function AboutThread({ content }: { content: StoryContent }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    // Drawn by the reader rather than on entry — see the note above.
    drawOnEnter(`.${styles.threadPath}`, rootEl, {
      scrub: true,
      start: "top 80%",
      end: "bottom 80%",
    });

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // The plate is uncovered from its bottom edge, so it grows UP out of the
    // line rather than sliding in from a side the line does not use.
    maskReveal(`.${styles.plate}`, rootEl, {
      from: "bottom",
      duration: 1.35,
      start: "top 78%",
    });
    parallax(`.${styles.plateImage}`, rootEl, { distance: 6 });

    revealOnEnter(`.${styles.para}`, rootEl, {
      start: "top 84%",
      stagger: 0.12,
    });

    // The quote arrives by being uncovered left-to-right, like a line of
    // handwriting, while the ground behind it opens the gap in the thread.
    const quote = rootEl.querySelector(`.${styles.quote}`);
    if (quote) {
      gsap.from(`.${styles.quoteMask}`, {
        scaleY: 0,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: quote, start: "top 82%", once: true },
      });
      maskReveal(`.${styles.quoteText}`, quote, {
        from: "left",
        duration: 1.3,
        start: "top 82%",
      });
    }
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="story-title">
      <svg
        className={styles.thread}
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.threadPath}
          d="M1 0 L1 100"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
      </svg>

      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>
          <h2 id="story-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>
        </div>

        <div className={styles.body}>
          {/* Sticky: the one thing that does not move while the prose runs. */}
          <figure className={styles.figure}>
            <div className={`p-plate ${styles.plate}`}>
              <Image
                className={styles.plateImage}
                src={content.image.src}
                alt={content.image.alt}
                width={content.image.width}
                height={content.image.height}
                sizes="(max-width: 62rem) 100vw, 38vw"
              />
            </div>
            {content.image.caption ? (
              <figcaption className={`u-caption ${styles.caption}`}>
                {content.image.caption}
              </figcaption>
            ) : null}
          </figure>

          <div className={styles.prose}>
            {content.body.map((paragraph, index) => (
              <p
                key={paragraph.slice(0, 32)}
                className={styles.para}
                data-reveal="up"
              >
                {/* The first paragraph opens on a drawn cap, the way the guide
                    opens a page of body copy. One per section, never per
                    paragraph. */}
                {index === 0 ? (
                  <span className={styles.drop} aria-hidden="true">
                    {paragraph.charAt(0)}
                  </span>
                ) : null}
                {index === 0 ? paragraph.slice(1) : paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* The one break in the line. */}
      <div className={styles.quote}>
        <span className={styles.quoteMask} aria-hidden="true" />
        <blockquote className={`u-shell ${styles.quoteInner}`}>
          <p className={styles.quoteText}>{content.pullquote}</p>
        </blockquote>
      </div>
    </section>
  );
}

export default AboutThread;
