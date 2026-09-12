"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { LegacyContent, LegacyProof } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import LegacyIcons from "./LegacyIcons";
import Swash from "./Swash";
import styles from "./Legacy.module.css";

/**
 * The band that extends the story section — the fifty years, drawn.
 *
 * The copy and the cluster share a two-column shell — the guide's own circles
 * from CP_Final p.3, five navy discs in a three-over-two honeycomb, wired
 * together, on the right. Under both, and outside the shell because it is
 * wider than it, the whole Skygarden roof render: uncropped and
 * unmasked, its own bottom-left corner set on the section's, so it is flush
 * with the page's left edge and meets the navy below with no cream between.
 *
 * THE LATTICE IS MEASURED, NOT DRAWN. The discs are grid items; the wires are
 * one SVG behind them whose paths are set from the discs' own live
 * `offsetLeft/offsetTop/offsetWidth` on mount, on every resize, and once the
 * display face has loaded. Layout offsets rather than `getBoundingClientRect`
 * on purpose — they ignore transforms, so the wires stay anchored to where
 * each disc BELONGS while the disc itself floats a few pixels off it. The
 * honeycomb re-forms as a two-one-two stack at phone widths and the wires
 * follow, with no second set of coordinates to keep in sync.
 *
 * WHAT MOVES, AND WHY IT IS IN THAT ORDER:
 *
 *   1. Assembly, once, on enter. The heavy wires draw between the discs and
 *      each disc lands as its wire reaches it — the cluster is surveyed, then
 *      built, rather than faded in. The hairline web closes last.
 *   2. Each disc, as it lands: its ring sweeps round, its icon draws itself
 *      (one tween for all five — every stroke carries `pathLength={1}`, so
 *      each outline is exactly one unit long whatever its real geometry), and
 *      its figure counts up.
 *   3. A charge runs the circuit for as long as the band is on screen. One
 *      looping scalar; the position is computed per frame from the CURRENT
 *      measurement, so a resize mid-lap needs no rebuild.
 *   4. Only once the cluster is built do the discs start breathing, each on
 *      its own slow offset drift. Started from the assembly's `onComplete`
 *      rather than on a delay, so the drift and the entrance can never both
 *      be holding the same disc's `y`. The render and the cluster counter-
 *      The cluster drifts on scroll; the render does not, because a picture
 *      pinned to a corner has to stay pinned to it. Every amplitude is small:
 *      a figure that slides while it is being read is unreadable.
 *
 * None of it is load-bearing. `useGsapScope` skips the whole setup under
 * prefers-reduced-motion, and the `.motion-on` rules that hold the discs back
 * never apply, so what is left is five navy discs — wired, because the
 * measurement runs either way — sitting still. With no JS at all the wires
 * are absent and the discs render as ordinary type on navy.
 */

/** Wires the guide draws heavy: between neighbours on a row. */
const BARS: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 4],
];

/** The web that binds the two rows. Hairline, and drawn last. */
const WEB: [number, number][] = [
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 4],
];

const EDGES: [number, number][] = [...BARS, ...WEB];

/** The circuit the charge runs — a closed loop over the wires above. */
const CIRCUIT = [0, 1, 2, 4, 3, 0];

/** Seconds for one lap. Slow enough to read as a current, not a chase. */
const LAP = 11;

/** How far a disc drifts from its measured home, in px. */
const DRIFT = 6;

type Point = { x: number; y: number; r: number };

type Leg = { from: Point; to: Point; at: number; span: number };

/** "2.1" -> 1, "2500" -> 0. What the count-up rounds to. */
function decimalsOf(value: string) {
  const dot = value.indexOf(".");
  return dot === -1 ? 0 : value.length - dot - 1;
}

/**
 * What a screen reader gets: one sentence per disc, rather than the three
 * fragments the circle splits it into. The visual face is `aria-hidden`, so
 * this is the only reading of it and nothing is announced twice.
 */
