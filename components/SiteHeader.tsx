"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Cta, NavLink } from "@/lib/content";
import { usePopover } from "@/lib/usePopover";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

/**
 * Fixed masthead — an island.
 *
 * AT REST IT IS A SMALL PILL OF INK at the top of the window, the way the
 * island sits at the top of a phone: the mark, the wordmark, and a two-bar
 * glyph that says there is more inside. A rose hairline along its foot fills
 * with the page's scroll.
 *
 * IT OPENS WHEN IT IS POINTED AT (tapped, on a touch screen; Enter, from the
 * keyboard). The pill springs out into the full masthead — on a desktop a
 * row of the lockup, the pages and Contact; on a phone a card of the pages
 * set large. The lockup never fades: it rides the island's left edge out and
 * back, so the pill and the masthead read as one object changing shape, not
 * two swapped. Everything else arrives out of a blur, in order, while the
 * island is still growing, and leaves before it shrinks.
 *
 * ON ARRIVAL — once per page load, not on every client-side navigation — it
 * shows the visitor how it behaves: it appears as a dot and stretches into the
 * pill; on a pointer device it then opens once on its own and closes again;
 * and a small caption under it ("Hover to open the menu", or "Tap…") holds
 * for a few seconds while the island pulses. Pointing at it, or tabbing into
 * it, ends the sequence at once. Under reduced motion there is no dot and no
 * peek: the caption simply fades in and out.
 *
 * WHY WIDTH AND HEIGHT ARE ANIMATED. The island's own box is the only thing
 * that changes size. Everything inside it is absolutely positioned at its
 * final, measured size (`--open-w` / `--open-h`, written by a ResizeObserver)
 * and merely clipped, so no frame of the morph reflows any text; the header
 * is a size container, so no frame reflows anything outside it either. The
 * springs are real damped-spring curves sampled into `linear()` — see the
 * stylesheet.
 *
 * `resolve` still collapses a root-relative anchor ("/#team") to a bare hash
 * on the landing page, should one ever be put back in the nav, and the link
 * for the current route carries `aria-current="page"`.
 */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The arrival plays once per page load. The masthead remounts on every
 *  client-side navigation, and module scope outlives that — so this is
 *  exactly "once each time the site is opened". */
let introPlayed = false;

/** Hover intent, in ms: how long the pointer rests before the island opens,
 *  and how long it may stray outside before the island closes. The second is
 *  what lets a cursor overshoot an edge without the menu snapping shut. */
const OPEN_DELAY = 60;
const CLOSE_DELAY = 280;

/**
 * "dot"     — first paint of a first load: a circle, its contents hidden.
 * "stretch" — the circle springs out into the pill and its contents arrive.
 * "rest"    — every state after that.
 */
type Phase = "dot" | "stretch" | "rest";

type Hint = { on: boolean; mode: "hover" | "tap" };

