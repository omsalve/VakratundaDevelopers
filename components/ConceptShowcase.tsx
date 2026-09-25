"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import clsx from "clsx";
import type { ConceptShowcaseContent } from "@/lib/content";
import { gsap, prefersReducedMotion, useGsapScope } from "@/lib/motion";
import Swash from "./Swash";
import styles from "./ConceptShowcase.module.css";
import FitImage from "@/components/FitImage";

/**
 * Enclaves Living — the flagships, one in the centre and one either side.
 *
 * THREE PLATES ON ONE CENTRE LINE. The centred flagship is shown whole; the
 * other two stand either side of it, smaller and veiled, on the same
 * horizontal axis — so the row reads as one composition rather than three
 * pictures dropped at three heights.
 *
 * ANY FLAGSHIP CAN BE BROUGHT TO THE CENTRE: by its name in the row of
 * controls under the plates, by the arrows either side of that row, by
 * clicking a side plate, or by a swipe on a touch screen. The chosen plate
 * then TRAVELS to the centre and grows into it while the one that was there
 * steps aside to take its place; the third, which would otherwise have to
 * cross the centre in plain view, shrinks and dissolves behind it and re-forms
 * on the far side. That crossing is the one new movement here.
 *
 * WHERE EACH PLATE STANDS IS CSS, NOT JAVASCRIPT. A plate carries two
 * numbers — `--tx`, which side it is on (-1, 0, 1), and `--k`, how far it has
 * shrunk towards a side plate's size — and the stylesheet turns them into a
 * transform against the live plate width and gap. So the layout is correct on
 * the first paint, with no script, and at every window size; GSAP only tweens
 * those two numbers between the values `data-slot` already declares.
 *
 * It plays itself, slowly — one step every few seconds — until the visitor
 * takes a plate themselves, and it pauses while pointed at, focused, or off
 * screen. Under reduced motion it does not play and a choice is an instant
 * change of places.
 */

type Slot = "center" | "left" | "right" | "hidden";

/** Where plate `i` stands when plate `active` is in the centre. */
function slotOf(i: number, active: number, count: number): Slot {
  const d = (i - active + count) % count;
  if (d === 0) return "center";
  if (d === 1) return "right";
  if (d === count - 1) return "left";
  return "hidden";
}

/** The two numbers the stylesheet positions a plate from, and its opacity.
 *  Must agree with the `data-slot` rules in the stylesheet. */
const POSE: Record<Slot, { tx: number; k: number; opacity: number }> = {
  center: { tx: 0, k: 0, opacity: 1 },
  left: { tx: -1, k: 1, opacity: 1 },
  right: { tx: 1, k: 1, opacity: 1 },
  hidden: { tx: 0, k: 2.2, opacity: 0 },
};

/** Milliseconds between steps while it plays itself. */
const AUTOPLAY = 5200;

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={back ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
  </svg>
);

