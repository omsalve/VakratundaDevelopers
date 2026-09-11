"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import clsx from "clsx";
import styles from "./LocationMap.module.css";

/**
 * An interactive overlay on a static map image. No map library, no tiles: a
 * picture, a list of coordinates, and a panel that opens on the point.
 *
 * TWO EXPORTS, one implementation:
 *
 *   · <LocationMap>  — the picture and the pins together. What you want when
 *     the map is a block on the page.
 *   · <MapPinLayer>  — the pins alone, filling their positioned parent. What
 *     you want when a section already owns the picture (ProjectsShowcase
 *     paints the same map through two clip-path windows, so the layer has to
 *     sit beside it rather than around it).
 *
 * THE COORDINATE CONTRACT, which is the whole reason this file exists.
 * A point's x/y are per cent of the SOURCE IMAGE, not of the box it happens
 * to be painted into. Those are different rectangles the moment `object-fit`
 * is doing anything: `cover` overflows the box on one axis and the focal
 * point decides which part is thrown away. So the layer re-derives the
 * painted rectangle from the box it measures and places every pin inside
 * THAT. A pin stays on its street through any resize, any aspect ratio, any
 * crop — and the two numbers you author never have to change.
 *
 * The corollary: `fit` and `focalX`/`focalY` must match the CSS the image is
 * actually painted with. <LocationMap> writes both from the same object, so
 * they cannot drift; <MapPinLayer> is told, because someone else painted it.
 *
 * MEASUREMENT. Everything here reads `clientWidth`/`offsetHeight`, never
 * `getBoundingClientRect()`, because the layer is expected to work inside a
 * transformed ancestor — ProjectsShowcase scales the map as it scrolls, and
 * the untransformed box is the one the geometry is defined against.
 *
 * PICTURES, NOT ONLY WORDS. A panel takes an optional strip of up to three
 * thumbnails under its description — what is at the point, not only its name.
 * The files are fetched the first time the panel is opened and never again:
 * every panel stays mounted so it can be measured, and a strip that loaded
 * eagerly would pull every point's pictures down for a panel nobody opens.
 * The boxes are always in the markup and hold their own aspect ratio, so the
 * measured height is the real one from the first open.
 *
 * CLICK, NOT HOVER. A panel opens when its pin is clicked and stays open
 * until something dismisses it: the same pin again, a different pin, a click
 * off the map, or Escape. Hover only lights the pin, and moving the pointer
 * away never takes the panel with it — so reading one is not a steadiness
 * test, and a set of pins this small and this close together stays usable.
 * The same gesture serves mouse, touch and keyboard, with no pointer-type
 * branching anywhere in the component.
 *
 * THE TARGET IS THE PIN. The button is round and exactly the size of the
 * ring, concentric with it, and every part inside is `pointer-events: none`
 * so the halo's glow is glow and nothing more. Touch is the one exception,
 * in the stylesheet: a finger is blunter than a cursor and gets a
 * comfortable box back.
 *
 * DENSITY. That target is then capped at the distance to the nearest
 * neighbour, so a crowded map degrades into smaller targets rather than into
 * pins stealing each other's clicks. It cannot invent room, though: a set of
 * points this tightly grouped wants a map about 900px wide or more to stay
 * comfortable. Below that, cluster the points as this map does — one pin per
 * locality, the addresses in the panel.
 *
 * @example
 * <LocationMap
 *   image={{ src: "/images/maps.png", alt: "…", width: 3344, height: 1880 }}
 *   points={[
 *     { id: "bandra", x: 30.8, y: 59.6, title: "Bandra",
 *       description: "Three addresses in the BKC corridor.",
 *       media: [{ id: "bkc-9", src: "/images/projects/bkc-9.jpg",
 *                 alt: "BKC 9 at dusk", width: 1200, height: 1500 }],
 *       meta: [{ label: "Possession", value: "2027" }],
 *       items: [{ id: "bkc-9", label: "BKC 9", note: "Ongoing" }] },
 *   ]}
 * />
 */

