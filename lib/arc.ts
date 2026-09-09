"use client";

/**
 * The petal arc — the page's change of ground, and the one curve that makes it.
 *
 * The page goes navy → cream exactly twice, and the brief calls that wipe the
 * site's signature moment. It is therefore ONE curve, measured one way, drawn
 * by one function: Concept's dome is its own top edge, ArcTransition's is a
 * free-standing event, and this module is what makes those two the same arc
 * rather than two arcs that resemble each other.
 *
 * THE GEOMETRY IS MEASURED OFF A VIEWPORT-SIZED STAGE, never off the section
 * being revealed. That is the whole of it. A radius expressed as a fraction of
 * the revealed element — an `objectBoundingBox` clip, or a percentage — is a
 * different curve for every section and is anchored to a bottom edge that may
 * be three viewports below the fold; the arc then opens where nobody is
 * looking and the section appears to snap in at the end. Both callers hand a
 * stage that is exactly one screen tall, so a one-screen section and a
 * four-screen one get the identical wipe.
 *
 * THE RADIUS IS EASED, NOT LINEAR. Cream area grows with the SQUARE of the
 * radius, so a linear radius reads as an accelerating burst. `power1.out` is
 * very nearly √t, which makes the rate at which cream fills the frame roughly
 * constant — a curve travelling at one speed, first frame to last. Both
 * callers drive `radiusMax` through that ease.
 */

/**
 * Viewports of scroll the second arc's runway occupies, its own sticky stage
 * included — so the arc itself is given ARC_RUN of actual scroll and the
 * remaining viewport is the stage standing in the frame.
 *
 * Concept's dome is the page's centrepiece and takes three; this one is the
 * reprise and takes less, which is what keeps the second telling from reading
 * as a repeat of the first.
 */
export const ARC_SPAN = 2.5;

/**
 * Of that runway, the part that is actual scroll. The sticky stage occupies
 * the first viewport and buys no travel, so the section ABOVE the arc has to
 * grow by exactly this much for the arc to open against a frame that is being
 * held rather than one sliding away underneath it — see ProjectsShowcase.
 */
export const ARC_RUN = ARC_SPAN - 1;

export type Dome = {
  width: number;
  height: number;
  /** The exact radius at which the disc has covered the stage, and not one
   *  pixel of scroll further. The 2% is for sub-pixel rounding, nothing more.
   *  A radius chosen as a safe-for-every-aspect-ratio percentage spends a
   *  third of the scroll off-screen, which forces the visible part to move a
   *  third faster to keep up. */
  radiusMax: number;
};

/**
 * Measure a stage. Call from `onRefresh`, which is also what fires on resize
 * and on an orientation change — never cache the result past one of those.
 */
export function measureDome(stage: Element): Dome {
  const box = stage.getBoundingClientRect();
  const width = box.width;
  const height = box.height;
  return { width, height, radiusMax: Math.hypot(width / 2, height) * 1.02 };
}

/**
 * Paint the disc at `radius`, anchored at the bottom centre of the stage — a
 * half circle standing on the bottom edge of the screen, which is the same
 * origin and the same curve family as the petal in the brand mark.
 *
 * Written inline rather than through a custom property: this runs on every
 * scroll frame of the reveal, and the two prefixed declarations have to be
 * one string so they cannot drift apart.
 */
export function paintDome(el: HTMLElement, radius: number): void {
  const clip = `circle(${radius.toFixed(1)}px at 50% 100%)`;
  const style = el.style as CSSStyleDeclaration & { webkitClipPath?: string };
  style.clipPath = clip;
  style.webkitClipPath = clip;
}
