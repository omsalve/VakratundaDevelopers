"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import type {
  AtmosphereContent,
  AtmospherePlate,
  SwashHeading,
} from "@/lib/content";
import { gsap, useGsapScope } from "@/lib/motion";
import PageLink from "./PageLink";
import styles from "./Atmosphere.module.css";

/**
 * The spread — interior and exterior, as one evening in five frames.
 *
 * ============================================================================
 * SET AT THE PAGE'S OWN SCALE
 * ============================================================================
 *
 * Every other section on the home page runs a headline at about 60px and
 * photographs between 300 and 700px wide. The spread keeps to that: it is a
 * cluster of medium frames inside the shell, not a sequence of full-width
 * plates, and on a desk it is under two screens tall.
 *
 * EVERY PHOTOGRAPH IS SEEN WHOLE. Each frame takes the aspect ratio of the
 * file it holds (`image.width / image.height`), and nothing overlaps.
 *
 * ============================================================================
 * THE ASYMMETRY
 * ============================================================================
 *
 * Three columns, three widths — five, three and four of twelve — and three
 * different tops, so the cluster starts ragged and ends ragged:
 *
 *   · LEFT, the widest: the two wide exteriors, the deck over the garden.
 *   · MIDDLE, the narrowest, set lowest: the tall terrace on its own.
 *   · RIGHT: the two interiors, the glass over the lounge.
 *
 * Outside on the left, inside on the right, and the threshold standing
 * between them — the section's subject laid out as a floor plan.
 *
 * The head and the close mirror one another around it: headline left and the
 * lead low on the right above; the details left and the coda right below.
 *
 * Under 64rem it is one column in reading order (deck, glass, terrace,
 * lounge, garden), with the frames at different widths so it still sways.
 *
 * ============================================================================
 * MOTION — the cluster opens from the middle
 * ============================================================================
 *
 * The frames are uncovered by their clip retreating AWAY from the middle
 * column: the left column opens leftward, the right column rightward, and the
 * terrace rises. The photograph inside each settles out of a close crop, its
 * rose rule draws and its caption rises. The headline's words rise out of
 * their own line boxes. On scroll the middle and right columns drift at two
 * small rates, so the stagger between the three shifts as the section passes.
 *
 * No two tweens ever write the same transform: the plate owns the clip,
 * `.zoom` the entrance scale, `.lift` the hover scale (CSS), the image its
 * drift, and the column wrapper the column's drift.
 *
 * Under reduced motion `useGsapScope` skips the setup, `.motion-on` is never
 * set, and every frame is simply open.
 */

type Opening = "leftward" | "rightward" | "rise";

const CLOSED: Record<Opening, string> = {
  /* Pinned to the right edge, growing left. */
  leftward: "inset(0% 0% 0% 100%)",
  /* Pinned to the left edge, growing right. */
  rightward: "inset(0% 100% 0% 0%)",
  rise: "inset(100% 0% 0% 0%)",
};

