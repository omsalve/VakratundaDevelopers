"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import clsx from "clsx";
import type { ScenePin as ScenePinData } from "@/lib/content";
import { usePopover } from "@/lib/usePopover";
import styles from "./ScenePin.module.css";

/**
 * An annotation glued to a point in the opening photograph: a node on the
 * picture, and a card of copy that opens when it is activated.
 *
 * IT DOES NOT POSITION ITSELF AGAINST THE FRAME. The pin is laid out in
 * percentages of the photograph's painted rectangle, inside the same two
 * transforms the photograph rides — see the pin layer in Journey. From here
 * that is invisible: `left`/`top` are simply the coordinates that came with
 * the copy, and they stay on their subject for the whole descent.
 *
 * Shares its disclosure grammar with the impact hotspots and the presence
 * timeline via usePopover — click or Enter to open, Escape to close,
 * click-away and focus-away to dismiss, focus returned to the node. The card
 * is an enhancement rather than the only route to the content: the node
 * carries the title as its accessible name, and the card itself is ordinary
 * focusable content once open.
 *
 * The card is anchored to the node on every screen size rather than docking
 * to the foot of the window on small ones, which is what the impact hotspots
 * do. It has to be: an ancestor of this component carries a transform, and a
 * `position: fixed` descendant of a transformed element is positioned against
 * that element rather than the viewport, so a docked panel would not dock.
 *
 * WHICH WAY IT OPENS IS MEASURED, NOT AUTHORED, and it is measured at the
 * moment of opening rather than once. The pin is glued to a photograph that
 * travels the whole length of the section, so the same pin is near the foot
 * of the window at one scroll position and near the head of it at another —
 * a flip decided from its fixed coordinate on the picture is right for one
 * moment of the scroll and wrong for the rest, and the card runs off the
 * bottom of the window. So on each open the node is measured against the
 * window, the card takes whichever side has more room, and it is capped to
 * the room actually there and scrolls inside itself if the copy is longer.
 */

type Props = {
  data: ScenePinData;
  /** This pin's place among the pins on the photograph, from 0. */
  index: number;
  total: number;
};

/** Breathing room left between the card and the edge it opens toward. */
const EDGE = 24;

/** Side margin a centred card keeps from the window on a phone, in px. */
const GUTTER = 16;

/** The stylesheet's small-screen breakpoint, where the card centres on the pin. */
const SMALL = "(max-width: 47.99rem)";

type Placement = {
  side: "left" | "right";
  drop: "up" | "down";
  /** Cap, in the card's own unscaled px. Undefined until first measured. */
  maxHeight?: number;
  /** Sideways correction for a centred card, in its own unscaled px. */
  nudge?: number;
};

/** "Shown: the open pavilion…" → "The open pavilion…". The card labels the
 *  line itself, so the copy's own prefix would say it twice. */