export function SiteHeader({ links, cta }: { links: NavLink[]; cta: Cta }) {
  const pathname = usePathname();
  // Destructured, so reading `open` during render is not read as reaching
  // into the refs that travel in the same object.
  const {
    open,
    show,
    toggle,
    close,
    groupRef: islandRef,
    triggerRef,
  } = usePopover<HTMLDivElement, HTMLButtonElement>();

  const headerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimer = useRef(0);
  const introTimers = useRef<number[]>([]);

  const [arriving] = useState(() => !introPlayed);
  const [phase, setPhase] = useState<Phase>(arriving ? "dot" : "rest");
  const [hint, setHint] = useState<Hint>({ on: false, mode: "hover" });
  const [indicator, setIndicator] = useState<{
    x: number;
    w: number;
    on: boolean;
  }>({ x: 0, w: 0, on: false });

  /**
   * A root-relative anchor becomes a same-page anchor on the landing page,
   * which is the only place those sections exist. Everywhere else it stays a
   * link, so it navigates home and then scrolls.
   */
  const resolve = (href: string) =>
    href.startsWith("/#") && pathname === "/" ? href.slice(1) : href;

  /** True for the route this link points at, or any route beneath it. Hash
   *  links are never "current". */
  const isCurrent = useCallback(
    (href: string) =>
      !href.includes("#") &&
      href !== "/" &&
      (pathname === href || pathname.startsWith(`${href}/`)),
    [pathname],
  );

  const currentIndex = links.findIndex((link) => isCurrent(link.href));

  /** Slide the indicator under link `index`, or rest it on the current route
   *  (or nowhere) when `index` is -1. */
  const moveTo = useCallback(
    (index: number) => {
      const target = index >= 0 ? index : currentIndex;
      const el = target >= 0 ? linkRefs.current[target] : null;
      if (!el) {
        setIndicator((prev) => ({ ...prev, on: false }));
        return;
      }
      setIndicator({ x: el.offsetLeft, w: el.offsetWidth, on: true });
    },
    [currentIndex],
  );

  // Rest on the current route on arrival, on every route change, on resize,
  // and once the display face has loaded and the labels have their real width.
  useIsoLayoutEffect(() => {
    moveTo(-1);
    const onResize = () => moveTo(-1);
    window.addEventListener("resize", onResize);
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) moveTo(-1);
    });
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
    };
  }, [moveTo]);

  /**
   * The island's two sizes. The open size is the content's own — it is laid
   * out at full size the whole time, only clipped — and the closed width is
   * wherever the lockup ends, plus one pill-height for the glyph's square.
   * Written as custom properties on the header, imperatively, so a resize or
   * a late font never re-renders it. `data-ready` releases the arrival, which
   * would otherwise start from a guessed width.
   */
  useIsoLayoutEffect(() => {
    const header = headerRef.current;
    const content = contentRef.current;
    const brand = brandRef.current;
    if (!header || !content || !brand) return;

    const measure = () => {
      header.style.setProperty("--open-w", `${content.offsetWidth}px`);
      header.style.setProperty("--open-h", `${content.offsetHeight}px`);
      header.style.setProperty(
        "--brand-end",
        `${brand.offsetLeft + brand.offsetWidth}px`,
      );
    };
    measure();
    header.dataset.ready = "";

    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(brand);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Plain scroll listener rather than a ScrollTrigger: this needs to work
    // under reduced motion too, where no GSAP context is created. The progress
    // is written as a custom property on the header, once a frame at most, so
    // scrolling never re-renders the masthead.
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      headerRef.current?.style.setProperty("--progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /**
   * The arrival. Timed rather than chained off transitionend: every step is
   * cancellable by `endIntro` in one place, and a step that never fires (a
   * backgrounded tab) cannot strand the island half-way.
   */
  useEffect(() => {
    if (!arriving) return;
    introPlayed = true;

    const timers = introTimers.current;
    const at = (ms: number, step: () => void) => {
      timers.push(window.setTimeout(step, ms));
    };
    const moving = document.documentElement.classList.contains("motion-on");
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    let t = 0;
    if (moving) {
      at((t += 380), () => setPhase("stretch"));
      at((t += 900), () => setPhase("rest"));
      if (canHover) {
        // The peek: it opens once on its own, so the first thing a visitor
        // learns about the island is that it opens.
        at((t += 200), show);
        at((t += 1700), () => close(false));
        t += 560;
      } else {
        t += 150;
      }
    } else {
      at(0, () => setPhase("rest"));
      t = 600;
    }
    at(t, () => setHint({ on: true, mode: canHover ? "hover" : "tap" }));
    at(t + 5200, () => setHint((prev) => ({ ...prev, on: false })));

    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, [arriving, show, close]);

  /** The visitor has found the island on their own: stop teaching it. */
  const endIntro = useCallback(() => {
    const timers = introTimers.current;
    if (!timers.length) return;
    timers.forEach(clearTimeout);
    timers.length = 0;
    setPhase("rest");
    setHint((prev) => (prev.on ? { ...prev, on: false } : prev));
  }, []);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const onPointerEnter = (event: ReactPointerEvent) => {
    // A tap fires pointerenter too; touch opens on the click instead.
    if (event.pointerType === "touch") return;
    endIntro();
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(show, OPEN_DELAY);
  };

  const onPointerLeave = (event: ReactPointerEvent) => {
    if (event.pointerType === "touch") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      // Someone tabbing through the open island keeps it open, wherever the
      // mouse happens to wander.
      const active = document.activeElement;
      if (
        active &&
        islandRef.current?.contains(active) &&
        active.matches(":focus-visible")
      ) {
        return;
      }
      close(false);
    }, CLOSE_DELAY);
  };

  const dismiss = () => close(false);

  return (
    <header
      ref={headerRef}
      className={styles.header}
      data-open={open || undefined}
      data-phase={phase}
      data-hint={hint.on || undefined}
    >
      <div className={styles.dock}>
        <div
          ref={islandRef}
          className={styles.island}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={endIntro}
        >
          {/* Over the whole island while it is closed, so a tap anywhere on
              it opens it; when open it lets every pointer through except on
              a phone's close glyph. Its focus ring is the island's edge. */}
          <button
            ref={triggerRef}
            type="button"
            className={styles.trigger}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => {
              endIntro();
              toggle();
            }}
          >
            <span className={styles.glyph} aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="u-visually-hidden">Menu</span>
          </button>

          <div
            ref={contentRef}
            id="site-menu"
            className={styles.content}
            inert={!open}
          >
            <Link
              ref={brandRef}
              href={resolve("/#top")}
              className={styles.brand}
              aria-label="Vakratunda, home"
              onClick={dismiss}
            >
              <Logo size="1.625rem" markClassName={styles.brandMark} />
            </Link>

            {/* The row — desktop. */}
            <nav className={styles.nav} aria-label="Main">
              <div
                ref={trackRef}
                className={styles.track}
                onMouseLeave={() => moveTo(-1)}
                onBlur={(event) => {
                  if (!trackRef.current?.contains(event.relatedTarget as Node)) {
                    moveTo(-1);
                  }
                }}
              >
                {/* The indicator is a sibling of the list, not an item in it,
                    and the track is the links' offset parent — so a link's
                    offsetLeft is exactly where the indicator has to stand. */}
                <span
                  className={styles.indicator}
                  aria-hidden="true"
                  data-on={indicator.on}
                  style={{
                    transform: `translateX(${indicator.x}px)`,
                    width: indicator.w,
                  }}
                />
                <ul className={styles.list}>
                  {links.map((link, index) => (
                    <li
                      key={link.href}
                      className={styles.reveal}
                      style={{ "--i": index } as CSSProperties}
                    >
                      <Link
                        ref={(el) => {
                          linkRefs.current[index] = el;
                        }}
                        className={clsx(
                          styles.link,
                          isCurrent(link.href) && styles.isCurrent,
                        )}
                        href={resolve(link.href)}
                        aria-current={isCurrent(link.href) ? "page" : undefined}
                        onMouseEnter={() => moveTo(index)}
                        onFocus={() => moveTo(index)}
                        onClick={dismiss}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* The slot reveals; the pill keeps its own hover transitions. */}
            <div
              className={clsx(styles.ctaSlot, styles.reveal)}
              style={{ "--i": links.length } as CSSProperties}
            >
              <Link
                className={styles.cta}
                href={resolve(cta.href)}
                onClick={dismiss}
              >
                <span>{cta.label}</span>
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
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* The card — phone. */}
            <nav className={styles.sheet} aria-label="Main">
              <ul className={styles.sheetList}>
                {links.map((link, index) => (
                  <li
                    key={link.href}
                    className={styles.reveal}
                    style={{ "--i": index } as CSSProperties}
                  >
                    <Link
                      className={clsx(
                        styles.sheetLink,
                        isCurrent(link.href) && styles.isCurrent,
                      )}
                      href={resolve(link.href)}
                      aria-current={isCurrent(link.href) ? "page" : undefined}
                      onClick={dismiss}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                className={clsx(styles.sheetCta, styles.reveal)}
                style={{ "--i": links.length } as CSSProperties}
                href={resolve(cta.href)}
                onClick={dismiss}
              >
                {cta.label}
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </nav>
          </div>

          {/* The page's scroll, as a rose hairline along the pill's foot. */}
          <span className={styles.progress} aria-hidden="true" />
        </div>

        {/* The arrival's caption. Decorative to assistive tech, which already
            has the button's name and its expanded state. */}
        <span className={styles.hint} aria-hidden="true">
          <span className={styles.hintIcon} data-mode={hint.mode}>
            {hint.mode === "hover" ? (
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              >
                <path d="M5.5 3.5 18.5 10l-5.6 1.9-2.4 5.6z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="12" cy="12" r="3.25" fill="currentColor" />
                <circle cx="12" cy="12" r="8" opacity="0.45" />
              </svg>
            )}
          </span>
          {hint.mode === "hover" ? "Hover to open the menu" : "Tap to open the menu"}
        </span>
      </div>
    </header>
  );
}

export default SiteHeader;