export function ConceptShowcase({
  content,
}: {
  content: ConceptShowcaseContent;
}) {
  const { heading, slides } = content;
  const count = slides.length;

  const root = useRef<HTMLDivElement | null>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  /** Once the visitor has chosen a plate, it stops playing itself. */
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  /** Bring plate `next` to the centre, animating every plate to its new
   *  place. `byHand` is false only for the autoplay's own steps. */
  const goTo = useCallback(
    (next: number, byHand = true) => {
      const target = ((next % count) + count) % count;
      const previous = activeRef.current;
      if (byHand) setTaken(true);
      if (target === previous) return;

      activeRef.current = target;
      setActive(target);

      if (prefersReducedMotion()) return;

      cards.current.forEach((card, i) => {
        if (!card) return;
        const from = slotOf(i, previous, count);
        const to = slotOf(i, target, count);
        if (from === to) return;
        const pose = POSE[to];
        gsap.killTweensOf(card);

        // The plate that would cross the centre in plain view: it goes
        // behind, shrinks and dissolves on the way, and re-forms on the far
        // side instead.
        const crossing =
          (from === "left" && to === "right") ||
          (from === "right" && to === "left");

        if (crossing) {
          card.dataset.crossing = "true";
          gsap.to(card, {
            keyframes: [
              {
                "--tx": 0,
                "--k": 2.2,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
              },
              {
                "--tx": pose.tx,
                "--k": pose.k,
                opacity: pose.opacity,
                duration: 0.55,
                ease: "power2.out",
              },
            ],
            onComplete: () => {
              delete card.dataset.crossing;
            },
          });
          return;
        }

        gsap.to(card, {
          "--tx": pose.tx,
          "--k": pose.k,
          opacity: pose.opacity,
          duration: 1.05,
          ease: "expo.inOut",
        });

        // The arriving plate's view settles out of a slightly closer crop,
        // so it reads as coming forward rather than only sliding across.
        if (to === "center") {
          const shot = card.querySelector(`.${styles.shot}`);
          if (shot) {
            gsap.fromTo(
              shot,
              { scale: 1.14 },
              { scale: 1, duration: 1.6, ease: "expo.out" },
            );
          }
        }
      });
    },
    [count],
  );

  /* ---- The entrance --------------------------------------------------------
     The centre plate rises and the side plates fan out from behind it the
     first time the row comes into view. Every tween ends on the values
     `data-slot` already declares, so a script that never runs leaves the row
     laid out. */
  useGsapScope(root, () => {
    const el = root.current;
    if (!el) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 72%", once: true },
    });
    cards.current.forEach((card, i) => {
      if (!card) return;
      const slot = slotOf(i, activeRef.current, count);
      if (slot === "hidden") return;
      const pose = POSE[slot];
      if (slot === "center") {
        tl.fromTo(
          card,
          // `--rise`, not `y`: a GSAP transform would sit inline on top of
          // the one the stylesheet builds from `--tx` and `--k`.
          { "--rise": "48px", opacity: 0 },
          { "--rise": "0px", opacity: 1, duration: 1.2, ease: "expo.out" },
          0,
        );
        return;
      }
      tl.fromTo(
        card,
        { "--tx": 0, "--k": 1.4, opacity: 0 },
        {
          "--tx": pose.tx,
          "--k": pose.k,
          opacity: pose.opacity,
          duration: 1.4,
          ease: "expo.out",
        },
        0.25,
      );
    });
  }, [count]);

  /* ---- Autoplay ----------------------------------------------------------- */
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (taken || paused || !inView || count < 2) return;
    if (prefersReducedMotion()) return;
    const timer = window.setTimeout(
      () => goTo(activeRef.current + 1, false),
      AUTOPLAY,
    );
    return () => window.clearTimeout(timer);
  }, [active, taken, paused, inView, count, goTo]);

  /* ---- Swipe -------------------------------------------------------------- */
  const swipeFrom = useRef<number | null>(null);

  return (
    <div
      ref={root}
      className={styles.showcase}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <h3 className={styles.heading}>
        <Swash heading={heading} />
      </h3>

      <div
        className={styles.stage}
        onPointerDown={(event) => {
          swipeFrom.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipeFrom.current === null) return;
          const dx = event.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) > 44) goTo(activeRef.current + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          swipeFrom.current = null;
        }}
      >
        {slides.map((slide, i) => {
          const slot = slotOf(i, active, count);
          return (
            <div
              key={`${i}-${slide.image.src}`}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className={styles.card}
              data-slot={slot}
              aria-hidden={slot !== "center"}
            >
              <div className={styles.plate}>
                <div className={styles.shot}>
                  <FitImage
                    src={slide.image.src}
                    alt={slide.image.alt}
                    width={slide.image.width}
                    height={slide.image.height}
                    sizes="(max-width: 47.99rem) 64vw, 26rem"
                    loading="lazy"
                    className={styles.image}
                    draggable={false}
                  />
                </div>
                <span className={styles.veil} />
                <span className={styles.chip}>
                  {slide.name}
                  <Arrow />
                </span>
              </div>

              {/* Pointer-only: the named buttons below are the keyboard and
                  screen-reader route to the same choice. */}
              {slot === "left" || slot === "right" ? (
                <button
                  type="button"
                  className={styles.cardButton}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => goTo(i)}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <p className={styles.captions} aria-live="polite">
        {slides.map((slide, i) => (
          <span
            key={`${i}-${slide.image.src}`}
            className={styles.caption}
            data-active={i === active}
            aria-hidden={i !== active}
          >
            {slide.caption}
          </span>
        ))}
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Previous flagship"
          onClick={() => goTo(active - 1)}
        >
          <Arrow back />
        </button>

        <div
          className={styles.names}
          role="group"
          aria-label="Bring a flagship to the centre"
          style={{ "--count": count } as CSSProperties}
        >
          {slides.map((slide, i) => (
            <button
              key={`${i}-${slide.image.src}`}
              type="button"
              className={clsx(styles.name, i === active && styles.isActive)}
              aria-pressed={i === active}
              onClick={() => goTo(i)}
            >
              {slide.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.arrow}
          aria-label="Next flagship"
          onClick={() => goTo(active + 1)}
        >
          <Arrow />
        </button>
      </div>
    </div>
  );
}

export default ConceptShowcase;