/* ============================================================================
   Types
   ========================================================================== */

export type MapImageFit = "cover" | "contain";

/** The geometry the projection needs. Must match the painted CSS. */
export interface MapImageGeometry {
  /** Intrinsic pixel size of the source file — the real one, not a display size. */
  width: number;
  height: number;
  /** Matches `object-fit`. Default "cover". */
  fit?: MapImageFit;
  /** Matches `object-position`, in per cent. Default 50 / 50. */
  focalX?: number;
  focalY?: number;
}

export interface MapImage extends MapImageGeometry {
  src: string;
  alt: string;
}

/** A thumbnail in a panel's picture strip. */
export interface MapThumbnail {
  id: string;
  src: string;
  alt: string;
  /** Intrinsic pixel size of the source file, for next/image. */
  width: number;
  height: number;
}

/** One pin, and what opens off it. */
export interface MapPoint {
  id: string;
  /** Position on the SOURCE IMAGE, in per cent of its intrinsic box. */
  x: number;
  y: number;
  /** Small line above the title — a count, a status, a region. */
  eyebrow?: string;
  title: string;
  /** One or two sentences. Anything longer belongs on a page. */
  description?: string;
  /**
   * A strip of small pictures under the description — what is actually at
   * this point, rather than only its name. Three at most: the panel is 20rem
   * wide, and a fourth thumbnail in that width is a texture, not a picture.
   * A caller with more should send the best three and let the page carry the
   * rest.
   */
  media?: MapThumbnail[];
  /** Spec pairs, set side by side: possession dates, unit types, areas. */
  meta?: { label: string; value: string }[];
  /** A list under the rule — the addresses at this point, say. */
  items?: { id: string; label: string; note?: string }[];
}

