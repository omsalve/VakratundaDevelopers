"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Cta, NavLink } from "@/lib/content";
import { usePopover } from "@/lib/usePopover";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

/**
 * Fixed masthead. Transparent over the hero so the opening viewport stays
 * whole, then it picks up a navy plate once the hero has passed.
 *
 * Not in the original section list, but a marketing page without a way to
 * reach the contact block from the first screen is unfinished.
 *
 * IT SERVES FOUR ROUTES NOW, so it does two things the single-page version
 * did not have to. `resolve` collapses a root-relative anchor ("/#team") back
 * to a bare hash while the visitor is already on the landing page, so those
 * links still scroll there instead of reloading it. And the link for the
 * route the visitor is on carries `aria-current="page"` — a masthead with
 * four destinations and no indication of which one you are looking at is a
 * map with no "you are here".
 */

export function SiteHeader({ links, cta }: { links: NavLink[]; cta: Cta }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menu = usePopover<HTMLDivElement, HTMLButtonElement>();

  /**
   * A root-relative anchor becomes a same-page anchor on the landing page,
   * which is the only place those sections exist. Everywhere else it stays a
   * link, so it navigates home and then scrolls.
   */
  const resolve = (href: string) =>
    href.startsWith("/#") && pathname === "/" ? href.slice(1) : href;

  /** True for the route this link points at — hash links are never "current". */
  const isCurrent = (href: string) =>
    !href.includes("#") && pathname === href;

  useEffect(() => {
    // Plain scroll listener rather than a ScrollTrigger: this needs to work
    // under reduced motion too, where no GSAP context is created.
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={clsx(styles.header, scrolled && styles.isScrolled)}>
      <div className={styles.inner}>
        <Link
          href={resolve("/#top")}
          className={styles.brand}
          aria-label="Vakratunda, home"
        >
          {/* Sized from CSS, not from a pixel count: 40px of mark on a phone,
              48px from about a tablet up. The wordmark is measured against it,
              so one value moves the whole lockup. */}
          <Logo
            size="clamp(2.5rem, 5.2vw, 3rem)"
            markClassName={styles.brandMark}
          />
        </Link>

        <nav className={styles.nav} aria-label="Sections">
          <ul className={styles.list}>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className={clsx(
                    styles.link,
                    isCurrent(link.href) && styles.isCurrent,
                  )}
                  href={resolve(link.href)}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className={styles.cta} href={resolve(cta.href)}>
          {cta.label}
        </Link>

        <div ref={menu.groupRef} className={styles.mobile}>
          <button
            ref={menu.triggerRef}
            type="button"
            className={styles.toggle}
            aria-expanded={menu.open}
            aria-controls="site-menu"
            onClick={menu.toggle}
          >
            <span className={styles.toggleBars} aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="u-visually-hidden">
              {menu.open ? "Close menu" : "Open menu"}
            </span>
          </button>

          <div id="site-menu" className={styles.panel} hidden={!menu.open}>
            <ul className={styles.panelList}>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className={clsx(
                      styles.panelLink,
                      isCurrent(link.href) && styles.isCurrent,
                    )}
                    href={resolve(link.href)}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    onClick={() => menu.close(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className={clsx(styles.panelLink, styles.panelCta)}
                  href={resolve(cta.href)}
                  onClick={() => menu.close(false)}
                >
                  {cta.label}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
