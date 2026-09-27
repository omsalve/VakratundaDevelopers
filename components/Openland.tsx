"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { OpenlandContent } from "@/lib/content";
import {
  countUp,
  drawOnEnter,
  gsap,
  revealOnEnter,
  ScrollTrigger,
  useGsapScope,
} from "@/lib/motion";
import { CONTOURS, PARCELS, PLAN_SIZE, ROAD } from "@/lib/openlandPlan";
import PageLink from "./PageLink";
import Swash from "./Swash";
import styles from "./Openland.module.css";
import FitImage from "@/components/FitImage";

/**
 * Openland / Greenfield — THE SURVEY SHEET.
 *
 * Every other section on the page starts from a building: a photograph of it,
 * a render of it, the people in it. This one starts before there is one, so
 * its identity is the drawing that comes first — a surveyor's sheet of open
 * ground. Contour lines, an access road, and a boundary for every parcel,
 * ruled on a fine grid with registration ticks at the corners. Nothing else
 * on the site is drawn as a plan, and nothing else here is a photograph first.
 *
 * THE PLAN AND THE SCHEDULE ARE ONE INSTRUMENT. The list beside the plan is
 * its key: each entry is numbered as its boundary is, and whichever entry the
 * visitor is reading — by scroll, by pointer or by keyboard — has its
 * boundary drawn in rose on the plan, filled, and its marker lit. From 64rem
 * the plan holds still beside the schedule while it is read.
 *
 * MOTION, in the house vocabulary and nothing new:
 *   · the contours are DRAWN, as a pen would, scrubbed to the scroll as the
 *     sheet comes up the window (drawOnEnter);
 *   · the survey line — one rose hairline — travels across the plan with the
 *     section's progress, the one thing on the sheet that moves continuously;
 *   · each boundary draws itself the first time its entry is reached;
 *   · the areas count up (countUp), the entries arrive on the house entrance.
 *
 * Under reduced motion none of the above is built: every contour and every
 * boundary is drawn, every figure is its final value, and the entries still
 * light their boundaries on hover and focus — that is state, not motion.
 */

