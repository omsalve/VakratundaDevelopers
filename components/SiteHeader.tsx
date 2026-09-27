"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Cta, NavLink } from "@/lib/content";
import { usePopover } from "@/lib/usePopover";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

/**
 * Fixed masthead — a floating capsule of glass.
 *
 * IT TAKES ITS COLOUR FROM WHAT IS BEHIND IT. The ground under the capsule
 * is sampled as the page scrolls (see the probe effect below) and the glass
 * becomes that ground at about two-thirds opacity: navy glass with cream type
 * over the navy sections and the photograph, cream glass with navy type over
 * the cream ones, fading between the two as a change of ground passes under
 * it. Its type therefore always has the contrast of the page it is on, and
 * the capsule never reads as a bar of the wrong colour laid across a section.
 *
 * WHAT IS IN IT:
 *   · the lockup, whose mark turns — slowly — on hover;
 *   · the pages, with a rose-washed indicator that slides to whichever link is
 *     being pointed at and rests on the route the visitor is on;
 *   · the one action, Contact, as a solid rose pill with its own arrow;
 *   · a rose hairline along the capsule's foot that fills with the page's
 *     scroll — a quiet "how far through this am I" on long pages.
 *
 * `resolve` still collapses a root-relative anchor ("/#team") to a bare hash
 * on the landing page, should one ever be put back in the nav, and the link
 * for the current route carries `aria-current="page"`.
 */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Rgba = [number, number, number, number];

/** "rgb(r, g, b)" / "rgba(r, g, b, a)" → [r, g, b, a]. Anything else — a
 *  wide-gamut `color(…)` from a color-mix, say — is treated as unreadable
 *  and skipped rather than guessed at. */
function parseColor(value: string): Rgba | null {
  if (!value.startsWith("rgb")) return null;
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  const [r, g, b, a = "1"] = parts;
  return [Number(r), Number(g), Number(b), Number(a)];
}

/** An element's opacity as painted: its own times every ancestor's. */
function paintedOpacity(el: Element): number {
  let opacity = 1;
  for (let node: Element | null = el; node; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity) || 0;
    if (opacity < 0.5) break;
  }
  return opacity;
}

/** The first solid ground under a point, skipping the masthead itself,
 *  photographs and gradients (whose colour is not in `background-color`)
 *  and anything faded out. */
function groundAt(header: HTMLElement, x: number, y: number): Rgba | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (header.contains(el)) continue;
    const color = parseColor(getComputedStyle(el).backgroundColor);
    if (!color || color[3] < 0.5) continue;
    if (paintedOpacity(el) < 0.5) continue;
    return color;
  }
  return null;
}

/** Relative luminance, 0 (black) to 1 (white). */
function luminance([r, g, b]: Rgba): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** The glass is the ground, pulled a little toward the palette's own ground
 *  — navy-900 on a dark page, cream-100 on a light one — so the capsule
 *  still reads as an object over a plain field of the same colour. */
const DEEP: Rgba = [12, 18, 48, 1];
const PALE: Rgba = [253, 252, 250, 1];

/** Milliseconds between samples while the page is scrolling. */
const PROBE_EVERY = 120;

