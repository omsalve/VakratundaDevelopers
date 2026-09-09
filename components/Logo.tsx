import type { CSSProperties } from "react";
import clsx from "clsx";
import styles from "./Logo.module.css";

/**
 * The Vakratunda mark + wordmark.
 *
 * ⚠️ PLACEHOLDER ART. The petal mandala below is redrawn by hand from the
 * brand guide cover (CP_Final p.1). It is close, not exact. Replace it with
 * the studio's real vector before launch:
 *
 *   1. Export the mark as SVG, 200×200 viewBox, strokes only, no fill.
 *   2. Paste the paths in place of the <g> inside `LogoMark` below.
 *   3. Keep `stroke="currentColor"` and `vectorEffect="non-scaling-stroke"`
 *      so the mark inherits the section's colour and keeps an even line
 *      weight at every size.
 *
 * The same curve is reused as the wipe shape in ArcTransition, so if the
 * real mark has a different petal profile, update `ARC_PATH` there too.
 */

type MarkProps = {
  className?: string;
  /**
   * Rendered size in px, pinned inline. Omit it to let the caller's own class
   * size the mark instead — an inline width cannot be overridden by a
   * stylesheet, so a mark that has to scale with the viewport has to be given
   * no size here at all.
   */
  size?: number;
};

/** The asset's real pixel box. It is a landscape plate, not a square. */
const NATURAL = { width: 717, height: 348 };

/** The wordmark plate's real pixel box — public/images/Brandmark.png. */
const WORDMARK = { width: 858, height: 144 };

export function LogoMark({ className, size }: MarkProps) {
  // A square box letterboxes this asset and throws away half the space it is
  // given, so the intrinsic ratio is only declared as square where a caller
  // has actually asked for a square by passing `size` — which is what the
  // existing watermark and header call sites are drawn against.
  const attrs =
    size === undefined ? NATURAL : { width: size, height: size };
  return (
    <img
      className={clsx(styles.mark, className)}
      src="/images/logo.png"
      alt=""
      width={attrs.width}
      height={attrs.height}
      aria-hidden="true"
      draggable={false}
      style={
        size === undefined
          ? undefined
          : { width: size, height: size, objectFit: "contain", display: "block" }
      }
    />
  );
}

type LogoProps = {
  className?: string;
  /** Stacked = mark above wordmark (hero, footer). Inline = side by side (header). */
  layout?: "inline" | "stacked";
  size?: number;
  /** Show the brand line under the wordmark. Stacked layout only. */
  withTagline?: boolean;
};

export function Logo({
  className,
  layout = "inline",
  size = 40,
  withTagline = false,
}: LogoProps) {
  return (
    <span
      className={clsx(styles.logo, styles[layout], className)}
      /* The wordmark is artwork now, so it cannot be sized off the inherited
         font-size the way set type was. The mark's size is the one dimension
         every call site already passes, so the plate is measured against it. */
      style={{ "--logo-size": `${size}px` } as CSSProperties}
    >
      <LogoMark size={size} />
      <span className={styles.wordmarkGroup}>
        {/* The drawn wordmark from the brand guide, in place of the display
            face set in small caps — the letterforms are the studio's own. */}
        <img
          className={styles.wordmark}
          src="/images/Brandmark.png"
          alt="Vakratunda"
          width={WORDMARK.width}
          height={WORDMARK.height}
          draggable={false}
        />
        {withTagline && (
          // CP_Final p.1
          <span className={styles.tagline}>Where dreams find an address</span>
        )}
      </span>
    </span>
  );
}

export default Logo;