export function Openland({ content }: { content: OpenlandContent }) {
  const root = useRef<HTMLElement | null>(null);
  const parcels = content.parcels.slice(0, PARCELS.length);
  const [active, setActive] = useState(0);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);

    revealOnEnter(q("[data-head]"), section, { stagger: 0.1, start: "top 76%" });

    // The contours, drawn in with the scroll as the sheet rises. Scrubbed,
    // so the drawing is always exactly as far along as the visitor is.
    drawOnEnter(`.${styles.contour}`, section, {
      scrub: 0.9,
      start: "top 85%",
      end: "top 15%",
    });
    drawOnEnter(`.${styles.road}`, section, {
      scrub: 0.9,
      start: "top 70%",
      end: "top 5%",
    });

    // Each boundary draws once, the first time its entry is reached.
    q(`.${styles.boundary}`).forEach((path, index) => {
      const row = q(`[data-row="${index}"]`)[0];
      if (!row) return;
      const el = path as unknown as SVGPathElement;
      const length = el.getTotalLength();
      gsap.fromTo(
        el,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: { trigger: row, start: "top 80%", once: true },
        },
      );
    });

    // The survey line, across the plan with the section's own progress.
    gsap.fromTo(
      q(`.${styles.scan}`),
      { left: "0%" },
      {
        left: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.6,
        },
      },
    );

    q("[data-reveal]:not([data-head])").forEach((el) => {
      revealOnEnter(el, el, { start: "top 88%" });
    });

    q(`.${styles.figure}`).forEach((el) => countUp(el as HTMLElement));

    // Reading position → the lit boundary: the last entry whose top has
    // crossed the reading line, a little above the middle of the window.
    // Worked out from the rows on every update rather than from a trigger per
    // row, so a jump (an anchor, a scrollbar drag) that skips straight over a
    // row's band still lands on the right one.
    const rows = q("[data-row]");
    const pick = () => {
      const line = window.innerHeight * 0.58;
      let index = 0;
      rows.forEach((row, i) => {
        if (row.getBoundingClientRect().top <= line) index = i;
      });
      setActive(index);
    };
    ScrollTrigger.create({
      trigger: q(`.${styles.schedule}`)[0] ?? section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: pick,
      onRefresh: pick,
    });
  }, [parcels.length]);

  return (
    <section
      ref={root}
      id="openland"
      className={`on-cream ${styles.section}`}
      aria-labelledby="openland-title"
    >
      <div className={`u-shell ${styles.shell}`}>
        <header className={styles.head}>
          <p className={styles.eyebrow} data-reveal="up" data-head="">
            <span className={styles.eyebrowMark} aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h2
            id="openland-title"
            className={styles.heading}
            data-reveal="up"
            data-head=""
          >
            <Swash heading={content.heading} />
          </h2>
          <p className={styles.standfirst} data-reveal="up" data-head="">
            {content.standfirst}
          </p>
        </header>

        <div className={styles.body}>
          {/* ---------------------------------------------------- the sheet */}
          <div className={styles.sheetCell}>
            <figure className={styles.sheet} aria-hidden="true">
              <span className={clsx(styles.tick, styles.tickTl)} />
              <span className={clsx(styles.tick, styles.tickTr)} />
              <span className={clsx(styles.tick, styles.tickBl)} />
              <span className={clsx(styles.tick, styles.tickBr)} />

              <div className={styles.plan}>
                <svg
                  className={styles.svg}
                  viewBox={`0 0 ${PLAN_SIZE} ${PLAN_SIZE}`}
                  preserveAspectRatio="xMidYMid slice"
                  focusable="false"
                >
                  <g className={styles.contours}>
                    {CONTOURS.map((d, i) => (
                      <path
                        key={i}
                        d={d}
                        className={clsx(
                          styles.contour,
                          i % 4 === 0 && styles.contourIndex,
                        )}
                      />
                    ))}
                  </g>

                  <path d={ROAD} className={styles.roadBed} />
                  <path d={ROAD} className={styles.road} />

                  {parcels.map((parcel, i) => {
                    const plot = PARCELS[i]!;
                    return (
                      <g
                        key={parcel.id}
                        className={styles.parcel}
                        data-active={i === active}
                      >
                        <path d={plot.d} className={styles.fill} />
                        <path d={plot.d} className={styles.boundary} />
                        <circle
                          cx={plot.label.x}
                          cy={plot.label.y}
                          r={20}
                          className={styles.marker}
                        />
                        <text
                          x={plot.label.x}
                          y={plot.label.y}
                          className={styles.markerText}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* The survey line: one rose hairline, carried across the
                    plan by the scroll. */}
                <span className={styles.scan} />
              </div>

              {/* The sheet's own furniture: north point and scale. */}
              <figcaption className={styles.legend}>
                <span className={styles.north}>
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M12 3 L17 20 L12 16 L7 20 Z" />
                  </svg>
                  N
                </span>
                <span className={styles.scale}>
                  <span className={styles.scaleBar} />
                  Not to scale
                </span>
              </figcaption>
            </figure>
          </div>

          {/* ------------------------------------------------- the schedule */}
          <div className={styles.scheduleCell}>
            <p className={styles.scheduleTitle} data-reveal="up">
              {content.scheduleTitle}
            </p>
            <ol className={styles.schedule}>
              {parcels.map((parcel, i) => (
                <li
                  key={parcel.id}
                  className={styles.entry}
                  data-row={i}
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <div className={styles.entryInner} data-reveal="up">
                    <div className={styles.entryHead}>
                      <span className={`u-numeral ${styles.index}`}>
                        P—{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.status}>{parcel.status}</span>
                    </div>

                    <div className={styles.entryMain}>
                      <div className={styles.entryText}>
                        <h3 className={styles.name}>{parcel.name}</h3>
                        <p className={styles.locality}>{parcel.locality}</p>

                        {parcel.area ? (
                          <p className={styles.area}>
                            <span className={`u-numeral ${styles.figure}`}>
                              {parcel.area.value}
                            </span>
                            <span className={styles.unit}>
                              {parcel.area.unit}
                            </span>
                          </p>
                        ) : parcel.phrase ? (
                          <p className={styles.phrase}>{parcel.phrase}</p>
                        ) : null}

                        <p className={styles.note}>{parcel.note}</p>

                        {parcel.cta ? (
                          <Link className={styles.cta} href={parcel.cta.href}>
                            {parcel.cta.label}
                            <svg
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                          </Link>
                        ) : null}
                      </div>

                      {parcel.image ? (
                        <div className={styles.thumb}>
                          <FitImage
                            src={parcel.image.src}
                            alt={parcel.image.alt}
                            width={parcel.image.width}
                            height={parcel.image.height}
                            sizes="(max-width: 47.99rem) 90vw, 9rem"
                            loading="lazy"
                            className={styles.thumbImage}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className={styles.invitation} data-reveal="up">
              <p className={styles.invitationText}>{content.invitation.text}</p>
              <PageLink
                href={content.invitation.cta.href}
                label={content.invitation.cta.label}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Openland;
