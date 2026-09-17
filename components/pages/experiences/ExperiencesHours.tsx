"use client";

import { useRef } from "react";
import Image from "next/image";
import type { CardItem } from "@/lib/pages";
import type { ImageAsset, SwashHeading } from "@/lib/content";
import {
  gsap,
  maskReveal,
  parallax,
  revealOnEnter,
  scrubProgress,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ExperiencesHours.module.css";

/**
 * /experiences — the day, hour by hour.
 *
 * THE CONTENT ALREADY KNEW WHAT THIS PAGE WAS. Each moment's `eyebrow` is a
 * clock time — 07:40, and so on — and the old page set those as the small
 * caps label in the corner of a card in a two-column grid, which is the one
 * arrangement that throws away the fact that they are times at all.
 *
 * SO THE TIME IS THE PAGE. Each moment is a full-bleed photograph with its
 * hour set over it at display scale, the copy in a panel beside it, and the
 * sides alternating so the day reads as a sequence of frames rather than a
 * list of features. It is the only page on the site where type sits over
 * photography — everywhere else a photograph is a plate with its caption
 * underneath — and that single rule is what makes it unmistakable.
 *
 * THE GROUND LIFTS THROUGH THE DAY. `scrubProgress` writes this section's own
 * progress to a custom property; CSS interpolates the ground from the deep
 * navy of the opening toward the lighter navy at the top of the day and back
 * down at last light. One token moving, no colour mixed in JavaScript.
 *
 * FIGURES ARE PAIRED BY POSITION AND NEITHER SIDE IS ASSUMED. A moment with no
 * photograph is set as a typographic band on the ground instead of borrowing
 * somebody else's frame — the site's rule is that photographs are the only
 * filled shapes and therefore the only thing that reads as evidence, so a
 * moment without one shows none.
 */

export function ExperiencesHours({
  label,
  heading,
  standfirst,
  items,
  figures,
}: {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  items: CardItem[];
  figures: ImageAsset[];
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    for (const hour of rootEl.querySelectorAll<HTMLElement>(`.${styles.hour}`)) {
      const frame = hour.querySelector(`.${styles.frame}`);
      if (frame) {
        maskReveal(frame, hour, { from: "bottom", duration: 1.3, start: "top 82%" });
        parallax(hour.querySelectorAll(`.${styles.image}`), hour, { distance: 7 });
      }

      revealOnEnter(hour.querySelectorAll("[data-reveal]"), hour, {
        start: "top 80%",
        stagger: 0.07,
        delay: 0.15,
      });

      // The hour itself arrives large and settles, the way a title card does.
      const time = hour.querySelector(`.${styles.time}`);
      if (time) {
        gsap.fromTo(
          time,
          { opacity: 0, scale: 1.14 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: { trigger: hour, start: "top 80%", once: true },
          },
        );
      }
    }

    const trigger = scrubProgress(rootEl, (progress) => {
      rootEl.style.setProperty("--day", progress.toFixed(3));
    });
    return () => trigger.kill();
  }, [items.length, figures.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="day-title">
      <span className={styles.wash} aria-hidden="true" />

      <div className={`u-shell ${styles.head}`}>
        <p className={`u-label ${styles.label}`} data-reveal="up">
          {label}
        </p>
        <h2 id="day-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
          <Swash heading={heading} />
        </h2>
        <p className={styles.standfirst} data-reveal="up">
          {standfirst}
        </p>
      </div>

      <ol className={styles.hours}>
        {items.map((item, index) => {
          const figure = figures[index];

          return (
            <li
              key={item.id}
              className={styles.hour}
              data-side={index % 2 === 0 ? "left" : "right"}
              data-bare={figure ? undefined : "true"}
            >
              {figure ? (
                <figure className={styles.figure}>
                  {/* The clipped box. The caption is deliberately OUTSIDE it —
                      see the note in the stylesheet. */}
                  <div className={styles.frame}>
                    <Image
                      src={figure.src}
                      alt={figure.alt}
                      width={figure.width}
                      height={figure.height}
                      sizes="(max-width: 62rem) 100vw, 62vw"
                      quality={82}
                      className={styles.image}
                    />
                    {/* The scrim exists so the hour set over the photograph
                        keeps its contrast whatever the frame happens to be. */}
                    <span className={styles.scrim} aria-hidden="true" />

                    {/* Decorative: the same time is the moment's own eyebrow
                        in the panel, where it is read. */}
                    {item.eyebrow ? (
                      <span className={`p-numeral ${styles.time}`} aria-hidden="true">
                        {item.eyebrow}
                      </span>
                    ) : null}
                  </div>

                  {figure.caption ? (
                    <figcaption className={`u-caption ${styles.caption}`}>
                      {figure.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}

              <div className={styles.panel}>
                {item.eyebrow ? (
                  <p className={`p-numeral ${styles.panelTime}`} data-reveal="up">
                    {item.eyebrow}
                  </p>
                ) : null}

                <h3 className={`u-h3 ${styles.title}`} data-reveal="up">
                  {item.title}
                </h3>

                <p className={styles.body} data-reveal="up">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default ExperiencesHours;
