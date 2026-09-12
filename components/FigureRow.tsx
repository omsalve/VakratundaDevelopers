"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/lib/content";
import { revealOnEnter, timelineOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./FigureRow.module.css";

/**
 * Two or three photographs on the section's own field, stepped against each
 * other so the row reads as a spread rather than as a strip of thumbnails.
 *
 * SAME GRAMMAR AS EVERY OTHER FRAME ON THIS SITE, and the reason it is a
 * component rather than a copy: the mask is cut in from the frame's foot, the
 * picture eases off a small push a beat behind it, and each frame carries its
 * own trigger so a row that is taller than the window does not open its last
 * frame before it is in view. That is Responsibility's community band, stated
 * once for anything that needs it.
 *
 * THE STEP IS THE POINT. A row of equal frames on one baseline is a contact
 * sheet; offsetting the second by a third of its own height makes the pair a
 * composition. It collapses at one column, where a step cannot survive.
 */

export function FigureRow({ figures }: { figures: ImageAsset[] }) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    for (const frame of rootEl.querySelectorAll<HTMLElement>(
      `.${styles.frame}`,
    )) {
      timelineOnEnter(
        { trigger: frame, start: "top 85%", once: true },
        (timeline) => {
          timeline.to(frame, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "expo.out",
          });
          timeline.to(
            frame.querySelector(`.${styles.image}`),
            { scale: 1, duration: 1.5, ease: "expo.out" },
            0,
          );
        },
      );
    }

    revealOnEnter(`.${styles.caption}`, rootEl, {
      start: "top 82%",
      stagger: 0.08,
      delay: 0.2,
    });
  }, []);

  return (
    <div ref={root} className={styles.row}>
      {figures.map((figure) => (
        <figure key={figure.src} className={styles.figure}>
          <div className={styles.frame}>
            <Image
              src={figure.src}
              alt={figure.alt}
              width={figure.width}
              height={figure.height}
              sizes="(max-width: 63.99rem) 92vw, 46vw"
              quality={82}
              className={styles.image}
            />
          </div>
          {figure.caption ? (
            <figcaption className={styles.caption} data-reveal="up">
              {figure.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

export default FigureRow;