export function SiteHeader({ links, cta }: { links: NavLink[]; cta: Cta }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Destructured, so reading `open` during render is not read as reaching
  // into the refs that travel in the same object.
  const {
    open: menuOpen,
    toggle: toggleMenu,
    close: closeMenu,
    groupRef: menuGroupRef,
    triggerRef: menuTriggerRef,
  } = usePopover<HTMLDivElement, HTMLButtonElement>();

  const headerRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
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

  useEffect(() => {
    // Plain scroll listener rather than a ScrollTrigger: this needs to work
    // under reduced motion too, where no GSAP context is created. The progress
    // is written as a custom property on the header, once a frame at most, so
    // scrolling never re-renders the masthead.
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
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
   * The ground under the capsule, sampled at three points along it and
   * written as `--ground` and `data-tone` — see the stylesheet. Imperative,
   * like the progress above, so scrolling never re-renders the masthead.
   *
   * Sampled while scrolling at most every PROBE_EVERY ms, and twice more once
   * it stops: the scrubbed scenes on the landing page (the arcs, the pinned
   * stages) keep easing for a moment after the last scroll event, and the
   * ground can still change under a header that has stopped moving.
   */
  useEffect(() => {
    const header = headerRef.current;
    const bar = header?.firstElementChild as HTMLElement | null;
    if (!header || !bar) return;

    let last = 0;
    let frame = 0;
    const timers: number[] = [];

    const probe = () => {
      frame = 0;
      last = performance.now();
      const rect = bar.getBoundingClientRect();
      if (!rect.width) return;
      const y = rect.top + rect.height / 2;
      const xs = [0.12, 0.5, 0.88].map((f) => rect.left + rect.width * f);

      const root = document.documentElement;
      root.classList.add("header-probe");
      let samples: Rgba[];
      try {
        samples = xs
          .map((x) => groundAt(header, x, y))
          .filter((c): c is Rgba => c !== null);
      } finally {
        root.classList.remove("header-probe");
      }
      if (!samples.length) return;

      const avg = (i: number) =>
        samples.reduce((sum, c) => sum + c[i], 0) / samples.length;
      const mean: Rgba = [avg(0), avg(1), avg(2), 1];
      const light = luminance(mean) > 0.4;
      const toward = light ? PALE : DEEP;
      const pull = light ? 0.4 : 0.3;
      const glass = [0, 1, 2].map((i) =>
        Math.round(mean[i] + (toward[i] - mean[i]) * pull),
      );

      header.style.setProperty("--ground", glass.join(" "));
      header.dataset.tone = light ? "light" : "dark";
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    const onScroll = () => {
      if (performance.now() - last >= PROBE_EVERY) schedule();
      timers.forEach(clearTimeout);
      timers.length = 0;
      timers.push(
        window.setTimeout(schedule, 160),
        window.setTimeout(schedule, 800),
      );
    };

    // After the new route has painted, and again once its scenes settle.
    schedule();
    timers.push(window.setTimeout(schedule, 400));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      className={clsx(styles.header, scrolled && styles.isScrolled)}
    >
      <div className={styles.bar}>
        <Link
          href={resolve("/#top")}
          className={styles.brand}
          aria-label="Vakratunda, home"
        >
          <Logo
            size="clamp(2.125rem, 4.4vw, 2.625rem)"
            markClassName={styles.brandMark}
          />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <div
            ref={listRef}
            className={styles.track}
            onMouseLeave={() => moveTo(-1)}
            onBlur={(event) => {
              if (!listRef.current?.contains(event.relatedTarget as Node)) {
                moveTo(-1);
              }
            }}
          >
            {/* The indicator is a sibling of the list, not an item in it, and
                the track is the links' offset parent — so a link's
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
                <li key={link.href}>
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
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <Link className={styles.cta} href={resolve(cta.href)}>
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

        <div ref={menuGroupRef} className={styles.mobile}>
          <button
            ref={menuTriggerRef}
            type="button"
            className={styles.toggle}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={toggleMenu}
          >
            <span className={styles.toggleLabel} aria-hidden="true">
              {menuOpen ? "Close" : "Menu"}
            </span>
            <span className={styles.toggleBars} aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="u-visually-hidden">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
          </button>

          <div id="site-menu" className={styles.panel} hidden={!menuOpen}>
            <ul className={styles.panelList}>
              {links.map((link, index) => (
                <li
                  key={link.href}
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <Link
                    className={clsx(
                      styles.panelLink,
                      isCurrent(link.href) && styles.isCurrent,
                    )}
                    href={resolve(link.href)}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    onClick={() => closeMenu(false)}
                  >
                    <span className={`u-numeral ${styles.panelIndex}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.panelLabel}>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              className={styles.panelCta}
              href={resolve(cta.href)}
              onClick={() => closeMenu(false)}
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
          </div>
        </div>

        {/* The page's scroll, as a rose hairline along the capsule's foot. */}
        <span className={styles.progress} aria-hidden="true" />
      </div>
    </header>
  );
}

export default SiteHeader;
