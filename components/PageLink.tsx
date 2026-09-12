"use client";

import { useRef } from "react";
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
 * were reachable only from the masthead's four. So this is that third mark,
 * and it is built out of the two that already exist rather than beside them:
 * the rubric's drawn rose hairline, and the pill's travelling arrow.
 *
 * IT IS A MARGIN ENTRY, NOT A BUTTON. No fill, no border, no radius, no
 * plate — the same refusal the rest of the page makes, where the photographs
 * are the only filled shapes. What makes it carry at rest is that it is the
 * one line of DISPLAY face inside a block of body copy, ruled in rose.
 *
 * IT ADVANCES ON HOVER, as one gesture rather than three effects: the rule
 * draws further out, the label rides the extra length, and the arrow steps
 * off the end of it. The rule is the subject of the motion and the rest of
 * the mark is carried by it, which is why nothing here fades or scales.
 *
 * Ground-aware without a branch: every colour resolves through --accent-text
 * and --text-on-navy, which .on-cream already re-points.
 *
 * With no JavaScript, or under reduced motion, the mark is already ruled and
 * already legible — the scope below only takes it from drawn to undrawn so it
 * can be drawn again on arrival.
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

  // The label's last word, kept with the arrow. `lastIndexOf` rather than a
  // split: a label is a sentence, not a token list, and this leaves the rest
  // of it exactly as it was written.
  const cut = label.lastIndexOf(" ");
  const head = cut === -1 ? "" : label.slice(0, cut);
  const tail = cut === -1 ? label : label.slice(cut + 1);

  useGsapScope(root, () => {
    const el = root.current;
    if (!el) return;

    // The label and the arrow arrive on the house entrance; the rule is ruled
    // open under them a beat later, the way every rubric on the page is.
    revealOnEnter(`.${styles.ink}`, el, { start: "top 88%" });

    gsap.to(`.${styles.rule}`, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.9,
      ease: "expo.out",
      delay: 0.12,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, []);

  return (
    <Link
      ref={root}
      href={href}
      className={[styles.mark, styles[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.rule} aria-hidden="true" />

      {/* THE ARROW IS SET INSIDE THE LABEL, and tied to its last word.
          As a third flex child it was pinned to the far edge of the mark, so
          the moment a label wrapped it was left hanging in the void past a
          short second line. Inline it wraps with the text — but inline and
          loose it can be broken onto a line of its own, which is worse. So
          the last word and the arrow are one unbreakable unit, the same
          treatment a widow gets. Setting it here also keeps one transform
          owner per element: the entrance writes to the label, the hover step
          writes to the arrow. */}
      <span className={`${styles.label} ${styles.ink}`}>
        {head ? `${head} ` : null}
        <span className={styles.tail}>
          {tail}
          <svg
            className={styles.arrow}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </span>
    </Link>
  );
}

export default PageLink;
