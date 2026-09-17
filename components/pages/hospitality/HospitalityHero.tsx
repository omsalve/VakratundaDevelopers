"use client";

import { useRef } from "react";
import Image from "next/image";
import type { PageHeroContent } from "@/lib/pages";
import type { ImageAsset } from "@/lib/content";
import { gsap, maskReveal, parallax, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./HospitalityHero.module.css";

/**
 * /hospitality — the arrival.
 *
 * A SPLIT FRAME: the copy on one side, a single photograph running the full
 * height of the screen and bleeding off the other edge. No other opening on
 * the site is built this way, and the reason it belongs here is the
 * photograph itself — the dining room is shot PORTRAIT (941 × 1672), which is
 * the wrong shape for the plates and full-bleed bands every other page uses
 * and exactly the right shape for a column that runs floor to ceiling.
 *
 * THE STORY BAND BELOW THEN CARRIES NO PHOTOGRAPH. This is the page's one
 * picture and it is spent here, where it does the most work; the story is set
 * as a typographic spread instead. That is a deliberate re-allocation of the
 * same `StoryContent` — the shape in lib/pages/types.ts is unchanged, and the
 * image is still read from it rather than from anywhere new.
 *
 * Motion: the photograph is uncovered from its bottom edge and then drifts
 * against the scroll, which is the whole of it. A page about being received
 * well does not need to perform.
 */

export function HospitalityHero({
  content,
  image,
}: {
  content: PageHeroContent;
  image: ImageAsset;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    maskReveal(`.${styles.frame}`, rootEl, {
      from: "bottom",
      duration: 1.5,
    });
    parallax(`.${styles.image}`, rootEl, { distance: 6 });

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
      delay: 0.25,
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      {/* The column of photograph, bleeding off the trailing edge. */}
      <figure className={styles.figure}>
        <div className={styles.frame}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 62rem) 100vw, 44vw"
            quality={84}
            priority
            className={styles.image}
          />
          <span className={styles.scrim} aria-hidden="true" />
        </div>

        {image.caption ? (
          <figcaption className={`u-caption ${styles.caption}`}>
            {image.caption}
          </figcaption>
        ) : null}
      </figure>

      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>

          <h1 id="page-title" className={`u-display ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h1>

          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>

          <ul className={styles.meta} data-reveal="up">
            {content.meta.map((item) => (
              <li key={item} className={styles.metaItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HospitalityHero;