function readout(proof: LegacyProof) {
  const lead = proof.value
    ? `${proof.value}${proof.suffix ?? ""} ${proof.unit ?? ""}`.trim()
    : (proof.phrase ?? "");
  return `${lead} — ${proof.note}.`;
}

export function Legacy({ content }: { content: LegacyContent }) {
  const root = useRef<HTMLElement | null>(null);
  const cluster = useRef<HTMLDivElement | null>(null);
  const grid = useRef<HTMLUListElement | null>(null);
  const web = useRef<SVGSVGElement | null>(null);
  const charge = useRef<SVGGElement | null>(null);
  const discs = useRef<(HTMLLIElement | null)[]>([]);
  const wires = useRef<(SVGPathElement | null)[]>([]);

  /** Cumulative legs along CIRCUIT, so the charge travels at one speed. */
  const legs = useRef<Leg[]>([]);
  const lap = useRef(0);

  /* ---- Measurement ------------------------------------------------------ */

  useEffect(() => {
    const box = cluster.current;
    if (!box) return;

    const measure = () => {
      const list = grid.current;
      if (!list) return;
      // The grid is the discs' offsetParent; the SVG is laid over the
      // cluster. One hop between the two, added once here, is all it takes
      // to put both in the same coordinate system.
      const ox = list.offsetLeft;
      const oy = list.offsetTop;

      const points: Point[] = discs.current.map((el) =>
        el
          ? {
              x: ox + el.offsetLeft + el.offsetWidth / 2,
              y: oy + el.offsetTop + el.offsetHeight / 2,
              r: el.offsetWidth / 2,
            }
          : { x: 0, y: 0, r: 0 },
      );

      const svg = web.current;
      if (svg) {
        svg.setAttribute("width", String(box.offsetWidth));
        svg.setAttribute("height", String(box.offsetHeight));
      }

      // Each wire runs edge to edge, not centre to centre, and bites a
      // couple of pixels under the discs at either end so no join shows.
      EDGES.forEach(([a, b], i) => {
        const path = wires.current[i];
        const p = points[a];
        const q = points[b];
        if (!path || !p || !q) return;
        const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
        const ux = (q.x - p.x) / len;
        const uy = (q.y - p.y) / len;
        const bite = 2;
        const x0 = (p.x + ux * (p.r - bite)).toFixed(2);
        const y0 = (p.y + uy * (p.r - bite)).toFixed(2);
        const x1 = (q.x - ux * (q.r - bite)).toFixed(2);
        const y1 = (q.y - uy * (q.r - bite)).toFixed(2);
        path.setAttribute("d", `M ${x0} ${y0} L ${x1} ${y1}`);
      });

      // The circuit as legs with a running start distance: the charge then
      // reads one 0 -> 1 scalar and holds one speed across every leg.
      let run = 0;
      const built: Leg[] = [];
      for (let i = 0; i < CIRCUIT.length - 1; i += 1) {
        const from = points[CIRCUIT[i]];
        const to = points[CIRCUIT[i + 1]];
        if (!from || !to) continue;
        const span = Math.hypot(to.x - from.x, to.y - from.y);
        built.push({ from, to, at: run, span });
        run += span;
      }
      legs.current = built;
      lap.current = run;
    };

    measure();

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(box);

    // A disc is sized by its type as much as by the grid, and the display
    // face arrives after first paint.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) measure();
    });

    return () => {
      alive = false;
      observer?.disconnect();
    };
  }, []);

  /* ---- Motion ----------------------------------------------------------- */

  useGsapScope(root, () => {
    const section = root.current;
    const box = cluster.current;
    if (!section || !box) return;

    const discEls = discs.current.filter((el): el is HTMLLIElement => !!el);
    const wireEls = wires.current.filter((el): el is SVGPathElement => !!el);
    const bars = wireEls.slice(0, BARS.length);
    const strands = wireEls.slice(BARS.length);

    revealOnEnter(`.${styles.intro} > *`, section, { stagger: 0.1 });

    gsap.to(`.${styles.plateInner}`, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.6,
      ease: "expo.out",
      scrollTrigger: { trigger: section, start: "top 80%", once: true },
    });

    /* -- 1 & 2. The assembly ---------------------------------------------- */

    const tl = gsap.timeline({
      scrollTrigger: { trigger: box, start: "top 82%", once: true },
    });

    // The heavy wires first, each arriving just before the disc it feeds.
    if (bars.length > 0) {
      tl.to(
        bars,
        {
          strokeDashoffset: 0,
          duration: 0.85,
          ease: "power2.inOut",
          stagger: 0.16,
        },
        0,
      );
    }

    discEls.forEach((disc, i) => {
      const at = 0.12 + i * 0.13;

      tl.to(
        disc,
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "expo.out" },
        at,
      )
        .to(
          disc.querySelectorAll(`.${styles.ring} circle`),
          { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
          at + 0.08,
        )
        .to(
          disc.querySelectorAll(`.${styles.icon} path, .${styles.icon} circle`),
          {
            strokeDashoffset: 0,
            duration: 0.75,
            ease: "power1.inOut",
            stagger: 0.045,
          },
          at + 0.2,
        );

      // The figure. Zeroed in onStart rather than up front: until the trigger
      // fires, the disc still carries its server-rendered value — which is
      // what a visitor who never reaches this band should be left with.
      const target = content.proofs[i]?.value;
      const numeral = disc.querySelector<HTMLElement>(`.${styles.numeral}`);
      if (!target || !numeral) return;

      const places = decimalsOf(target);
      const count = { n: 0 };
      tl.to(
        count,
        {
          n: Number(target),
          duration: 1.5,
          ease: "power2.out",
          onStart: () => {
            numeral.textContent = (0).toFixed(places);
          },
          onUpdate: () => {
            numeral.textContent = count.n.toFixed(places);
          },
          onComplete: () => {
            numeral.textContent = target;
          },
        },
        at + 0.15,
      );
    });

    // The web closes over the built cluster.
    if (strands.length > 0) {
      tl.to(
        strands,
        {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power1.inOut",
          stagger: 0.1,
        },
        0.75,
      );
    }

    /* -- 3. The charge ----------------------------------------------------- */

    const dot = charge.current;
    if (dot) {
      const paint = (t: number) => {
        const built = legs.current;
        const total = lap.current;
        if (built.length === 0 || total <= 0) return;
        const along = t * total;
        const leg =
          built.find((l) => along < l.at + l.span) ?? built[built.length - 1];
        const k = leg.span > 0 ? (along - leg.at) / leg.span : 0;
        const x = leg.from.x + (leg.to.x - leg.from.x) * k;
        const y = leg.from.y + (leg.to.y - leg.from.y) * k;
        dot.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
        );
        // Brightest mid-leg, so it reads as travelling rather than as a dot
        // that happens to be somewhere.
        dot.setAttribute(
          "opacity",
          (0.28 + 0.72 * Math.sin(k * Math.PI)).toFixed(3),
        );
      };

      const runner = { t: 0 };
      gsap.to(runner, {
        t: 1,
        duration: LAP,
        ease: "none",
        repeat: -1,
        onUpdate: () => paint(runner.t),
        // Nothing loops off screen.
        scrollTrigger: {
          trigger: box,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause",
        },
      });
    }

    /* -- 4. The drift ------------------------------------------------------ */

    // Built paused and released by the assembly, so the entrance owns each
    // disc's `y` until it has finished with it.
    const breathing = discEls.map((disc, i) =>
      gsap.to(disc, {
        y: i % 2 === 0 ? -DRIFT : DRIFT,
        x: i % 3 === 0 ? DRIFT * 0.4 : -DRIFT * 0.4,
        duration: 5.5 + i * 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        paused: true,
      }),
    );
    tl.eventCallback("onComplete", () => {
      breathing.forEach((tween) => tween.play());
    });

    /* Now that the assembly is built and its completion is wired, measure it.
       `timelineOnEnter` does this for the shorter timelines on the site; this
       one is assembled over too many lines to hand to a callback, but it needs
       the same thing — a timeline-attached trigger left unmeasured is one the
       next trigger created in this pass will force-refresh mid-loop. */
    tl.scrollTrigger?.refresh();

    // The cluster alone drifts down the scroll, against a render that is
    // pinned — which is what keeps the two reading as two planes.
    gsap.fromTo(
      box,
      { y: -26 },
      {
        y: 30,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.9,
        },
      },
    );
  }, []);

  /* ---- Markup ----------------------------------------------------------- */

  return (
    <section ref={root} className={styles.band} aria-labelledby="legacy-title">
      <div className={`u-shell ${styles.shell}`}>
        <div className={styles.intro}>
          <p className="u-label">{content.kicker}</p>
          <h3 id="legacy-title" className={`u-h2 ${styles.heading}`}>
            <Swash heading={content.heading} />
          </h3>
          <p className={styles.body}>{content.body}</p>
        </div>

        <div className={styles.lattice}>
          <div ref={cluster} className={styles.cluster}>
            {/* The slow rings behind everything: the circle the section's own
                dome is cut from, held at the edge of legibility. */}
            <span className={styles.halo} aria-hidden="true" />

            {/* No `d` on anything until the discs have been measured — an
                unmeasured wire is no wire, rather than a wrong one. */}
            <svg
              ref={web}
              className={styles.wires}
              aria-hidden="true"
              focusable="false"
            >
              {EDGES.map(([a, b], i) => (
                <path
                  key={`${a}-${b}`}
                  ref={(el) => {
                    wires.current[i] = el;
                  }}
                  pathLength={1}
                  className={i < BARS.length ? styles.bar : styles.strand}
                />
              ))}
              <g ref={charge} className={styles.charge} opacity={0}>
                <circle r={9} className={styles.chargeHalo} />
                <circle r={2.4} className={styles.chargeCore} />
              </g>
            </svg>

            <ul ref={grid} className={styles.discs}>
              {content.proofs.map((proof, i) => (
                <li
                  key={proof.id}
                  ref={(el) => {
                    discs.current[i] = el;
                  }}
                  className={styles.disc}
                >
                  <p className="u-visually-hidden">{readout(proof)}</p>

                  <div className={styles.face} aria-hidden="true">
                    <span className={styles.icon}>
                      <LegacyIcons name={proof.icon} />
                    </span>

                    {proof.value ? (
                      <p className={styles.figure}>
                        <span className={styles.count}>
                          <span className={`u-numeral ${styles.numeral}`}>
                            {proof.value}
                          </span>
                          {proof.suffix && (
                            <span className={styles.suffix}>
                              {proof.suffix}
                            </span>
                          )}
                        </span>
                        {proof.unit && (
                          <span className={styles.unit}>{proof.unit}</span>
                        )}
                      </p>
                    ) : (
                      <p className={styles.phrase}>{proof.phrase}</p>
                    )}

                    <p className={styles.note}>{proof.note}</p>
                  </div>

                  {/* Two rings: the hairline that sweeps round as the disc
                      lands, and the dashed one that only turns on hover. */}
                  <svg
                    className={styles.ring}
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle pathLength={1} cx="50" cy="50" r="48.4" />
                  </svg>
                  <svg
                    className={styles.ticks}
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="50" cy="50" r="45.6" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Outside the shell: two and a half times wider than it, with its own
          bottom-left corner on the section's. */}
      <figure className={styles.plate}>
        <div className={styles.plateInner}>
          <Image
            src={content.image.src}
            alt={content.image.alt}
            width={content.image.width}
            height={content.image.height}
            sizes="107vw"
            quality={82}
            loading="lazy"
            className={styles.render}
          />
        </div>
      </figure>
    </section>
  );
}

export default Legacy;
