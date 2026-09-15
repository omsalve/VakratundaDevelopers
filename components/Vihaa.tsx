"use client";

import { useRef } from "react";
import Image from "next/image";
import type { VihaaContent } from "@/lib/content";
import {
  gsap,
  revealOnEnter,
  timelineOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "./Swash";
import styles from "./Vihaa.module.css";

/**
 * Vihaa International School — a joint venture, given a section of its own.
 *
 * IT WAS A LINE IN THE LEDGER. The school used to be the second slide of
 * Responsibility, under a heading about what the group owes. A joint venture
 * is not owed to anybody: it is a stake, entered into, and answered for. So it
 * leaves the ledger and stands directly after the ventures, where the page is
 * already naming the partnerships the group is measured alongside.
 *
 * THE NAME IS SET THE WAY THE PARTNERS' NAMES ARE. The ventures above set each
 * partner in capitals across the foot of its photograph, the frame dissolving
 * into the cream under the letters. The school opens on exactly that grammar,
 * at the width of the shell rather than of one portrait — so a visitor who has
 * just stepped through Godrej Properties and Shapoorji Pallonji reads VIHAA as
 * the next name in the same register, before a sentence of copy says so.
 *
 * THE ARGUMENT HOLDS STILL AND THE DAY GOES PAST IT. Under the cover, the copy
 * is sticky in the near columns while the school's own photographs run by in
 * two columns across the far ones — the second column drifting against the
 * first, so the pair reads as a spread rather than a contact sheet. Not a pin:
 * the page already has two scroll set pieces and a section it drives by hand,
 * and this one only has to be read, beside the evidence for it.
 *
 * With no JavaScript, under reduced motion, or narrow, every frame is open and
 * the section is one column in document order.
 */

/** Where the drift is built. Below this the two columns are a plain pair. */
const DRIFT_QUERY = "(min-width: 64rem)";

export function Vihaa({ content }: { content: VihaaContent }) {
  const root = useRef<HTMLElement | null>(null);

  /* Dealt into two columns in reading order — left, right, left — so the
     sequence in content.ts is the sequence the eye takes down the spread. */
  const columns = [0, 1].map((c) =>
    content.moments.filter((_, i) => i % 2 === c),
  );

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;

    /* ---- The cover: the frame cut in from its foot, the picture easing off
       a push inside it, and the name rising out of its own mask a beat
       behind — the ventures' slide change, played once, at shell width. */
    const cover = section.querySelector<HTMLElement>(`.${styles.cover}`);
    if (cover) {
      timelineOnEnter({ trigger: cover, start: "top 78%", once: true }, (tl) => {
        tl.to(cover.querySelector(`.${styles.coverFrame}`), {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.15,
          ease: "expo.out",
        })
          .to(
            cover.querySelector(`.${styles.coverImage}`),
            { scale: 1, duration: 1.9, ease: "expo.out" },
            0,
          )
          .to(
            cover.querySelector(`.${styles.nameInk}`),
            { y: 0, duration: 1.1, ease: "expo.out" },
            0.3,
          )
          .to(
            cover.querySelector(`.${styles.nameRest}`),
            { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" },
            0.52,
          );
      });
    }

    const copy = section.querySelector<HTMLElement>(`.${styles.copy}`);
    if (copy) {
      revealOnEnter(copy.querySelectorAll("[data-reveal]"), copy, {
        stagger: 0.09,
      });
    }

    /* ---- The moments: each frame on its own trigger, so a column taller
       than the window never opens its last photograph before it is seen. */
    for (const moment of section.querySelectorAll<HTMLElement>(
      `.${styles.moment}`,
    )) {
      timelineOnEnter({ trigger: moment, start: "top 88%", once: true }, (tl) => {
        tl.to(moment.querySelector(`.${styles.frame}`), {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.95,
          ease: "expo.out",
        })
          .to(
            moment.querySelector(`.${styles.image}`),
            { scale: 1, duration: 1.6, ease: "expo.out" },
            0,
          )
          .to(
            moment.querySelector(`.${styles.caption}`),
            { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" },
            0.22,
          );
      });
    }

    /* ---- The drift. The far column travels against the near one across the
       whole of the field's time on screen — bounded, and scrubbed with a
       short lag so it settles when the wheel stops. */
    const mm = gsap.matchMedia();
    mm.add(DRIFT_QUERY, () => {
      const field = section.querySelector(`.${styles.moments}`);
      const late = section.querySelectorAll(`.${styles.column}`)[1];
      if (!field || !late) return;

      gsap.fromTo(
        late,
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: field,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="vihaa"
      className={`on-cream ${styles.section}`}
      aria-labelledby="vihaa-title"
    >
      <div className="u-shell">
        {/* ---- The cover, and the name across its foot ------------------- */}
        <div className={styles.cover}>
          <div className={styles.coverFrame}>
            <Image
              src={content.cover.src}
              alt={content.cover.alt}
              width={content.cover.width}
              height={content.cover.height}
              sizes="(max-width: 84rem) 92vw, 78rem"
              quality={82}
              className={styles.coverImage}
            />
          </div>

          <h2 id="vihaa-title" className={styles.name}>
            <span className={styles.nameMask}>
              <span className={styles.nameInk}>{content.name.mark}</span>
            </span>{" "}
            <span className={styles.nameRest} data-reveal="up">
              {content.name.rest}
            </span>
          </h2>
        </div>

        <div className={styles.field}>
          {/* ---- The argument, held still ------------------------------- */}
          <div className={styles.copy}>
            <p className={`u-h2 ${styles.statement}`} data-reveal="up">
              <Swash heading={content.heading} />
            </p>
            <p className={styles.standfirst} data-reveal="up">
              {content.standfirst}
            </p>

            {/* The ventures' own label-over-value pair, so the school is
                recorded the way each partnership above it is. */}
            <dl className={styles.facts} data-reveal="up">
              {content.facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt className={styles.factLabel}>{fact.label}</dt>
                  <dd className={styles.factValue}>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className={styles.note} data-reveal="up">
              {content.note}
            </p>
          </div>

          {/* ---- The day, going past it --------------------------------- */}
          <div className={styles.moments}>
            {columns.map((column, c) => (
              <div key={c} className={styles.column}>
                {column.map((moment) => (
                  <figure key={moment.src} className={styles.moment}>
                    <div className={styles.frame}>
                      <Image
                        src={moment.src}
                        alt={moment.alt}
                        width={moment.width}
                        height={moment.height}
                        sizes="(max-width: 63.99rem) 46vw, 24vw"
                        quality={82}
                        className={styles.image}
                      />
                    </div>
                    {moment.caption ? (
                      <figcaption className={styles.caption} data-reveal="up">
                        {moment.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Vihaa;
