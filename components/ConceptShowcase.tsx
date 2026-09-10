"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ConceptShowcaseContent } from "@/lib/content";
import { useWipeSequence } from "@/lib/wipe";
import Swash from "./Swash";
import styles from "./ConceptShowcase.module.css";

/**
 * The showcase at the foot of the story section: one very large headline, a
 * deliberately small portrait plate under it, and a caption that changes with
 * the frame.
 *
 * THE SCALE IS THE POINT. The headline is set larger than the page's own h1
 * and the plate is a fifth of its width. Neither is arbitrary — a big picture
 * under a big headline is just a slide; a big headline over a small, precise
 * frame reads as a plate in a monograph, which is the register this section
 * is in.
 *
 * THE PLATE IS PORTRAIT because its subject is: every photograph in the set
 * is a tower shot from the street, and the ratio is the one the pictures are
 * already cut to, so the crop takes nothing the frame did not mean to take.
 *
 * THE INSTRUMENT IS NOT THIS COMPONENT'S. The cut, the autoplay, the hold on
 * hover and focus, and the reduced-motion path all live in `lib/wipe`, which
 * the shared spaces at the foot of the practice section drive too — one
 * implementation, two compositions. What is here is the markup: how big the
 * frame is, what shape it is, where the caption sits and what the controls
 * look like. That is composition, and it belongs to the section.
 */

export function ConceptShowcase({
  content,
}: {
  content: ConceptShowcaseContent;
}) {
  const { heading, slides } = content;
  const count = slides.length;


  const root = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const seam = useRef<HTMLSpanElement | null>(null);
  const slideEls = useRef<(HTMLElement | null)[]>([]);
  const innerEls = useRef<(HTMLElement | null)[]>([]);
  const captionEls = useRef<(HTMLElement | null)[]>([]);

  const { index, go, hold } = useWipeSequence(count, {
    root,
    frame,
    seam,
    slides: slideEls,
    inners: innerEls,
    captions: captionEls,
  });

  return (
    <div ref={root} className={styles.showcase} {...hold}>
      <h3 className={styles.heading}>
        <Swash heading={heading} />
      </h3>

      <div ref={frame} className={styles.frame}>
        {slides.map((slide, i) => (
          <div
            key={`${i}-${slide.image.src}`}
            ref={(el) => {
              slideEls.current[i] = el;
            }}
            className={styles.slide}
            data-active={i === index}
            aria-hidden={i !== index}
          >
            <div
              ref={(el) => {
                innerEls.current[i] = el;
              }}
              className={styles.slideInner}
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes="288px"
                quality={82}
                loading="lazy"
                className={styles.image}
              />
            </div>
          </div>
        ))}

        {/* The hairline of light that travels with the wipe edge. */}
        <span ref={seam} className={styles.seam} aria-hidden="true" />
      </div>

      <p className={styles.captions} aria-live="polite">
        {slides.map((slide, i) => (
          <span
            key={`${i}-${slide.image.src}`}
            ref={(el) => {
              captionEls.current[i] = el;
            }}
            className={styles.caption}
            data-active={i === index}
            aria-hidden={i !== index}
          >
            {slide.caption}
          </span>
        ))}
      </p>

      <div className={styles.controls} role="group" aria-label="Choose a frame">
        {slides.map((slide, i) => (
          <button
            key={`${i}-${slide.image.src}`}
            type="button"
            className={styles.dot}
            data-active={i === index}
            aria-current={i === index ? "true" : undefined}
            /* The project, not the ordinal. "Frame 2 of 3" tells a screen
               reader where the control is in the row and nothing about what
               pressing it does; the count is already carried by the group. */
            aria-label={slide.name}
            onClick={() => go(i)}
          >
            <span className={styles.dotMark} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ConceptShowcase;
