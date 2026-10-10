"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import type { PlaceFigure } from "@/lib/pages";
import type { SwashHeading } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ExperiencesSpaces.module.css";

/**
 * /experiences — every other space, as the rack the postcards came from.
 *
 * The pile above is six moments, chosen and told. This is everything else the
 * residents share, shown rather than told: one card per place, at the shape of
 * its own photograph — portrait cards stand among the landscapes as they do
 * in a shop's rack — each with the place's name and one line on what is in
 * the frame.
 *
 * EVERY PHOTOGRAPH IS SEEN WHOLE. A card takes its photograph's ratio and the
 * rack is set in columns, so nothing is cropped to make a grid square up.
 *
 * Read, not operated: no carousel and no lightbox. The pile above is the one
 * thing on this page a visitor drives.
 */

export function ExperiencesSpaces({
  label,
  heading,
  standfirst,
  figures,
}: {
  label: string;
  heading: SwashHeading;
  standfirst: string;
  figures: PlaceFigure[];
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.head} [data-reveal]`, rootEl, { stagger: 0.09 });

    // Each card is put up in the rack: it rises into its slot and straightens.
    rootEl.querySelectorAll<HTMLElement>(`.${styles.slot}`).forEach((slot, index) => {
      const stock = slot.querySelector(`.${styles.stock}`);
      if (!stock) return;
      gsap.from(stock, {
        yPercent: 10,
        rotate: index % 2 === 0 ? -2.4 : 2.4,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "transform",
        scrollTrigger: { trigger: slot, start: "top 92%", once: true },
      });
    });
  }, [figures.length]);

  if (figures.length === 0) return null;

  return (
    <section ref={root} className={styles.section} aria-labelledby="spaces-title">
      <div className="u-shell">
        <div className={styles.head}>
          <div className={styles.headLead}>
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {label}
            </p>
            <h2 id="spaces-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
              <Swash heading={heading} />
            </h2>
          </div>
          <p className={styles.standfirst} data-reveal="up">
            {standfirst}
          </p>
        </div>

        <ul className={styles.rack}>
          {figures.map((figure) => {
            const ratio =
              figure.width && figure.height
                ? Math.min(Math.max(figure.width / figure.height, 0.5), 2.4)
                : 16 / 9;

            return (
              <li key={`${figure.name}-${figure.src}`} className={styles.slot}>
                <figure className={styles.card}>
                  <div className={styles.stock}>
                    <div
                      className={styles.frame}
                      style={{ "--ratio": ratio } as CSSProperties}
                    >
                      <Image
                        src={figure.src}
                        alt={figure.alt}
                        fill
                        sizes="(max-width: 48rem) 46vw, (max-width: 84rem) 31vw, 27rem"
                        quality={82}
                        className={styles.image}
                      />
                    </div>
                  </div>
                  <figcaption className={styles.caption}>
                    <span className={styles.rule} aria-hidden="true" />
                    <span className={styles.place}>{figure.name}</span>
                    {figure.caption ? (
                      <span className={styles.note}>{figure.caption}</span>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default ExperiencesSpaces;
