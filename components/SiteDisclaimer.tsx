"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
// From the file rather than the `@/lib/pages` barrel: this is a client
// component on every route, and the barrel would ship every page's copy with it.
import { disclaimerNotice } from "@/lib/pages/legal";
import styles from "./SiteDisclaimer.module.css";

/**
 * The disclaimer, as a small card in the corner when the site is opened.
 *
 * SMALL AND NOT IN THE WAY. It does not dim the page, trap focus or hold the
 * scroll: a visitor can read on underneath it and dismiss it whenever they
 * like. A blocking gate in front of the opening photograph would be exactly
 * the forced stop the site avoids everywhere else.
 *
 * ONCE PER VISIT. It lives in the root layout, which survives client-side
 * navigation, so moving between pages never brings it back; dismissing it is
 * remembered in sessionStorage, so a reload in the same tab does not either.
 * A new visit (a new tab or a new session) sees it again. Storage can throw
 * (private windows, blocked site data), and then it simply shows each load.
 *
 * Rendered only after hydration: the server cannot know whether this visit
 * has already seen it, and a card that flashes on and then off is worse than
 * one that arrives a beat late.
 */

const STORAGE_KEY = "vk-disclaimer-seen";

/** Lets the opening frame and the masthead's arrival land first. */
const SHOW_DELAY = 900;

/** Matches the leave transition in the stylesheet. */
const LEAVE_MS = 420;

type Phase = "hidden" | "entering" | "shown" | "leaving";

export function SiteDisclaimer() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const timer = useRef(0);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    // Mounted closed, then opened on the next frame, so the transition has a
    // starting state to run from.
    timer.current = window.setTimeout(() => {
      setPhase("entering");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setPhase("shown")),
      );
    }, SHOW_DELAY);
    return () => window.clearTimeout(timer.current);
  }, []);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Not remembered; it will show again on the next load, which is fine.
    }
    setPhase("leaving");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase("hidden"), LEAVE_MS);
  };

  if (phase === "hidden") return null;

  return (
    <div
      className={styles.card}
      data-state={phase}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onKeyDown={(event) => {
        if (event.key === "Escape") dismiss();
      }}
    >
      <p id={titleId} className={`u-label ${styles.label}`}>
        {disclaimerNotice.label}
      </p>
      <p id={bodyId} className={styles.body}>
        {disclaimerNotice.body}
      </p>
      <div className={styles.actions}>
        <Link
          className={styles.link}
          href={disclaimerNotice.link.href}
          onClick={dismiss}
        >
          {disclaimerNotice.link.label}
        </Link>
        <button type="button" className={styles.accept} onClick={dismiss}>
          {disclaimerNotice.accept}
        </button>
      </div>
    </div>
  );
}

export default SiteDisclaimer;
