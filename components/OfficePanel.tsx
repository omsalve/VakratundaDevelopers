"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ContactPageContent } from "@/lib/pages";
import { revealOnEnter, timelineOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./OfficePanel.module.css";

/**
 * The office: the address, when it is open, and the map of where the group
 * has built.
 *
 * THE ADDRESS IS AN `<address>`. It is the one block on this site that a
 * browser, a screen reader and a phone all know how to act on, and wrapping it
 * in a `<div>` to save a line throws that away. The email is a `mailto:` for
 * the same reason.
 *
 * The field, the frame and the caption are BrandStory's — the counter-space
 * layout the site already uses for a photograph with type beside it.
 */

export function OfficePanel({
  office,
  email,
}: {
  office: ContactPageContent["office"];
  email: string;
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    timelineOnEnter(
      { trigger: rootEl, start: "top 84%", once: true },
      (timeline) => {
        timeline.to(`.${styles.frame}`, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          ease: "expo.out",
        });
        timeline.to(
          `.${styles.image}`,
          { scale: 1, duration: 1.5, ease: "expo.out" },
          0,
        );
      },
    );

    revealOnEnter(`.${styles.detail} [data-reveal]`, rootEl, {
      start: "top 82%",
      stagger: 0.08,
      delay: 0.12,
    });
  }, []);

  return (
    <div ref={root} className={`u-shell ${styles.field}`}>
      <figure className={styles.figure}>
        <div className={styles.frame}>
          <Image
            src={office.image.src}
            alt={office.image.alt}
            width={office.image.width}
            height={office.image.height}
            sizes="(max-width: 63.99rem) 92vw, 56vw"
            quality={82}
            className={styles.image}
          />
        </div>
        {office.image.caption ? (
          <figcaption className={styles.caption}>
            {office.image.caption}
          </figcaption>
        ) : null}
      </figure>

      <div className={styles.detail}>
        <address className={styles.address} data-reveal="up">
          {office.addressLines.map((line) => (
            <span key={line} className={styles.addressLine}>
              {line}
            </span>
          ))}
        </address>

        <p data-reveal="up">
          <a className={styles.email} href={`mailto:${email}`}>
            {email}
          </a>
        </p>

        <ul className={styles.hours} data-reveal="up">
          {office.hours.map((line) => (
            <li key={line} className={styles.hoursLine}>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OfficePanel;
