import type { CSSProperties } from "react";
import clsx from "clsx";
import styles from "./Logo.module.css";

/**
 * The Vakratunda mark + wordmark.
 *
 * BOTH ASSETS ARE TIGHT-CROPPED, and that is the whole reason this file is
 * worth reading. The studio's originals — `logo.png` (717×348) and
 * `Brandmark.png` (858×144) — are plates: the artwork floats inside a much
 * larger transparent canvas. The mark's drawing is only 263×264 of that
 * 717×348 box, so a caller asking for a 34px mark got 12.5px of drawing and
 * 21.5px of nothing. `brand-mark.png` is the mark cropped to its own alpha
 * bounds, so a size passed here is the size that lands on the page. The
 * originals are kept in `public/images` as the source of record; nothing
 * renders them. The wordmark is no longer artwork: it is set in the display
 * face, to match the hero's "find an address" line.
 *
 * ⚠️ PLACEHOLDER ART. The petal mandala is redrawn by hand from the brand
 * guide cover (CP_Final p.1). It is close, not exact. Replace it with the
 * studio's real vector before launch:
 *
 *   1. Export the mark as SVG, strokes only, no fill, TRIMMED TO THE ARTWORK
 *      — no canvas margin, or the sizing below understates it again.
 *   2. Point `MARK.src` at it and update `MARK.width` / `MARK.height`.
 *
 * The same curve is reused as the wipe shape in ArcTransition, so if the real
 * mark has a different petal profile, update `ARC_PATH` there too.
 */

/** The mark, cropped to its drawing. Very nearly square. */
const MARK = { src: "/images/brand-mark.png", width: 263, height: 264 };

type MarkProps = {
  className?: string;
  /**
   * The mark's rendered size in px, pinned inline — and now honest, because
   * the asset carries no margin: pass 48 and 48px of drawing appears. Omit it
   * to let the caller's own class size the mark instead; an inline width
   * cannot be overridden by a stylesheet, so a mark that has to scale with
   * the viewport has to be given no size here at all.
   */
  size?: number;
};

export function LogoMark({ className, size }: MarkProps) {
  return (
    <img
      className={clsx(styles.mark, className)}
      src={MARK.src}
      alt=""
      width={size ?? MARK.width}
      height={size ?? MARK.height}
      aria-hidden="true"
      draggable={false}
      style={
        size === undefined
          ? undefined
          : { width: size, height: size, display: "block" }
      }
    />
  );
}

type LogoProps = {
  className?: string;
  /** Stacked = mark above wordmark (hero, footer). Inline = side by side (header). */
  layout?: "inline" | "stacked";
  /**
   * The mark's height, and the one dimension the wordmark is measured against.
   * A number is px; a string is any CSS length, so a lockup that has to breathe
   * with the viewport can be handed a `clamp()` and be sized entirely from the
   * stylesheet. Either way it lands on `--logo-size` and nothing here is pinned
   * inline, which is what lets a media query step the whole lockup down.
   */
  size?: number | string;
  /** Applied to the mark alone, so a caller can animate it without the words. */
  markClassName?: string;
  /** Show the brand line under the wordmark. Stacked layout only. */
  withTagline?: boolean;
};

export function Logo({
  className,
  layout = "inline",
  size = 40,
  markClassName,
  withTagline = false,
}: LogoProps) {
  return (
    <span
      className={clsx(styles.logo, styles[layout], className)}
      /* The mark's size is the one dimension every call site already passes,
         so the wordmark's type is measured against it. */
      style={
        {
          "--logo-size": typeof size === "number" ? `${size}px` : size,
        } as CSSProperties
      }
    >
      {/* Deliberately unsized here: `.markSized` reads --logo-size, so the
          whole lockup answers to one value that a media query can move. */}
      <LogoMark className={clsx(styles.markSized, markClassName)} />
      <span className={styles.wordmarkGroup}>
        {/* Set type, in the same face as the hero's "find an address" line. */}
        <span className={styles.wordmark}>Vakratunda</span>
        {withTagline && (
          // CP_Final p.1
          <span className={styles.tagline}>Where dreams find an address</span>
        )}
      </span>
    </span>
  );
}

export default Logo;
