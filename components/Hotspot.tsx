"use client";

import { useId } from "react";
import clsx from "clsx";
import type { Hotspot as HotspotData } from "@/lib/content";
import { usePopover } from "@/lib/usePopover";
import styles from "./Hotspot.module.css";

/**
 * An annotation pinned to a point in the immersive scene: a node, a leader
 * line, and a figure — the way a measurement is called out on a drawing.
 * Activating it opens the full fact in an anchored panel.
 *
 * Shares its disclosure behaviour with the presence timeline via usePopover,
 * so both read and operate identically.
 */

type Props = {
  data: HotspotData;
  /** Which way the leader line and label run out from the node. */
  side: "left" | "right";
};

export function Hotspot({ data, side }: Props) {
  const { open, toggle, close, groupRef, triggerRef } =
    usePopover<HTMLDivElement, HTMLButtonElement>();
  const panelId = `hotspot-${useId().replace(/:/g, "")}`;

  return (
    <div
      ref={groupRef}
      className={clsx(styles.group, styles[side], open && styles.isOpen)}
      // Anchor the NODE on the point, not the whole group: a right-side label
      // grows away from x, a left-side label grows back toward it.
      style={
        side === "right"
          ? { left: `${data.x}%`, top: `${data.y}%` }
          : { right: `${100 - data.x}%`, top: `${data.y}%` }
      }
      data-hotspot
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.node}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className={styles.dot} aria-hidden="true">
          <span className={styles.pulse} />
        </span>
        <span className={styles.leader} aria-hidden="true" />
        <span className={styles.figure}>
          <span className={clsx(styles.value, "u-numeral")}>{data.value}</span>
          {data.unit && <span className={styles.unit}>{data.unit}</span>}
        </span>
        {/* Screen readers get the whole fact at the trigger, so the panel is
            an enhancement rather than the only route to the content. */}
        <span className="u-visually-hidden">{` — ${data.title}. ${data.body}`}</span>
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label={data.title}
        className={styles.panel}
        hidden={!open}
      >
        <p className={styles.panelTitle}>{data.title}</p>
        <p className={styles.panelBody}>{data.body}</p>
        <button type="button" className={styles.close} onClick={() => close()}>
          Close
        </button>
      </div>
    </div>
  );
}

export default Hotspot;