/** Keep-out margin for panels, in px, measured from the layer's own edges. */
export interface MapSafeArea {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface MapPinLayerProps {
  image: MapImageGeometry;
  points: MapPoint[];
  /**
   * Keeps panels clear of whatever else the host draws over the map — a
   * progress rail down one side, a caption along the foot.
   */
  safeArea?: MapSafeArea;
  /**
   * False parks the layer: it fades out and stops taking the pointer. For
   * sections that only settle on the map for part of their scroll.
   */
  active?: boolean;
  /** Fires with the open point's id, or null. */
  onOpenChange?: (id: string | null) => void;
  /** Names the group of pins for assistive technology. */
  label?: string;
  className?: string;
}

export interface LocationMapProps extends Omit<MapPinLayerProps, "image"> {
  image: MapImage;
  /** Passed to next/image. Default "100vw". */
  sizes?: string;
  priority?: boolean;
}

/* ============================================================================
   Constants
   ========================================================================== */

/** Pin centre to the panel's near edge. Shared with the stylesheet as a var. */
const PANEL_OFFSET = 22;

/* Pins are a click disclosure — see the note at the top of the file. There is
   no hover timing to tune, and deliberately so. */

/** A pin closer than this to the layer's edge is a pin half off the picture. */
const EDGE_TOLERANCE = 14;

/**
 * The COLLISION LIMIT on a pin's pointer target, in px — not its size. The
 * stylesheet takes `min(--pin-ring, --pin-hit)`, so the target is the pin as
 * drawn and this only ever narrows it: no target may be wider than the gap to
 * its nearest neighbour, or two pins would swallow each other's hover and you
 * would open the one you did not aim at.
 *
 * The ceiling is only a finite fallback for a point with no neighbour. Below
 * MIN some overlap is unavoidable; the nearer centre still wins, because a
 * later pin paints over an earlier one.
 */
const HIT_CEILING = 44;
const HIT_MIN = 12;

const DEFAULT_SAFE_AREA = { top: 16, right: 16, bottom: 16, left: 16 };

/* ============================================================================
   Projection
   ========================================================================== */

interface Box {
  w: number;
  h: number;
}

/** The rectangle the image is actually painted into, in the layer's own px. */
interface PaintedRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** One point, resolved against that rectangle. Null until it is measured. */
interface Projected {
  point: MapPoint;
  x: number | null;
  y: number | null;
  onScreen: boolean;
}

function paintedRect(box: Box, image: MapImageGeometry): PaintedRect | null {
  if (box.w <= 0 || box.h <= 0 || !image.width || !image.height) return null;

  const byWidth = box.w / image.width;
  const byHeight = box.h / image.height;
  // `cover` takes the larger scale and overflows; `contain` takes the smaller
  // and letterboxes. Both then place the surplus (or the slack) by the focal
  // point, which is exactly what `object-position` does — and for `cover` the
  // surplus is negative, so the one expression covers both.
  const scale =
    image.fit === "contain"
      ? Math.min(byWidth, byHeight)
      : Math.max(byWidth, byHeight);

  const width = image.width * scale;
  const height = image.height * scale;

  return {
    left: (box.w - width) * ((image.focalX ?? 50) / 100),
    top: (box.h - height) * ((image.focalY ?? 50) / 100),
    width,
    height,
  };
}

/** useLayoutEffect that does not warn during SSR. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The element's content box, untransformed, kept current across resizes.
 * Starts at zero so the first (server) render can fall back to plain per-cent
 * placement; ResizeObserver runs before the first paint, so nothing is ever
 * seen in the fallback position.
 */
function useElementBox(ref: React.RefObject<HTMLElement | null>): Box {
  const [box, setBox] = useState<Box>({ w: 0, h: 0 });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    read();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return box;
}

/* ============================================================================
   Placement
   ========================================================================== */

type PanelSide = "left" | "right";

interface Placement {
  /** Which point this placement was solved for; it survives the fade-out. */
  id: string;
  side: PanelSide;
  /** Vertical offset from the pin, in px. */
  offsetY: number;
}

/**
 * How far down the panel sits relative to the pin, as a fraction of its own
 * height above the pin's row: half for centred, and two off-centre positions
 * that shift most of the panel's mass clear of whatever is in the way while
 * still reading as anchored to the point.
 */
const ANCHOR_BIAS = { centre: 0.5, below: 0.15, above: 0.85 } as const;

/**
 * Where the panel goes.
 *
 * Beside the pin, on a side with room for it, and as near to level with the
 * point as the safe area allows — but a panel opened by a CLICK stays up, and
 * anything it lands on is a pin nobody can reach until it is dismissed. So
 * every position that fits is scored by how many other points it would bury,
 * and the emptiest wins. Candidates are generated in preference order and
 * ties keep the earliest, so with nothing in the way this still resolves to
 * the plain answer: to the right, centred.
 *
 * Solved against the layer, not the viewport, because the layer is the thing
 * with `overflow: hidden` around it.
 */
function solvePlacement(
  pin: { x: number; y: number },
  box: Box,
  panel: Box,
  safe: Required<MapSafeArea>,
  others: { x: number; y: number }[],
): Omit<Placement, "id"> {
  const minTop = safe.top;
  const maxTop = box.h - safe.bottom - panel.h;
  const clampTop = (top: number) =>
    maxTop <= minTop ? minTop : Math.min(Math.max(top, minTop), maxTop);

  const leftEdge = (side: PanelSide) =>
    side === "right"
      ? pin.x + PANEL_OFFSET
      : pin.x - PANEL_OFFSET - panel.w;

  const candidates: { side: PanelSide; top: number }[] = [];
  for (const side of ["right", "left"] as const) {
    const left = leftEdge(side);
    // A side only counts if the whole panel clears the safe area on it.
    if (side === "right" && left + panel.w > box.w - safe.right) continue;
    if (side === "left" && left < safe.left) continue;

    for (const anchor of ["centre", "below", "above"] as const) {
      candidates.push({
        side,
        top: clampTop(pin.y - panel.h * ANCHOR_BIAS[anchor]),
      });
    }
  }

  // Neither side fits — a very narrow layer. Keep it on the right; the clamp
  // does what it can.
  if (candidates.length === 0) {
    return { side: "right", offsetY: clampTop(pin.y - panel.h / 2) - pin.y };
  }

  let best = candidates[0];
  let bestBuried = Infinity;

  for (const candidate of candidates) {
    const left = leftEdge(candidate.side);
    let buried = 0;
    for (const other of others) {
      if (
        other.x >= left &&
        other.x <= left + panel.w &&
        other.y >= candidate.top &&
        other.y <= candidate.top + panel.h
      ) {
        buried++;
      }
    }
    if (buried < bestBuried) {
      bestBuried = buried;
      best = candidate;
      if (buried === 0) break;
    }
  }

  return { side: best.side, offsetY: best.top - pin.y };
}

/* ============================================================================
   The overlay
   ========================================================================== */

export function MapPinLayer({
  image,
  points,
  safeArea,
  active = true,
  onOpenChange,
  label = "Locations on the map",
  className,
}: MapPinLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());

