"use client";

import { useRef } from "react";
import Image from "next/image";
import type { BlogPost } from "@/lib/pages";
import type { Cta } from "@/lib/content";
import {
  gsap,
  maskReveal,
  parallax,
  revealOnEnter,
  scrubProgress,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./BlogArticle.module.css";

/**
 * /blogs/[slug] — one article.
 *
 * WHAT THIS REPLACES. The article used to be `PageHero` + `ProseDoc`, and the
 * old comment argued that reusing the terms-page component was "the right way
 * round rather than a compromise" because a legal clause set and an article
 * are the same problem. They are not, and the redesign of the three legal
 * pages is what makes that obvious: a clause set is SEARCHED — you arrive
 * looking for clause 4 — while an article is READ, start to finish, once.
 *
 * SO THIS IS A SINGLE CENTRED COLUMN. No sticky clause rail beside it, which
 * is what /grievance-redressal has and needs; the contents sit once at the
 * top, for somebody deciding whether to commit, and then get out of the way.
 * The only persistent thing is a reading-progress rule, because the one
 * question a reader of a long article has is how much is left.
 *
 * IT IS THE READING ROOM'S OWN CHILD. Same cream ground, same editorial type,
 * same dateline vocabulary as the listing it was opened from — arriving here
 * from /blogs should feel like turning a page rather than visiting a different
 * site.
 *
 * THE HERO HAD TO CHANGE ANYWAY. `PageHero` paints a navy ground and rules a
 * pale rose hairline, and /blogs is now a lit page — that hero on cream was a
 * dark band with a 1.85:1 rule across it.
 */

export function BlogArticle({
  post,
  contentsLabel,
  updatedLabel,
  byline,
  backCta,
  note,
}: {
  post: BlogPost;
  contentsLabel: string;
  updatedLabel: string;
  byline: string[];
  backCta: Cta;
  note?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

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

    maskReveal(`.${styles.frame}`, rootEl, {
      from: "bottom",
      duration: 1.4,
      delay: 0.2,
    });
    parallax(`.${styles.image}`, rootEl, { distance: 5 });

    revealOnEnter(`.${styles.contentsItem}`, rootEl, {
      start: "top 92%",
      stagger: 0.04,
    });

    revealOnEnter(`.${styles.clause} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.05,
    });

    revealOnEnter(`.${styles.close} [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.08,
    });

    const bar = rootEl.querySelector<HTMLElement>(`.${styles.progressFill}`);
    const body = rootEl.querySelector<HTMLElement>(`.${styles.body}`);
    if (!bar || !body) return;
    const progress = scrubProgress(
      body,
      (value) => gsap.set(bar, { scaleX: value }),
      { start: "top 70%", end: "bottom bottom" },
    );
    return () => progress.kill();
  }, [post.slug]);

  return (
    <article ref={root} className={styles.article}>
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.progressFill} />
      </div>

      {/* ---- The opening ---- */}
      <header className={styles.opening}>
        <div className={`u-shell ${styles.openingInner}`}>
          <div className={styles.stack}>
            <p className={styles.dateline} data-reveal="up">
              <span className={`u-label ${styles.category}`}>{post.category}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.metaText}>{post.readingTime}</span>
            </p>

            <h1 className={`u-h1 ${styles.title}`} data-reveal="up">
              <Swash heading={post.swashTitle} />
            </h1>

            <p className={styles.excerpt} data-reveal="up">
              {post.excerpt}
            </p>

            <p className={styles.byline} data-reveal="up">
              <span className={styles.metaText}>
                {updatedLabel} {post.date}
              </span>
              {byline.map((line) => (
                <span key={line} className={styles.metaText}>
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        <figure className={styles.figure}>
          <div className={styles.frame}>
            <Image
              src={post.image.src}
              alt={post.image.alt}
              width={post.image.width}
              height={post.image.height}
              sizes="(max-width: 62rem) 100vw, 76vw"
              quality={84}
              priority
              className={styles.image}
            />
          </div>
          {post.image.caption ? (
            <figcaption className={`u-caption ${styles.caption}`}>
              {post.image.caption}
            </figcaption>
          ) : null}
        </figure>
      </header>

      {/* ---- The article ---- */}
      <div className={`u-shell ${styles.column}`}>
        {/* The contents sit once, at the top, for somebody deciding whether to
            commit — then get out of the way. A rail beside the text is what a
            document that is SEARCHED wants; this one is read. */}
        <nav className={styles.contents} aria-label={contentsLabel}>
          <p className={`u-label ${styles.contentsLabel}`}>{contentsLabel}</p>
          <ol className={styles.contentsList}>
            {post.body.map((clause, index) => (
              <li key={clause.id} className={styles.contentsItem} data-reveal="up">
                <a className={styles.contentsLink} href={`#${clause.id}`}>
                  <span className={`p-numeral ${styles.contentsNumber}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{clause.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.body}>
          {post.body.map((clause, index) => (
            <section key={clause.id} id={clause.id} className={styles.clause}>
              <h2 className={styles.clauseHeading} data-reveal="up">
                {clause.heading}
              </h2>

              {clause.body?.map((paragraph, paraIndex) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className={styles.para}
                  data-reveal="up"
                >
                  {/* One drawn cap per article, on its first paragraph — the
                      same device /about opens its story on. */}
                  {index === 0 && paraIndex === 0 ? (
                    <>
                      <span className={styles.drop} aria-hidden="true">
                        {paragraph.charAt(0)}
                      </span>
                      {paragraph.slice(1)}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}

              {clause.list ? (
                <ul className={styles.list} data-reveal="up">
                  {clause.list.map((point) => (
                    <li key={point.slice(0, 40)}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <footer className={styles.close}>
          {note ? (
            <p className={`u-caption ${styles.note}`} data-reveal="up">
              {note}
            </p>
          ) : null}

          <p data-reveal="up">
            <a className={styles.back} href={backCta.href}>
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
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              <span>{backCta.label}</span>
            </a>
          </p>
        </footer>
      </div>
    </article>
  );
}

export default BlogArticle;
