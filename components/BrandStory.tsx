"use client";

import { useRef } from "react";
import Image from "next/image";
import type { AboutPageContent } from "@/lib/pages";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./BrandStory.module.css";

/**
 * The brand story: three paragraphs ranged against one photograph, and the
 * guide's own closing line set as the pull-quote that ends the band.
 *
 * SAME GRAMMAR AS THE COMMUNITY BAND on the landing page — a twelve-column
 * field, a frame cut in from its foot with the picture easing off a small
 * push, and the type ranged in the counter-space beside it. The pull-quote is
 * Responsibility's coda, set the same way: display face, italic, ranged to the
 * field's far edge, because it is the sentence that covers everything above it
 * rather than a caption on any one paragraph.
 *
 * Under reduced motion, or with no JS, the frame is open and the type is set.
 */

export function BrandStory({
  content,
}: {
  content: AboutPageContent["story"];
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: rootEl, start: "top 84%", once: true },
    });
    timeline.to(`.${styles.frame}`, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.9,
      ease: "expo.out",
    });
    timeline.to(
      `.${styles.image}`,
      { scale: 1, duration: 1.5, ease: "expo.out" },
      0,
    );

    revealOnEnter(`.${styles.copy} [data-reveal]`, rootEl, {
      start: "top 80%",
      stagger: 0.08,
      delay: 0.14,
    });

    revealOnEnter(`.${styles.pullquote}`, rootEl, { start: "top 92%" });
  }, []);

  return (
    <div ref={root} className={`u-shell ${styles.field}`}>
      <figure className={styles.figure}>
        <div className={styles.frame}>
          <Image
            src={content.image.src}
            alt={content.image.alt}
            width={content.image.width}
            height={content.image.height}
            sizes="(max-width: 63.99rem) 92vw, 46vw"
            quality={82}
            className={styles.image}
          />
        </div>
        {content.image.caption ? (
          <figcaption className={styles.caption}>
            {content.image.caption}
          </figcaption>
        ) : null}
      </figure>

      <div className={styles.copy}>
        {content.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className={styles.para} data-reveal="up">
            {paragraph}
          </p>
        ))}
      </div>

      <blockquote className={styles.pullquote} data-reveal="up">
        <p>{content.pullquote}</p>
      </blockquote>
    </div>
  );
}

export default BrandStory;
