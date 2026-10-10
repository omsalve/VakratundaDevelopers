"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import type { AboutPageContent } from "@/lib/pages";
import { drawOnEnter, maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import PortraitPlate from "@/components/PortraitPlate";
import Swash from "@/components/Swash";
import styles from "./AboutFamily.module.css";

/**
 * /about — the Chairman and the Director, husband and wife, in one photograph.
 *
 * ONE SLOT, ONE IMAGE. The photograph is uploaded in /admin (About → Husband
 * and wife) and nothing else about the section is editable there: the heading
 * and standfirst are this page's shipped copy. Until a photograph exists the
 * slot is an empty frame — PortraitPlate's mounted blank.
 *
 * THE FRAME TAKES THE PHOTOGRAPH'S OWN SHAPE. It is a photograph of two people,
 * taken in whatever shape the photographer chose, so the frame is cut to fit
 * it rather than the other way round: nothing is cropped, and nothing is
 * letterboxed. (FitImage, which letterboxes behind a blurred copy of the same
 * picture, was tried here and read as three images, not one.) A tall photograph
 * is capped in height by the stylesheet so it cannot outgrow the screen.
 *
 * THE LINE RUNS THROUGH IT. It sits between the story and the cream stations,
 * so it carries the page's rose thread on from AboutThread to AboutStations
 * the way every other section here does, scrubbed by the reader's own scroll.
 */

const NO_IMAGE = { src: "", alt: "", width: 0, height: 0 };

/** The empty frame's shape: portrait, which is how a seated-and-standing pair is shot. */
const EMPTY_RATIO = "2 / 3";
const EMPTY_N = 2 / 3;

export function AboutFamily({ content }: { content: AboutPageContent["family"] }) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    drawOnEnter(`.${styles.threadPath}`, rootEl, {
      scrub: true,
      start: "top 80%",
      end: "bottom 80%",
    });

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Uncovered from the bottom edge, the way the story's plate is.
    maskReveal(`.${styles.slot}`, rootEl, {
      from: "bottom",
      duration: 1.3,
      start: "top 70%",
    });
  }, []);

  const { image } = content;
  const ratio = image ? `${image.width} / ${image.height}` : EMPTY_RATIO;

  return (
    <section ref={root} className={styles.section} aria-labelledby="family-title">
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
          <h2 id="family-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>
        </div>

        <figure
          className={styles.figure}
          style={
            {
              "--slot-ratio": ratio,
              "--slot-n": image ? image.width / image.height : EMPTY_N,
            } as CSSProperties
          }
        >
          {image ? (
            <div className={`p-plate ${styles.slot}`}>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 47.99rem) 90vw, 46rem"
                quality={82}
              />
            </div>
          ) : (
            <PortraitPlate
              className={styles.slot}
              image={NO_IMAGE}
              name=""
              ratio={ratio}
              sizes="46rem"
            />
          )}
        </figure>
      </div>
    </section>
  );
}

export default AboutFamily;
