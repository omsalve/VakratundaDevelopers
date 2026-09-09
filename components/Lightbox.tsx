"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { ProjectSlide } from "@/lib/content";
import { useFocusTrap } from "@/lib/useFocusTrap";
import styles from "./Lightbox.module.css";

/**
 * Full-screen image viewer. A real modal: it takes focus, traps Tab, hides the
 * rest of the page from assistive tech, closes on Escape or backdrop click,
 * and restores focus to whatever opened it.
 *
 * Rendered through a portal on purpose — the gallery and the immersive scene
 * both sit inside GSAP-transformed ancestors, and a transform creates a
 * containing block that would otherwise capture `position: fixed`.
 */

type Props = {
  slides: ProjectSlide[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({ slides, index, onClose, onNavigate }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useFocusTrap(dialogRef, mounted, onClose);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate((index + 1) % slides.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate((index - 1 + slides.length) % slides.length);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, slides.length, onNavigate]);

  if (!mounted) return null;

  const slide = slides[index];
  if (!slide) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${slide.name}, ${slide.locality}. Image ${index + 1} of ${slides.length}`}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <Image
              src={slide.image.src}
              alt={slide.image.alt}
              width={slide.image.width}
              height={slide.image.height}
              sizes="(max-width: 60rem) 92vw, 62vw"
              className={styles.image}
            />
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.captionName}>{slide.name}</span>
            <span className={styles.captionMeta}>
              {slide.locality} · {slide.status}
            </span>
            <span className={styles.captionBlurb}>{slide.blurb}</span>
          </figcaption>
        </figure>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.nav}
            onClick={() => onNavigate((index - 1 + slides.length) % slides.length)}
          >
            <Chevron direction="left" />
            <span className="u-visually-hidden">Previous project</span>
          </button>
          <p className={styles.counter}>
            <span className="u-numeral">{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.counterRule} aria-hidden="true" />
            <span className="u-numeral">
              {String(slides.length).padStart(2, "0")}
            </span>
          </p>
          <button
            type="button"
            className={styles.nav}
            onClick={() => onNavigate((index + 1) % slides.length)}
          >
            <Chevron direction="right" />
            <span className="u-visually-hidden">Next project</span>
          </button>
        </div>

        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          data-autofocus
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <span className="u-visually-hidden">Close viewer</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default Lightbox;
