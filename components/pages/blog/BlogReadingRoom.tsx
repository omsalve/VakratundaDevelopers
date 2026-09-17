"use client";

import { useRef } from "react";
import Image from "next/image";
import type { BlogPost, PageHeroContent } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import {
  gsap,
  maskReveal,
  parallax,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./BlogReadingRoom.module.css";

/**
 * /blogs — the reading room.
 *
 * THE OTHER LIT PAGE, AND THE ONE THAT HAD TO BE MOST CAREFULLY SEPARATED FROM
 * /projects. Both are cream from the first pixel and both are a set of things
 * with a photograph each, so under the old template — `PageHero`, then a
 * `PostGrid` or a `ProjectGrid` of identical cards — they were the same page.
 *
 * THE SPLIT IS PHOTO-LED VERSUS TEXT-LED, and it follows from what each set is
 * FOR. A portfolio is judged on the buildings, so /projects sets big frames in
 * a four-beat rhythm and lets the photographs carry it. A journal is judged on
 * whether anything is worth reading, so this page is a CONTENTS PAGE: one lead
 * article opened out, and the rest as ruled rows where the headline is the
 * largest thing and the picture is a thumbnail at the end of the line.
 *
 * Nobody scans a reading list by its pictures. The date, the category and the
 * reading time are what decide whether to open something, so they are set on
 * the row where the eye lands first, not buried under a card.
 *
 * THE LEAD IS THE NEWEST, not a flag in the CMS. `getBlogPosts` returns them in
 * order, so the first is the lead and there is no second piece of state that
 * can disagree with the ordering — nothing to forget to unset when the next
 * article is published.
 */

export function BlogReadingRoom({
  hero,
  listing,
  posts,
  note,
}: {
  hero: PageHeroContent;
  listing: { label: string; heading: SwashHeading; standfirst: string };
  posts: BlogPost[];
  note?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  const [lead, ...rest] = posts;

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.08,
    });

    maskReveal(`.${styles.leadFrame}`, rootEl, {
      from: "bottom",
      duration: 1.3,
      start: "top 88%",
    });
    parallax(`.${styles.leadImage}`, rootEl, { distance: 5 });

    revealOnEnter(`.${styles.lead} [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.07,
    });

    revealOnEnter(`.${styles.listingHead} > [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.08,
    });

    maskReveal(`.${styles.rowRule}`, rootEl, {
      from: "left",
      duration: 0.85,
      stagger: 0.07,
      start: "top 90%",
    });

    revealOnEnter(`.${styles.row} [data-reveal]`, rootEl, {
      start: "top 90%",
      stagger: 0.04,
      delay: 0.1,
    });
  }, [posts.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        {/* ---- The opening ---- */}
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {hero.label}
          </p>

          <h1 id="page-title" className={`u-h1 ${styles.heading}`} data-reveal="up">
            <Swash heading={hero.heading} />
          </h1>

          <p className={styles.standfirst} data-reveal="up">
            {hero.standfirst}
          </p>
        </div>

        {/* ---- The lead ---- */}
        {lead ? (
          <article className={styles.lead}>
            <a className={styles.leadLink} href={`/blogs/${lead.slug}`}>
              <div className={styles.leadFrame}>
                <Image
                  src={lead.image.src}
                  alt={lead.image.alt}
                  width={lead.image.width}
                  height={lead.image.height}
                  sizes="(max-width: 62rem) 92vw, 56vw"
                  quality={82}
                  priority
                  className={styles.leadImage}
                />
              </div>

              <div className={styles.leadBody}>
                <p className={styles.leadMeta} data-reveal="up">
                  <span className={`u-label ${styles.category}`}>
                    {lead.category}
                  </span>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.date}>{lead.date}</span>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.reading}>{lead.readingTime}</span>
                </p>

                <h2 className={styles.leadTitle} data-reveal="up">
                  {lead.title}
                </h2>

                <p className={styles.leadExcerpt} data-reveal="up">
                  {lead.excerpt}
                </p>

                <span className={styles.leadAction} data-reveal="up">
                  <span>Read the article</span>
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
                </span>
              </div>
            </a>
          </article>
        ) : null}

        {/* ---- The rest, as a contents page ---- */}
        {rest.length > 0 ? (
          <div aria-labelledby="listing-title">
            <div className={styles.listingHead}>
              <p className={`u-label ${styles.label}`} data-reveal="up">
                {listing.label}
              </p>
              <h2
                id="listing-title"
                className={`u-h2 ${styles.listingHeading}`}
                data-reveal="up"
              >
                <Swash heading={listing.heading} />
              </h2>
              <p className={styles.standfirst} data-reveal="up">
                {listing.standfirst}
              </p>
            </div>

            <ul className={styles.rows}>
              {rest.map((post) => (
                <li key={post.slug} className={styles.row}>
                  <span className={styles.rowRule} aria-hidden="true" />

                  <a className={`p-row ${styles.rowLink}`} href={`/blogs/${post.slug}`}>
                    <span className={styles.rowMeta} data-reveal="up">
                      <span className={`u-label ${styles.category}`}>
                        {post.category}
                      </span>
                      <span className={styles.date}>{post.date}</span>
                    </span>

                    <span className={styles.rowMain} data-reveal="up">
                      <span className={styles.rowTitle}>{post.title}</span>
                      <span className={styles.rowExcerpt}>{post.excerpt}</span>
                      <span className={styles.reading}>{post.readingTime}</span>
                    </span>

                    {/* The picture comes last and small: on a reading list it
                        is a reminder, not the reason to open something. */}
                    <span className={styles.thumb} data-reveal="up">
                      <Image
                        src={post.image.src}
                        alt=""
                        width={post.image.width}
                        height={post.image.height}
                        sizes="120px"
                        quality={60}
                        className={styles.thumbImage}
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {note ? (
          <p className={`u-caption ${styles.note}`}>{note}</p>
        ) : null}
      </div>
    </section>
  );
}

export default BlogReadingRoom;
