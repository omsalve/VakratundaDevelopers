"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/pages";
import { revealOnEnter, timelineOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./PostGrid.module.css";

/**
 * The articles as a field of frames: photograph, date and category, title,
 * excerpt.
 *
 * NOTHING HERE IS A NEW TREATMENT. The card is ProjectGrid's card — the same
 * two-rate entrance (the mask cut in from the foot finishing first, the push
 * a beat behind it), the same meta row, the same ruled hairline. Only the
 * fields differ, because a post is a date and a reading time where a project
 * is a stage and a locality.
 *
 * THE WHOLE CARD IS THE LINK, with the title carrying the accessible name and
 * a stretched pseudo-element taking the hit area, so the excerpt is selectable
 * text rather than part of an anchor.
 */

export function PostGrid({
  posts,
  note,
}: {
  posts: BlogPost[];
  /** The small print under the field — what the photographs are of. */
  note?: string;
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(
    root,
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      for (const card of rootEl.querySelectorAll<HTMLElement>(
        `.${styles.card}`,
      )) {
        timelineOnEnter(
          { trigger: card, start: "top 88%", once: true },
          (timeline) => {
            timeline.to(card.querySelector(`.${styles.frame}`), {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.9,
              ease: "expo.out",
            });
            timeline.to(
              card.querySelector(`.${styles.image}`),
              { scale: 1, duration: 1.5, ease: "expo.out" },
              0,
            );
          },
        );
      }

      revealOnEnter(`.${styles.card} [data-reveal]`, rootEl, {
        start: "top 86%",
        stagger: 0.05,
        delay: 0.12,
      });
    },
    [posts.length],
  );

  return (
    <div ref={root}>
      <ul className={styles.grid}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.card}>
            <div className={styles.frame}>
              <Image
                src={post.image.src}
                alt={post.image.alt}
                width={post.image.width}
                height={post.image.height}
                sizes="(max-width: 47.99rem) 92vw, (max-width: 63.99rem) 46vw, 31vw"
                quality={82}
                className={styles.image}
              />
            </div>

            <p className={styles.meta} data-reveal="up">
              <span className={`u-label ${styles.category}`}>
                {post.category}
              </span>
              <span className={`u-numeral ${styles.date}`}>{post.date}</span>
            </p>

            <h3 className={styles.title} data-reveal="up">
              <Link href={`/blogs/${post.slug}`} className={styles.link}>
                {post.title}
              </Link>
            </h3>

            <p className={styles.excerpt} data-reveal="up">
              {post.excerpt}
            </p>

            <p className={styles.reading} data-reveal="up">
              {post.readingTime}
            </p>
          </li>
        ))}
      </ul>

      {note ? <p className={`u-caption ${styles.note}`}>{note}</p> : null}
    </div>
  );
}

export default PostGrid;