function evidenceText(line: string) {
  const text = line.replace(/^shown:\s*/i, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Sent when any pin opens, so the hint under the pins can step aside. */
export const PIN_OPENED = "scene-pin:open";

/** Sent when the pins withdraw (the hero coming back), so no card is left
 *  standing open on a layer that has faded out. */
export const PINS_WITHDRAWN = "scene-pin:withdraw";

export function ScenePin({ data, index, total }: Props) {
  const { open, toggle, close, groupRef, triggerRef } =
    usePopover<HTMLDivElement, HTMLButtonElement>();

  useEffect(() => {
    if (!open) return;
    const onWithdraw = () => close(false);
    window.addEventListener(PINS_WITHDRAWN, onWithdraw);
    return () => window.removeEventListener(PINS_WITHDRAWN, onWithdraw);
  }, [open, close]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardId = `pin-${useId().replace(/:/g, "")}`;

  const [{ side, drop, maxHeight, nudge }, setPlacement] = useState<Placement>({
    // Right of the pin unless it stands in the last third of the picture.
    side: data.x > 70 ? "left" : "right",
    drop: "down",
  });

  const activate = useCallback(() => {
    const node = triggerRef.current;
    // Measure only on the way IN; on the way out the card is about to be
    // hidden and re-placing it would move it as it goes.
    if (node && !open) {
      const rect = node.getBoundingClientRect();
      /* The masthead is fixed over the top of the window, so the room above a
         pin ends at its foot, not at the top of the glass. */
      const root = getComputedStyle(document.documentElement);
      const header =
        parseFloat(root.getPropertyValue("--header-h")) * parseFloat(root.fontSize) || 0;
      const above = rect.top - header - EDGE;
      const below = window.innerHeight - rect.bottom - EDGE;
      /* The pin layer is scaled by the hero's camera push, so the rect is in
         painted pixels while the cap is applied in the card's own. Recover
         the factor from the node rather than hard-coding it. */
      const scale = (node.offsetWidth ? rect.width / node.offsetWidth : 1) || 1;

      /* On a phone the card centres on its pin, and the tour carries pins
         right up to the edges of the window — so a card opened on one would
         hang half off the glass. Measure where it would land and slide it back
         inside, keeping it on the pin's side. */
      let shift = 0;
      const card = cardRef.current;
      if (card && window.matchMedia(SMALL).matches) {
        const centre = rect.left + rect.width / 2;
        const half = (card.offsetWidth * scale) / 2;
        const overLeft = GUTTER - (centre - half);
        const overRight = centre + half - (window.innerWidth - GUTTER);
        if (overLeft > 0) shift = overLeft;
        else if (overRight > 0) shift = -overRight;
      }

      setPlacement({
        side: rect.left > window.innerWidth * 0.58 ? "left" : "right",
        drop: below >= above ? "down" : "up",
        maxHeight: Math.max(160, Math.floor(Math.max(above, below) / scale)),
        nudge: Math.round(shift / scale),
      });
      window.dispatchEvent(new CustomEvent(PIN_OPENED));
    }
    toggle();
  }, [open, toggle, triggerRef]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      ref={groupRef}
      className={clsx(styles.pin, styles[side], styles[drop], open && styles.isOpen)}
      style={{ left: `${data.x}%`, top: `${data.y}%` }}
      data-scene-pin
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.node}
        aria-expanded={open}
        aria-controls={cardId}
        onClick={activate}
      >
        <span className={styles.pulse} aria-hidden="true" />
        <span className={clsx(styles.pulse, styles.pulseLate)} aria-hidden="true" />
        <span className={styles.disc} aria-hidden="true">
          <span className={styles.plus} />
        </span>
        <span className="u-visually-hidden">{data.title}</span>
      </button>

      {/* The line the card is drawn out along, from the pin to its edge. */}
      <span className={styles.leader} aria-hidden="true" />

      <div
        id={cardId}
        role="dialog"
        aria-label={data.title}
        ref={cardRef}
        className={styles.card}
        style={
          {
            maxHeight,
            "--nudge-x": nudge ? `${nudge}px` : undefined,
          } as CSSProperties
        }
        /* NOT the `hidden` attribute. The card animates open and shut, and a
           display:none default has no state to animate out of — so the closed
           state is `visibility: hidden` in the stylesheet, which takes it out
           of the accessibility tree and out of the tab order just as `hidden`
           did, while leaving a box for the transition to run on. Which state
           it is in is read from .isOpen on the group. */
        aria-hidden={!open}
      >
        <div className={styles.cardHead}>
          <span className={`u-numeral ${styles.count}`}>
            {pad(index + 1)}
            <span className={styles.countTotal}> / {pad(total)}</span>
          </span>
          <button
            type="button"
            className={styles.close}
            onClick={() => close()}
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <p className={styles.cardTitle}>
          <span className={styles.cardTitleInner}>{data.title}</span>
        </p>

        <ul className={styles.list}>
          {data.body.map((line, i) => (
            <li key={line} style={{ "--n": i } as CSSProperties}>
              <span className={styles.tick} aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* The caption, not a claim: it says what is under the pin. */}
        <p className={styles.evidence}>
          <span className={styles.evidenceLabel}>In frame</span>
          {evidenceText(data.evidence)}
        </p>

        <a className={styles.cta} href={data.cta.href}>
          <span>{data.cta.label}</span>
          <span className={styles.ctaIcon} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

export default ScenePin;