  const [openId, setOpenId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  /**
   * Which panels have ever been opened — and therefore whose thumbnails are
   * worth fetching. Every panel stays mounted so it can be measured, so a
   * picture strip rendered eagerly would pull every point's images down on
   * page load for a panel nobody may open. The BOXES are always in the
   * markup, sized by their aspect ratio, so the measurement the placement
   * solver takes is the panel's real height from the first open; only the
   * files wait. A point is never un-revealed, so re-opening is instant.
   */
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const box = useElementBox(layerRef);

  /* ---- Geometry --------------------------------------------------------- */
  // Destructured to primitives: callers pass the image object inline, so its
  // identity changes every render and would defeat the memo.
  const { width, height, fit, focalX, focalY } = image;

  const rect = useMemo(
    () => paintedRect(box, { width, height, fit, focalX, focalY }),
    [box, width, height, fit, focalX, focalY],
  );

  const safe = useMemo(
    () => ({ ...DEFAULT_SAFE_AREA, ...safeArea }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeArea?.top, safeArea?.right, safeArea?.bottom, safeArea?.left],
  );

  /**
   * Every point, projected. A point can fall outside the layer when a crop
   * throws its part of the map away — it is dropped rather than pressed
   * against the edge, because a pin off its street is worse than no pin.
   */
  const projected = useMemo(() => {
    const placed: Projected[] = points.map((point) => {
      // Before the first measurement there is no painted rectangle to project
      // into; the pin falls back to plain per-cent placement.
      if (!rect) return { point, x: null, y: null, onScreen: true };

      const x = rect.left + rect.width * (point.x / 100);
      const y = rect.top + rect.height * (point.y / 100);

      return {
        point,
        x,
        y,
        onScreen:
          x >= EDGE_TOLERANCE &&
          x <= box.w - EDGE_TOLERANCE &&
          y >= EDGE_TOLERANCE &&
          y <= box.h - EDGE_TOLERANCE,
      };
    });

    /**
     * Cap each pointer target at the room it actually has. Two circles of
     * diameter d whose centres are D apart do not overlap while d <= D, so
     * the nearest neighbour is the limit — and where the addresses crowd
     * closer than the pin is drawn, the target narrows rather than stealing
     * the hover meant for the pin beside it.
     */
    return placed.map((entry, i) => {
      if (entry.x === null || entry.y === null) {
        return { ...entry, hit: HIT_CEILING };
      }

      let nearest = Infinity;
      for (let j = 0; j < placed.length; j++) {
        const other = placed[j];
        if (j === i || other.x === null || other.y === null) continue;
        nearest = Math.min(
          nearest,
          Math.hypot(other.x - entry.x, other.y - entry.y),
        );
      }

      return {
        ...entry,
        hit: Math.max(HIT_MIN, Math.min(HIT_CEILING, nearest)),
      };
    });
  }, [points, rect, box.w, box.h]);

  /* ---- Disclosure ------------------------------------------------------- */
  /**
   * Click the pin to open it, click it again to close. Clicking a different
   * pin moves straight to that one — one panel is open at a time, so the
   * panels can never overlap and the z-order stays trivial.
   */
  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
    setRevealed((current) =>
      current.has(id) ? current : new Set(current).add(id),
    );
  }, []);

  useEffect(() => {
    onOpenChange?.(openId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  /**
   * A parked layer holds nothing open. Reset while rendering rather than in
   * an effect — the sanctioned way to derive state from a changed prop — so
   * an inert layer is never painted with a panel on it, not even for a frame.
   */
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setOpenId(null);
  }

  /**
   * The two ways out that are not the pin itself: a click anywhere off the
   * map, and Escape. Both are bound only while something is open, and both
   * are on the document so they work wherever the pointer or focus has since
   * wandered to.
   *
   * `pointerdown` rather than `click`, so a press that begins outside the
   * layer dismisses immediately. A press on a pin runs this first and is
   * ignored — the pin is inside the layer — and the pin's own click handler
   * then does the toggle.
   */
  useEffect(() => {
    if (!openId) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!layerRef.current?.contains(event.target as Node)) setOpenId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpenId(null);
      triggerRefs.current.get(openId)?.focus({ preventScroll: true });
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  /* ---- Solve the panel's position before it is painted ------------------ */
  /**
   * Panels stay mounted at their natural size (hidden by `visibility`, which
   * still lays out), so the open one can be measured here and placed in the
   * same commit it becomes visible. No first frame in the wrong place, and no
   * transition fighting a position change.
   *
   * Deliberately does nothing on close: the last placement has to survive the
   * fade-out, or the panel jumps as it goes.
   */
  useIsomorphicLayoutEffect(() => {
    if (!openId) return;

    const layer = layerRef.current;
    const panel = panelRefs.current.get(openId);
    const hit = projected.find((entry) => entry.point.id === openId);
    if (!layer || !panel || !hit || hit.x === null || hit.y === null) return;

    const next = solvePlacement(
      { x: hit.x, y: hit.y },
      { w: layer.clientWidth, h: layer.clientHeight },
      { w: panel.offsetWidth, h: panel.offsetHeight },
      safe,
      // Every other pin still on the map: the panel is placed to keep as many
      // of them clickable as it can.
      projected.flatMap((entry) =>
        entry.point.id === openId ||
        !entry.onScreen ||
        entry.x === null ||
        entry.y === null
          ? []
          : [{ x: entry.x, y: entry.y }],
      ),
    );

    setPlacement((prev) =>
      prev &&
      prev.id === openId &&
      prev.side === next.side &&
      prev.offsetY === next.offsetY
        ? prev
        : { id: openId, ...next },
    );
  }, [openId, projected, safe]);

  /* ---- Render ----------------------------------------------------------- */
  return (
    <div
      ref={layerRef}
      className={clsx(styles.layer, className)}
      data-active={active ? "true" : "false"}
      data-engaged={openId ? "true" : "false"}
      role="group"
      aria-label={label}
      style={{ "--map-panel-offset": `${PANEL_OFFSET}px` } as CSSProperties}
    >
      {projected.map(({ point, x, y, onScreen, hit }, index) => {
        const isOpen = openId === point.id;
        const placed = placement?.id === point.id ? placement : null;

        return (
          <div
            key={point.id}
            className={styles.point}
            data-open={isOpen ? "true" : "false"}
            data-side={placed?.side ?? "right"}
            hidden={!onScreen}
            style={
              {
                left: x === null ? `${point.x}%` : `${x}px`,
                top: y === null ? `${point.y}%` : `${y}px`,
                "--i": index,
                "--pin-hit": `${hit}px`,
                "--sy": `${placed?.offsetY ?? 0}px`,
              } as CSSProperties
            }
            // Tabbing on to something else closes the panel behind you. Only
            // a real focus move counts: clicking the panel's own text blurs
            // the trigger with no relatedTarget, and must not dismiss it.
            onBlur={(event) => {
              const next = event.relatedTarget as Node | null;
              if (next && !event.currentTarget.contains(next)) setOpenId(null);
            }}
          >
            <button
              ref={(node) => {
                if (node) triggerRefs.current.set(point.id, node);
                else triggerRefs.current.delete(point.id);
              }}
              type="button"
              className={styles.pin}
              aria-expanded={isOpen}
              onClick={() => toggle(point.id)}
            >
              <span className={styles.halo} aria-hidden="true" />
              <span className={styles.beacon} aria-hidden="true" />
              <span className={styles.ring} aria-hidden="true" />
              <span className={styles.core} aria-hidden="true" />
              {/* The whole fact, at the trigger. The panel is then an
                  enhancement rather than the only route to the content, and
                  can be hidden from the accessibility tree entirely. */}
              <span className="u-visually-hidden">{spokenLabel(point)}</span>
            </button>

            <div className={styles.slot} aria-hidden="true">
              <div
                ref={(node) => {
                  if (node) panelRefs.current.set(point.id, node);
                  else panelRefs.current.delete(point.id);
                }}
                className={styles.panel}
              >
                {point.eyebrow && (
                  <p className={styles.eyebrow}>{point.eyebrow}</p>
                )}
                <p className={styles.title}>{point.title}</p>
                {point.description && (
                  <p className={styles.description}>{point.description}</p>
                )}

                {/* The picture strip. One thumbnail runs wide; two or three
                    share the width as squares — the grid decides, so the
                    caller only sends pictures. The <li> is the box and holds
                    its own aspect ratio, so the panel measures the same
                    height whether the file has arrived or not. */}
                {point.media && point.media.length > 0 && (
                  <ul className={styles.media} data-count={point.media.length}>
                    {point.media.map((shot) => (
                      <li key={shot.id} className={styles.mediaItem}>
                        {revealed.has(point.id) && (
                          <Image
                            src={shot.src}
                            alt={shot.alt}
                            width={shot.width}
                            height={shot.height}
                            sizes="180px"
                            quality={70}
                            loading="lazy"
                            className={styles.mediaImage}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {(point.meta?.length || point.items?.length) && (
                  <div className={styles.rule} />
                )}

                {point.meta && point.meta.length > 0 && (
                  <dl className={styles.meta}>
                    {point.meta.map((entry) => (
                      <div key={entry.label}>
                        <dt className={styles.metaLabel}>{entry.label}</dt>
                        <dd className={styles.metaValue}>{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {point.items && point.items.length > 0 && (
                  <ul className={styles.items}>
                    {point.items.map((entry) => (
                      <li key={entry.id} className={styles.item}>
                        <span>{entry.label}</span>
                        {entry.note && (
                          <span className={styles.itemNote}>{entry.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The panel's content as one sentence, for the trigger's accessible name. */
function spokenLabel(point: MapPoint): string {
  return [
    point.title,
    point.eyebrow,
    point.description,
    ...(point.meta ?? []).map((entry) => `${entry.label}: ${entry.value}`),
    ...(point.items ?? []).map((entry) =>
      entry.note ? `${entry.label}, ${entry.note}` : entry.label,
    ),
  ]
    .filter(Boolean)
    .join(". ");
}

/* ============================================================================
   The self-contained form
   ========================================================================== */

export function LocationMap({
  image,
  className,
  sizes = "100vw",
  priority = false,
  ...layer
}: LocationMapProps) {
  const fit = image.fit ?? "cover";
  const focalX = image.focalX ?? 50;
  const focalY = image.focalY ?? 50;

  return (
    <figure
      className={clsx(styles.map, className)}
      // The intrinsic ratio, so the box is right before the file arrives and
      // the section never reflows around it.
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        quality={86}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={styles.mapImage}
        // Written from the same object the projection reads, so the painted
        // crop and the pin geometry cannot drift apart.
        style={{ objectFit: fit, objectPosition: `${focalX}% ${focalY}%` }}
      />
      <MapPinLayer {...layer} image={image} />
    </figure>
  );
}

export default LocationMap;