export function Atmosphere({ content }: { content: AtmosphereContent }) {
  const root = useRef<HTMLElement | null>(null);
  const { plates } = content;

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;
    const q = gsap.utils.selector(section);

    /* ---- The headline: each word out of its own line box --------------- */
    gsap.fromTo(
      q(`.${styles.word}`),
      /* `y: 0` on both ends: GSAP reads the stylesheet's closed transform
         into `y`, and it has to be cleared for yPercent alone to decide. */
      { yPercent: 110, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.04,
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      },
    );

    /* ---- Copy: the house rise, each block off its own edge -------------- */
    q("[data-reveal]").forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    /* ---- The frames: opening away from the middle ----------------------- */
    q(`.${styles.figure}`).forEach((figure) => {
      const plate = figure.querySelector<HTMLElement>(`.${styles.plate}`);
      const zoom = figure.querySelector(`.${styles.zoom}`);
      const rule = figure.querySelector(`.${styles.rule}`);
      const caption = figure.querySelectorAll(`.${styles.captionLine}`);
      if (!plate) return;

      const opening = (plate.dataset.opening ?? "rise") as Opening;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: figure, start: "top 88%", once: true },
        onComplete: () => {
          /* Hand the corners back to the stylesheet's border-radius. */
          plate.dataset.open = "";
          gsap.set(plate, { clearProps: "clipPath,webkitClipPath" });
        },
      });

      tl.fromTo(
        plate,
        { clipPath: CLOSED[opening], webkitClipPath: CLOSED[opening] },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          webkitClipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
        },
        0,
      );

      if (zoom) {
        tl.fromTo(
          zoom,
          { scale: 1.22 },
          { scale: 1, duration: 1.9, ease: "expo.out" },
          0,
        );
      }

      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0.3,
        );
      }

      if (caption.length) {
        tl.fromTo(
          caption,
          { yPercent: 105, y: 0 },
          { yPercent: 0, y: 0, duration: 1, ease: "expo.out", stagger: 0.07 },
          0.4,
        );
      }
    });

    /* ---- Scroll: the view drifts inside every frame --------------------- */
    q(`.${styles.image}`).forEach((image) => {
      const frame = image.closest(`.${styles.plate}`);
      if (!frame) return;
      gsap.fromTo(
        image,
        { yPercent: -4, scale: 1.1 },
        {
          yPercent: 4,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    /* ---- The columns drift at two small rates (the composition only) ---- */
    const cluster = q(`.${styles.cluster}`)[0];
    if (cluster && window.matchMedia("(min-width: 64rem)").matches) {
      (
        [
          [`.${styles.colMiddle}`, 48],
          [`.${styles.colRight}`, 22],
        ] as const
      ).forEach(([selector, travel]) => {
        gsap.fromTo(
          q(selector),
          { y: travel },
          {
            y: -travel,
            ease: "none",
            scrollTrigger: {
              trigger: cluster,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }
  }, []);

  return (
    <section
      ref={root}
      id="atmosphere"
      className={`on-cream ${styles.section}`}
      aria-labelledby="atmosphere-title"
    >
      <div className={`u-shell ${styles.shell}`}>
        <header className={styles.head}>
          <h2
            id="atmosphere-title"
            className={styles.headline}
            aria-label={headingText(content.heading)}
          >
            <MaskedWords heading={content.heading} />
          </h2>
          <p className={styles.lead} data-reveal="up">
            {content.lead}
          </p>
        </header>

        <div className={styles.cluster}>
          <div className={styles.colLeft}>
            <Plate
              plate={plates.deck}
              className={styles.deck}
              opening="leftward"
              sizes="(max-width: 64rem) 92vw, 40vw"
            />
            <Plate
              plate={plates.garden}
              className={styles.garden}
              opening="leftward"
              sizes="(max-width: 64rem) 92vw, 40vw"
            />
          </div>

          <div className={styles.colMiddle}>
            <Plate
              plate={plates.terrace}
              className={styles.terrace}
              opening="rise"
              sizes="(max-width: 64rem) 64vw, 24vw"
            />
          </div>

          <div className={styles.colRight}>
            <Plate
              plate={plates.glass}
              className={styles.glass}
              opening="rightward"
              sizes="(max-width: 64rem) 92vw, 32vw"
            />
            <Plate
              plate={plates.lounge}
              className={styles.lounge}
              opening="rightward"
              sizes="(max-width: 64rem) 80vw, 32vw"
            />
          </div>
        </div>

        <div className={styles.close}>
          <div className={styles.details}>
            <p className={styles.detailsTitle} data-reveal="up">
              {content.detailsTitle}
            </p>
            <ul className={styles.detailList}>
              {content.details.map((detail) => (
                <li key={detail} className={styles.detail} data-reveal="up">
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.codaCell}>
            <p className={styles.coda} data-reveal="up">
              {content.coda}
            </p>
            <div className={styles.onward} data-reveal="up">
              <PageLink
                size="sm"
                href="/experiences"
                label="A day in one of our homes"
              />
              <PageLink
                size="sm"
                href="/hospitality"
                label="The spaces beyond our homes"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One frame, at the aspect ratio of the photograph it holds, with its caption
 * under it: the side of the threshold it stands on, and the note if it has
 * one. Each caption line sits in a clipped box of its own so the entrance can
 * raise it out of that box.
 */
function Plate({
  plate,
  className,
  opening,
  sizes,
}: {
  plate: AtmospherePlate;
  className: string;
  opening: Opening;
  sizes: string;
}) {
  const { width, height } = plate.image;
  /* Clamped so a mis-sized upload cannot stretch a frame into a sliver. */
  const ratio =
    width && height ? Math.min(Math.max(width / height, 0.5), 2.4) : 16 / 9;

  return (
    <figure className={`${styles.figure} ${className}`}>
      <div
        className={styles.plate}
        data-opening={opening}
        style={{ "--ratio": ratio } as CSSProperties}
      >
        <div className={styles.zoom}>
          <div className={styles.lift}>
            <Image
              src={plate.image.src}
              alt={plate.image.alt}
              fill
              sizes={sizes}
              quality={85}
              className={styles.image}
            />
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.captionMask}>
          <span className={`${styles.captionLine} ${styles.side}`}>
            {plate.side}
          </span>
        </span>
        {plate.note ? (
          <span className={styles.captionMask}>
            <span className={`${styles.captionLine} ${styles.note}`}>
              {plate.note}
            </span>
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/**
 * The headline, one clipped box per word, so each word can rise out of its
 * own line. The swash words keep their italic; the spaces stay real text so
 * the line still wraps and balances as prose. The h2 carries the sentence
 * whole as its label, and this markup is hidden from assistive tech.
 */
function MaskedWords({ heading }: { heading: SwashHeading }) {
  const parts: { text: string; swash: boolean }[] = [
    { text: heading.before ?? "", swash: false },
    { text: heading.swash ?? "", swash: true },
    { text: heading.after ?? "", swash: false },
  ];

  const words: { text: string; swash: boolean; space: boolean }[] = [];
  parts.forEach(({ text, swash }) => {
    text.split(/(\s+)/).forEach((token) => {
      if (token) words.push({ text: token, swash, space: /^\s+$/.test(token) });
    });
  });

  /* Group runs of non-space tokens into one unbreakable unit, so punctuation
     glued to the previous part ("feel" + ".") rides on the same word and can
     never wrap onto a line by itself. */
  const units: { text: string; swash: boolean }[][] = [];
  let current: { text: string; swash: boolean }[] = [];
  words.forEach((word) => {
    if (word.space) {
      if (current.length) units.push(current);
      current = [];
    } else {
      current.push({ text: word.text, swash: word.swash });
    }
  });
  if (current.length) units.push(current);

  return (
    <span aria-hidden="true">
      {units.map((unit, index) => (
        <span key={index}>
          <span className={styles.wordMask}>
            <span className={styles.word}>
              {unit.map((piece, i) =>
                piece.swash ? (
                  <em key={i} className="u-swash">
                    {piece.text}
                  </em>
                ) : (
                  <span key={i}>{piece.text}</span>
                ),
              )}
            </span>
          </span>
          {index < units.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function headingText(heading: SwashHeading) {
  return `${heading.before ?? ""}${heading.swash ?? ""}${heading.after ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}

export default Atmosphere;
