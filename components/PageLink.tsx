"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./PageLink.module.css";

/**
 * The way out of a section and into the page that goes deeper.
 *
 * THE PAGE HAD NO GRAMMAR FOR THIS. It has one for a heading over a band —
 * the rubric: a rose label with a hairline ruled open beside it — and one for
 * the single action worth taking — the ghost pill. It had nothing for "there
 * is a whole page behind this paragraph", and the fourteen standing routes
 * were reachable only from the masthead's four. So this is that third mark.
 *
 * IT WAS A MARGIN ENTRY AND IT READ AS A HEADING. The first pass set it as
 * one line of display face with a short rose stub ruled beside it, on the
 * argument that the photographs are the only filled shapes on this site.
 * That argument is still true of the page; it was not true of this mark. A
 * line of display face inside a section of display faces has no affordance —
 * people read the sentence and went on scrolling. So the mark is now drawn
 * as what it is, and the site's refusal of plates is kept by the one shape
 * that encloses without being a card: a RING.
 *
 * THREE MARKS, ONE ROW. The label; a ruled track under the full width of it,
 * which is the row's floor and says where the control ends; and a rose ring
 * holding the arrow, which is the thing the eye reads as pressable. Two of
 * the three the page already draws — the ruled hairline is every rubric on
 * the site, the travelling arrow is the ghost pill's. Only the ring is new,
 * and a ring is a line, not a fill.
 *
 * IT SIGNALS AT REST. The ring breathes a rose halo outward on a long cycle
 * while the mark is on screen, and stops the moment the pointer arrives —
 * an invitation withdraws once it has been taken. The cycle is offset per
 * mark from its own label, so a pair of these never pulses in unison.
 *
 * IT ADVANCES ON HOVER, as one gesture rather than four effects: the track
 * inks from the left and thickens as it goes, the ring floods rose from its
 * centre, and the arrow inside it steps off to the right while its double
 * arrives from the left. The row is the subject; the ring is the payoff.
 *
 * NOTHING HERE WRITES TO LAYOUT. Every state is transform, opacity or
 * colour — the track's box is fixed and it is scaled, the ring's flood is a
 * scaled disc, both arrows are always in the ring. The rows sit inside a
 * measured canvas in Atmosphere and a twelve-column field in Responsibility,
 * and neither may be made to reflow by a pointer.
 *
 * Ground-aware without a branch: every colour resolves through --accent-text
 * and --text-on-navy, which .on-cream already re-points, plus --mark-ground
 * for the one case that inverts — the arrow inside a flooded ring.
 *
 * With no JavaScript, or under reduced motion, the mark is already ruled,
 * ringed and legible, and it simply does not pulse.
 */

export function PageLink({
  href,
  label,
  /** `lead` closes a section; `sm` sits in a row of two. */
  size = "lead",
  className,
}: {
  href: string;
  label: string;
  size?: "lead" | "sm";
  className?: string;
}) {
  const root = useRef<HTMLAnchorElement | null>(null);

  useGsapScope(root, () => {
    const el = root.current;
    if (!el) return;

    // The label and the ring arrive on the house entrance; the track is ruled
    // open under them a beat later, the way every rubric on the page is.
    revealOnEnter(`.${styles.ink}`, el, { start: "top 88%", stagger: 0.08 });

    gsap.to(`.${styles.track}`, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.9,
      ease: "expo.out",
      delay: 0.12,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });

    // The halo runs only while the mark is on screen. A CSS animation nobody
    // can see is still a compositor job on every frame, and there are five of
    // these on the page.
    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        toggleClass: { targets: el, className: styles.live },
      },
    });
  }, []);

  return (
    <Link
      ref={root}
      href={href}
      className={[styles.mark, styles[size], className]
        .filter(Boolean)
        .join(" ")}
      style={{ "--ping-delay": `${pingDelay(label)}s` } as CSSProperties}
    >
      <span className={styles.row}>
        <span className={`${styles.label} ${styles.ink}`}>{label}</span>

        {/* The ring. Marked up as three stacked layers rather than as borders
            and pseudo-elements so each one owns exactly one transform: the
            halo pulses, the flood opens, the arrows travel. */}
        <span className={`${styles.node} ${styles.ink}`} aria-hidden="true">
          <span className={styles.halo} />
          {/* The clip is on this, not on the ring: the arrows have to be cut
              by the ring's edge and the halo has to escape it, and one
              element cannot do both. */}
          <span className={styles.iris}>
            <span className={styles.flood} />
            <Arrow className={`${styles.arrow} ${styles.arrowOut}`} />
            <Arrow className={`${styles.arrow} ${styles.arrowIn}`} />
          </span>
        </span>
      </span>

      {/* The floor of the row. `.rest` is the hairline that is always there;
          `.ink` is the one that is drawn across it on hover. Siblings rather
          than parent and child, because a parent's opacity would cap the
          child's. */}
      <span className={styles.track} aria-hidden="true">
        <span className={styles.trackRest} />
        <span className={styles.trackInk} />
      </span>
    </Link>
  );
}

function Arrow({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * A stable offset in [0, 1.6) seconds, read off the label so it survives
 * hydration and so two marks in the same row never share one. Sum of char
 * codes: the labels differ in their first few words, which is enough.
 */
function pingDelay(label: string): number {
  let sum = 0;
  for (let i = 0; i < label.length; i += 1) sum += label.charCodeAt(i);
  return ((sum % 17) / 17) * 1.6;
}

export default PageLink;
