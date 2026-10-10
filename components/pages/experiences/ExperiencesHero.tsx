"use client";

import { useRef } from "react";
import Image from "next/image";
import type { PageHeroContent } from "@/lib/pages";
import { gsap, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ExperiencesHero.module.css";

/**
 * /experiences — the opening, as the front of a postcard.
 *
 * THE PAGE IS A STACK OF POSTCARDS, and this is the first one, held up to the
 * light: the photograph on its cream stock, the headline lettered across the
 * sky the way a picture postcard names its view. It is the page's signature at
 * full size — this is still the only page on the site where type sits over a
 * photograph, and the postcard is where that device comes from.
 *
 * THE TYPE TAKES THE SKY. The shade is laid from the left, where the
 * headline is, and from the foot, where the standfirst is, so the sun and the
 * skyline on the right are left clear. On a phone the crop holds to the right
 * of centre for the same reason: the sun stays in the frame.
 *
 * A page global with no photograph still renders: the stock is drawn without
 * a picture and the type sits on the night ground, as the opening did before.
 *
 * The only movement is the photograph settling into its stock as the type
 * rises — no clip, no wait: the photograph is the largest thing on the page
 * and it is painted on the first frame.
 */

export function ExperiencesHero({ content }: { content: PageHeroContent }) {
  const root = useRef<HTMLElement | null>(null);
  const photograph = content.image;

  useGsapScope(root, () => {
    gsap.to(`.${styles.image}`, {
      scale: 1,
      duration: 2.4,
      ease: "expo.out",
    });
    gsap.to(`.${styles.copy} [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.15,
      ease: "expo.out",
      stagger: 0.1,
      delay: 0.15,
    });
  }, []);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={styles.card} data-bare={photograph ? undefined : "true"}>
        <div className={styles.photo}>
          {photograph ? (
            <>
              <Image
                src={photograph.src}
                alt={photograph.alt}
                fill
                priority
                sizes="100vw"
                quality={82}
                className={styles.image}
              />
              <span className={styles.shade} aria-hidden="true" />
            </>
          ) : null}

          <div className={styles.copy}>
            <div className={styles.lead}>
              <p className={`u-label ${styles.label}`} data-reveal="up">
                {content.label}
              </p>
              <h1
                id="page-title"
                className={`u-display ${styles.heading}`}
                data-reveal="up"
              >
                <Swash heading={content.heading} />
              </h1>
            </div>

            <div className={styles.foot}>
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
        </div>
      </div>
    </section>
  );
}

export default ExperiencesHero;
