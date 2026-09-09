"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { GalleryContent } from "@/lib/content";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import Lightbox from "./Lightbox";
import Swash from "./Swash";
import styles from "./GalleryCarousel.module.css";

/**
 * The portfolio rail.
 *
 * Built on native CSS scroll-snap rather than a drag library: touch gets real
 * momentum for free, the whole thing works with JavaScript disabled, and the
 * slides stay in the accessibility tree in document order. JS only adds the
 * conveniences — the live counter, the arrow keys, the thumbnail jump, and
 * the lightbox.
 *
 * Motion here is deliberately plain. The arc and the parallax are the page's
 * set pieces; a carousel that also performs would be noise.
 */

export function GalleryCarousel({ content }: { content: GalleryContent }) {
  const root = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const total = content.slides.length;

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter(`.${styles.head} > *`, root.current, { stagger: 0.09 });
  }, []);

  // Which slide is centred? Observed rather than computed, so it stays right
  // through momentum scrolling, resizes and zoom.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = slideRefs.current.indexOf(visible.target as HTMLLIElement);
        if (index >= 0) setActive(index);
      },
      { root: track, threshold: [0.5, 0.75, 1] },
    );

    slideRefs.current.forEach((slide) => slide && observer.observe(slide));
    return () => observer.disconnect();
  }, [total]);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, slideRefs.current.length - 1));
    slideRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const onTrackKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(total - 1);
    }
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  return (
    <section
      ref={root}
      id="projects"
      className={styles.section}
      aria-labelledby="projects-title"
    >
      <div className={`u-shell ${styles.head}`}>
        <h2 id="projects-title" className={`u-h2 ${styles.title}`}>
          <Swash heading={content.heading} />
        </h2>
        <p className={styles.standfirst}>{content.standfirst}</p>
      </div>

      <ul
        ref={trackRef}
        className={styles.track}
        tabIndex={0}
        onKeyDown={onTrackKeyDown}
        aria-label={`${content.heading.before ?? ""}${content.heading.swash} — ${total} projects. Use the left and right arrow keys to move through them.`}
      >
        {content.slides.map((slide, index) => (
          <li
            key={slide.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className={clsx(styles.slide, index === active && styles.isActive)}
          >
            <button
              type="button"
              className={styles.card}
              onClick={() => setLightboxIndex(index)}
              aria-label={`View ${slide.name}, ${slide.locality}, larger`}
            >
              <span className={styles.frame}>
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  sizes="(max-width: 48rem) 78vw, (max-width: 80rem) 40vw, 26rem"
                  quality={82}
                  // Only the first card can be above the fold on any width.
                  loading={index === 0 ? "eager" : "lazy"}
                  className={styles.image}
                />
                <span className={styles.status} data-status={slide.status}>
                  {slide.status}
                </span>
              </span>
              <span className={styles.meta}>
                <span className={styles.name}>{slide.name}</span>
                <span className={styles.locality}>{slide.locality}</span>
                <span className={styles.blurb}>{slide.blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={`u-shell ${styles.controls}`}>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.nav}
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
          >
            <Chevron direction="left" />
            <span className="u-visually-hidden">Previous project</span>
          </button>
          <button
            type="button"
            className={styles.nav}
            onClick={() => goTo(active + 1)}
            disabled={active === total - 1}
          >
            <Chevron direction="right" />
            <span className="u-visually-hidden">Next project</span>
          </button>
        </div>

        <p className={styles.counter} aria-live="polite">
          <span className="u-visually-hidden">Showing project </span>
          <span className={clsx(styles.counterNow, "u-numeral")}>
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className={styles.counterRule} aria-hidden="true" />
          <span className={clsx(styles.counterTotal, "u-numeral")}>
            {String(total).padStart(2, "0")}
          </span>
        </p>

        {/* Thumbnails are a shortcut, not the only route — the rail above is
            fully operable on its own, so these are hidden from AT. */}
        <ol className={styles.thumbs} aria-hidden="true">
          {content.slides.map((slide, index) => (
            <li key={slide.id}>
              <button
                type="button"
                tabIndex={-1}
                className={clsx(
                  styles.thumb,
                  index === active && styles.thumbActive,
                )}
                onClick={() => goTo(index)}
              >
                <Image
                  src={slide.image.src}
                  alt=""
                  width={80}
                  height={100}
                  sizes="56px"
                  quality={45}
                  loading="lazy"
                  className={styles.thumbImage}
                />
              </button>
            </li>
          ))}
        </ol>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          slides={content.slides}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </section>
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

export default GalleryCarousel;
