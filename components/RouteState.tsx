import type { ReactNode } from "react";
import styles from "./RouteState.module.css";

/**
 * The frame a route shows when it has no page to show: while it loads, and
 * when it fails to render.
 *
 * It is the standing pages' opening frame with nothing in it yet — the same
 * navy ground, the rubric, the display heading and the rose rule — so a load
 * or a failure reads as this site, not as a browser default. While `busy`, the
 * rule draws and undraws; under reduced motion it holds still.
 *
 * It renders its own <main>, because it stands in for a page and the page's
 * own shell (masthead, close) is not there to provide one.
 */
export function RouteState({
  label,
  heading,
  body,
  busy = false,
  children,
}: {
  label?: string;
  heading?: string;
  body?: string;
  busy?: boolean;
  children?: ReactNode;
}) {
  return (
    <main id="main" className={styles.frame} aria-busy={busy || undefined}>
      <div className={`u-shell ${styles.inner}`}>
        {label ? <p className={`u-label ${styles.label}`}>{label}</p> : null}
        {heading ? <h1 className={`u-h2 ${styles.heading}`}>{heading}</h1> : null}
        <span
          className={styles.rule}
          data-busy={busy || undefined}
          aria-hidden="true"
        />
        {body ? <p className={styles.body}>{body}</p> : null}
        {children}
      </div>
    </main>
  );
}

export default RouteState;
