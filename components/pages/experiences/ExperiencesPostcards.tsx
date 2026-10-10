"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { CardItem } from "@/lib/pages";
import type { ImageAsset, SwashHeading } from "@/lib/content";
import {
  gsap,
  prefersReducedMotion,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import FitImage from "@/components/FitImage";
import { LogoMark } from "@/components/Logo";
import Swash from "@/components/Swash";
import styles from "./ExperiencesPostcards.module.css";

/**
 * /experiences — the moments, as a pile of postcards.
 *
 * Each moment is a card. Its FRONT is the photograph with the moment's one-word
 * name lettered across it — the page's signature, type over a photograph, at
 * the scale a postcard letters its view. Its BACK is the copy: the message,
 * the line that says what the picture shows, and the postage — the group's
 * mark as the stamp and a postmark that says where it was posted from and
 * since when. Front and back sit side by side, the way a collector shows a
 * card, so nothing has to be turned over to be read.
 *
 * THE PILE IS DEALT BY HAND, NEVER BY THE SCROLL. Tapping the top card, the
 * arrows, a name in the index or the arrow keys deals the next card: the top
 * one slides off to the left and is tucked under the pile, and the next one
 * comes up. Going back, or jumping to a name, draws that card out from behind
 * the pile and lays it on top. The page never holds the visitor in place and
 * scrolls straight past the pile at its own length.
 *
 * NOTHING FADES. A card moves; the writing on the back is wiped on from its
 * left edge; the postmark is struck. The site's rule is that a thing arrives
 * by an edge travelling across it, not by opacity.
 *
 * FIGURES ARE PAIRED BY POSITION AND NEITHER SIDE IS ASSUMED. A moment with no
 * photograph is a lettercard — the name set on the cream stock — rather than
 * a card borrowing somebody else's picture.
 */

/** How long the top card takes to leave the pile before it is tucked under. */
const LEAVE_MS = 420;
/** How long a card takes to come out from behind the pile before it lands. */
const ARRIVE_MS = 380;
/** Cards deeper than this sit exactly behind the last one that shows. */
const VISIBLE_DEPTH = 3;
/** Each card's own lean, by its place in the set: a handled pile, not a fan. */
const LEANS = [-1.6, 2.1, -2.6, 1.3, -0.9, 2.4, -1.9, 1.7];
/** Each postmark is struck at its own angle, as a real one would be. */
const POSTMARK_TURNS = [-14, 9, -6, 15, -11, 5, -17, 12];

type Motion = { card: number; phase: "leaving" | "arriving" } | null;

export function ExperiencesPostcards({
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
  const timer = useRef<number | undefined>(undefined);
  const [active, setActive] = useState(0);
  const [motion, setMotion] = useState<Motion>(null);
  const [dealt, setDealt] = useState(false);
  const uid = useId().replace(/[^\w-]/g, "");
  const count = items.length;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The card that is on top, or about to be: a card still on its way out from
  // behind the pile already counts, so a second tap deals from where it lands.
  const current = motion?.phase === "arriving" ? motion.card : active;

  function deal(target: number) {
    if (count < 2) return;
    window.clearTimeout(timer.current);
    const next = ((target % count) + count) % count;
    setDealt(true);

    if (next === current || prefersReducedMotion()) {
      setActive(next);
      setMotion(null);
      return;
    }

    if (next === (current + 1) % count) {
      // The top card slides off; the pile moves up under it at once.
      setActive(next);
      setMotion({ card: current, phase: "leaving" });
      timer.current = window.setTimeout(() => setMotion(null), LEAVE_MS);
    } else {
      // The chosen card is drawn out from behind, then laid on top.
      setActive(current);
      setMotion({ card: next, phase: "arriving" });
      timer.current = window.setTimeout(() => {
        setActive(next);
        setMotion(null);
      }, ARRIVE_MS);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      deal(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      deal(current - 1);
    }
  }

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;
    const pile = rootEl.querySelector(`.${styles.pile}`);
    const back = rootEl.querySelector(`.${styles.back}`);

    revealOnEnter(`.${styles.head} > [data-reveal]`, rootEl, { stagger: 0.09 });

    // Dealt onto the table: the deepest card first, the top card last.
    if (pile) {
      const cards = Array.from(
        rootEl.querySelectorAll<HTMLElement>(`.${styles.stock}`),
      ).reverse();
      gsap.from(cards, {
        xPercent: 16,
        yPercent: 30,
        rotate: 8,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.07,
        clearProps: "transform",
        scrollTrigger: { trigger: pile, start: "top 85%", once: true },
      });
      revealOnEnter(rootEl.querySelectorAll(`.${styles.deck} > [data-reveal]`), pile, {
        start: "top 85%",
        delay: 0.35,
        stagger: 0.08,
      });
    }

    // The back is uncovered from its left edge, then handed its shadow back:
    // a clip left in place would cut the shadow off the card for good.
    if (back) {
      gsap.fromTo(
        back,
        { clipPath: "inset(0% 100% 0% 0%)", webkitClipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          webkitClipPath: "inset(0% 0% 0% 0%)",
          duration: 1.25,
          delay: 0.2,
          ease: "expo.out",
          clearProps: "clipPath,webkitClipPath",
          scrollTrigger: { trigger: back, start: "top 88%", once: true },
        },
      );
    }
  }, [count]);

  if (count === 0) return null;

  const upNext = items[(current + 1) % count];

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="postcards-title"
      data-dealt={dealt ? "true" : undefined}
    >
      <div className={`u-shell ${styles.head}`}>
        <p className={`u-label ${styles.label}`} data-reveal="up">
          {label}
        </p>
        <h2 id="postcards-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
          <Swash heading={heading} />
        </h2>
        <p className={styles.standfirst} data-reveal="up">
          {standfirst}
        </p>
      </div>

      <div
        className={`u-shell ${styles.table}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Postcards"
        onKeyDown={onKeyDown}
      >
        <div className={styles.deck}>
          <div className={styles.pile}>
            {items.map((item, index) => {
              const depth = (index - active + count) % count;
              const isTop = depth === 0 && motion?.card !== index;
              const figure = figures[index];
              const style = {
                "--depth": Math.min(depth, VISIBLE_DEPTH),
                "--lean": LEANS[index % LEANS.length],
              } as CSSProperties;

              return (
                <figure
                  key={item.id}
                  className={styles.card}
                  style={style}
                  data-depth={Math.min(depth, VISIBLE_DEPTH)}
                  data-motion={motion?.card === index ? motion.phase : undefined}
                  aria-hidden={isTop ? undefined : true}
                  inert={!isTop}
                >
                  <div className={styles.stock}>
                    {figure ? (
                      <div className={styles.photo}>
                        <FitImage
                          src={figure.src}
                          alt={figure.alt}
                          width={figure.width}
                          height={figure.height}
                          sizes="(max-width: 64rem) 92vw, 54vw"
                          tolerance={0.78}
                          className={styles.image}
                          loading={depth <= 1 ? "eager" : "lazy"}
                        />
                        <span className={styles.scrim} aria-hidden="true" />
                      </div>
                    ) : (
                      <div className={styles.lettercard} aria-hidden="true" />
                    )}

                    {item.eyebrow ? (
                      <span
                        className={styles.name}
                        data-on={figure ? "photo" : "stock"}
                        aria-hidden="true"
                      >
                        {item.eyebrow}
                      </span>
                    ) : null}
                  </div>

                  {count > 1 && isTop ? (
                    <button
                      type="button"
                      className={styles.hit}
                      onClick={() => deal(index + 1)}
                      aria-label={`Next postcard: ${upNext?.eyebrow ?? upNext?.title ?? ""}`}
                    />
                  ) : null}
                </figure>
              );
            })}
          </div>

          {count > 1 ? (
            <>
              <div className={styles.controls} data-reveal="up">
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => deal(current - 1)}
                  aria-label="Previous postcard"
                >
                  <Arrow direction="left" />
                </button>

                <ol className={styles.index} aria-label="Postcards by name">
                  {items.map((item, index) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={styles.indexButton}
                        aria-current={index === current ? "true" : undefined}
                        onClick={() => deal(index)}
                      >
                        {item.eyebrow ?? item.title}
                      </button>
                    </li>
                  ))}
                </ol>

                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => deal(current + 1)}
                  aria-label="Next postcard"
                >
                  <Arrow direction="right" />
                </button>
              </div>

              <p className={styles.hint} data-reveal="up">
                <span className={styles.hintTouch}>Tap</span>
                <span className={styles.hintPointer}>Click</span> the card to
                deal the next one.
              </p>
            </>
          ) : null}
        </div>

        {/* The back. The card stock stays put; only the writing on it
            changes, wiped on from the left as each card comes up. */}
        <div className={`on-cream ${styles.back}`}>
          {items.map((item, index) => {
            const figure = figures[index];
            return (
              <article
                key={item.id}
                className={styles.verso}
                hidden={index !== active}
                aria-labelledby={`${uid}-title-${index}`}
              >
                <div className={styles.postage} aria-hidden="true">
                  <Postmark
                    id={`${uid}-ring-${index}`}
                    turn={POSTMARK_TURNS[index % POSTMARK_TURNS.length]}
                  />
                  <Stamp />
                </div>

                {/* No name over the title: the front letters it at display
                    size and the index under the pile marks it, and a third
                    copy on the back would only be read twice. */}
                <h3 id={`${uid}-title-${index}`} className={`u-h3 ${styles.title}`}>
                  {item.title}
                </h3>
                <p className={styles.body}>{item.body}</p>

                <div className={styles.foot}>
                  {figure?.caption ? (
                    <p className={styles.printLine}>{figure.caption}</p>
                  ) : null}
                  <ul className={styles.address} aria-hidden="true">
                    <li>Home,</li>
                    <li>where dreams find an address</li>
                    <li>Mumbai · MMR</li>
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <p className="u-visually-hidden" aria-live="polite">
          {`Postcard ${active + 1} of ${count}: ${items[active]?.eyebrow ?? items[active]?.title ?? ""}`}
        </p>
      </div>
    </section>
  );
}

/** The group's mark, printed on a perforated stamp. */
function Stamp() {
  return (
    <span className={styles.stampWrap}>
      <span className={styles.stamp}>
        <span className={styles.stampField}>
          <LogoMark className={styles.stampMark} />
        </span>
      </span>
    </span>
  );
}

/**
 * Where it was posted from and since when — the two things on the site that
 * are true of every card. Struck at its own angle; no date, because the client
 * asked for the moments to carry no times or days.
 */
function Postmark({ id, turn }: { id: string; turn: number }) {
  return (
    <svg
      className={styles.postmark}
      viewBox="0 0 150 84"
      style={{ "--turn": `${turn}deg` } as CSSProperties}
      focusable="false"
    >
      <defs>
        <path id={id} d="M 42 42 m -29 0 a 29 29 0 1 1 58 0 a 29 29 0 1 1 -58 0" />
      </defs>
      <circle cx="42" cy="42" r="37" />
      <circle cx="42" cy="42" r="22" />
      <text className={styles.postmarkRing}>
        <textPath href={`#${id}`} textLength="178" lengthAdjust="spacing">
          VAKRATUNDA · SINCE 1973 ·
        </textPath>
      </text>
      <text x="42" y="45" textAnchor="middle" className={styles.postmarkTown}>
        MUMBAI
      </text>
      {[22, 32, 42, 52, 62].map((y) => (
        <path
          key={y}
          className={styles.wave}
          d={`M 84 ${y} q 8 -4.5 16 0 t 16 0 t 16 0 t 16 0`}
        />
      ))}
    </svg>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
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
    >
      {direction === "left" ? (
        <path d="M19 12H5M11 6l-6 6 6 6" />
      ) : (
        <path d="M5 12h14M13 6l6 6-6 6" />
      )}
    </svg>
  );
}

export default ExperiencesPostcards;
