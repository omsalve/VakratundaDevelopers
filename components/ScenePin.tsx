"use client";

import { useCallback, useId, useState } from "react";
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
};

/** Breathing room left between the card and the edge it opens toward. */
const EDGE = 24;

type Placement = {
  side: "left" | "right";
  drop: "up" | "down";
  /** Cap, in the card's own unscaled px. Undefined until first measured. */
  maxHeight?: number;
};

export function ScenePin({ data }: Props) {
  const { open, toggle, close, groupRef, triggerRef } =
    usePopover<HTMLDivElement, HTMLButtonElement>();
  const cardId = `pin-${useId().replace(/:/g, "")}`;

  const [{ side, drop, maxHeight }, setPlacement] = useState<Placement>({
    side: data.x > 62 ? "left" : "right",
    drop: "down",
  });

  const activate = useCallback(() => {
    const node = triggerRef.current;
    // Measure only on the way IN; on the way out the card is about to be
    // hidden and re-placing it would move it as it goes.
    if (node && !open) {
      const rect = node.getBoundingClientRect();
      const above = rect.top - EDGE;
      const below = window.innerHeight - rect.bottom - EDGE;
      /* The pin layer is scaled by the hero's camera push, so the rect is in
         painted pixels while the cap is applied in the card's own. Recover
         the factor from the node rather than hard-coding it. */
      const scale = node.offsetWidth ? rect.width / node.offsetWidth : 1;
      setPlacement({
        side: rect.left > window.innerWidth * 0.58 ? "left" : "right",
        drop: below >= above ? "down" : "up",
        maxHeight: Math.max(160, Math.floor(Math.max(above, below) / (scale || 1))),
      });
    }
    toggle();
  }, [open, toggle, triggerRef]);

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
        <span className={styles.dot} aria-hidden="true" />
        <span className="u-visually-hidden">{data.title}</span>
      </button>

      <div
        id={cardId}
        role="dialog"
        aria-label={data.title}
        className={styles.card}
        style={maxHeight ? { maxHeight } : undefined}
        /* NOT the `hidden` attribute. The card animates open and shut, and a
           display:none default has no state to animate out of — so the closed
           state is `visibility: hidden` in the stylesheet, which takes it out
           of the accessibility tree and out of the tab order just as `hidden`
           did, while leaving a box for the transition to run on. Which state
           it is in is read from .isOpen on the group. */
        aria-hidden={!open}
      >
        <p className={styles.cardTitle}>{data.title}</p>

        <ul className={styles.list}>
          {data.body.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <a className={styles.cta} href={data.cta.href}>
          <span>{data.cta.label}</span>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>

        {/* The caption, not a bullet: it says what is under the pin. */}
        <p className={styles.evidence}>{data.evidence}</p>

        <button type="button" className={styles.close} onClick={() => close()}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ScenePin;
