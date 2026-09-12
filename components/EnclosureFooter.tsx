"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { FinalCtaContent } from "@/lib/content";
import { footerGroups, type NavGroup } from "@/lib/navigation";
import { Logo, LogoMark } from "./Logo";
import Swash from "./Swash";
import styles from "./EnclosureFooter.module.css";

/**
 * The close, as an external shell.
 *
 * ONE COMPONENT, because it is one moment. The brand guide ends on a single
 * line set large and centred (CP_Final p.16), then the three facts that
 * answer "why you", then the action — and a visitor who does not take it
 * needs the map, the address and the legal line. Those used to be a section
 * inside <main> and a footer bolted to the end of it; they are the same
 * gesture, so they are now the same element.
 *
 * WHAT IT DOES: scroll to it and it does not simply arrive. It rises, tips
 * level, opens a rose rim along its lip, and the page above pulls in behind
 * it — inset, rounded, shadowed and veiled, as if the shell had closed around
 * it. Scroll back up and all of it retracts. Nothing is one-way.
 *
 * WHAT DRIVES IT is two IntersectionObservers on this element, and nothing
 * else. No scroll handler, no rAF loop, no GSAP — the observers set
 * attributes on <html> and CSS transitions do the rest on the compositor. See
 * EnclosureFooter.module.css for the state vocabulary: `data-enclose-ready`,
 * `data-enclose-armed`, `data-enclosed`.
 *
 * THEY OBSERVE THE WHOLE SHELL, not its top edge. The negative bottom margin
 * below still sets where the enclosure ENGAGES — the top edge crossing 88% of
 * the viewport — but because the observed box is the entire shell, it stays
 * engaged for as long as any part of it is on screen. Watching the top edge
 * alone meant the shell retracted the moment that edge scrolled out of view,
 * which is somewhere around the action button: the map and the address faded
 * out from under the visitor on their way to them.
 *
 * Nothing here observes something the enclosure moves: the root stays put and
 * only `.panel` inside it travels, so the state cannot feed back into its own
 * trigger.
 *
 * IT MUST BE RENDERED OUTSIDE <main>, as a direct child of <body>, or the
 * shell would be inside the thing it is meant to close around. The element to
 * enclose is marked `data-enclose-page`; PageShell does both.
 *
 * TWO THINGS TO KNOW ABOUT THE ENCLOSED ELEMENT. While enclosed it carries a
 * transform, which makes it the containing block for any `position: fixed`
 * descendant, and `overflow: clip`, which then clips one. Modals, lightboxes
 * and GSAP's fixed-mode pinning must live OUTSIDE it — Lightbox already
 * portals to <body> for exactly this reason.
 *
 * WHAT THE PAGE DELIBERATELY DOES NOT DO IS TILT. A page element is tens of
 * thousands of pixels tall; rotating one about its own edge swings the part
 * you are actually looking at by hundreds of pixels and resamples every line
 * of type on it. The third dimension is carried by the panel instead, which
 * is viewport-sized and hinges on its bottom edge, plus the depth gradient in
 * the veil — the same read, at a fraction of the cost, with the page's type
 * left crisp.
 */

/** Engage when the shell's top edge crosses 88% of the viewport height. */
const ENGAGE_MARGIN = "0px 0px -12% 0px";
/** Arm — promote layers, switch the filter on — about 0.6 of a viewport earlier. */
const ARM_MARGIN = "0px 0px 60% 0px";

export interface EnclosureFooterProps {
  /** The close: the quote, the three proofs, the action and the address. */
  content: FinalCtaContent;
  /** Copyright / RERA line. Passed in, so no clock runs on the client. */
  legal: string;
  /** The site map, grouped. Defaults to the one in lib/navigation.ts. */
  groups?: NavGroup[];
  /**
   * What "Back to top" points at, and what it hands focus to. The landing
   * page names its <main> `#top` (the masthead's brand mark links there);
   * PageShell names it `#main`.
   */
  topHref?: string;
  className?: string;
}

export function EnclosureFooter({
  content,
  legal,
  groups = footerGroups,
  topHref = "#main",
  className,
}: EnclosureFooterProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;

    /* The pre-state is only ever armed from here. Without JS, or on an engine
       with no IntersectionObserver, the attribute is never set and the shell
       renders exactly as it will finally look — visible, in place, focusable.
       Nothing can be stranded hidden by a script that failed to run. */
    if (!root || typeof IntersectionObserver === "undefined") return;

    const set = (name: string, on: boolean) => {
      if (on) html.setAttribute(name, "");
      else html.removeAttribute(name);
    };

    /* First delivery decides whether there is an entrance to play at all. A
       shell already on screen at load (a short page, a restored scroll
       position, a #contact deep link) is handed the landed state in the same
       frame rather than being dropped 56px and animated up into view. */
    let primed = false;

    const engage = new IntersectionObserver(
      ([entry]) => {
        if (!primed) {
          primed = true;
          set("data-enclose-ready", true);
          set("data-enclosed", entry.isIntersecting);
          return;
        }
        set("data-enclosed", entry.isIntersecting);
      },
      { rootMargin: ENGAGE_MARGIN, threshold: 0 },
    );

    const arm = new IntersectionObserver(
      ([entry]) => set("data-enclose-armed", entry.isIntersecting),
      { rootMargin: ARM_MARGIN, threshold: 0 },
    );

    engage.observe(root);
    arm.observe(root);

    return () => {
      engage.disconnect();
      arm.disconnect();
      set("data-enclosed", false);
      set("data-enclose-armed", false);
      set("data-enclose-ready", false);
    };
  }, []);

  /**
   * Back to top. It stays an anchor so it works with JS off and reads as a
   * link to assistive tech; the handler only replaces the jump with a smooth
   * scroll, and honours reduced motion when it does.
   *
   * Focus follows the scroll, which is the point of the control — landing a
   * keyboard visitor back at the top of the page rather than leaving them
   * 12,000px below their own viewport. It is never moved unprompted.
   */
  const onBackToTop = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      event.preventDefault();

      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

      const target =
        document.querySelector<HTMLElement>(topHref) ??
        document.querySelector<HTMLElement>("main");
      if (!target) return;
      if (!target.hasAttribute("tabindex"))
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    },
    [topHref],
  );

  /* One running index down the shell, so the close, the address and the map
     arrive as a single staggered gesture rather than as three components that
     happen to be stacked. */
  const step = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <footer
      ref={rootRef}
      id="contact"
      className={clsx(styles.root, className)}
      aria-labelledby="contact-title"
    >
      <div className={styles.dim} aria-hidden="true" />

      <div className={styles.panel}>
        <div className={styles.rim} aria-hidden="true">
          <span className={styles.handle} />
        </div>

        {/* The mark, turning as the shell lands — the page's last piece of
            motion, and the quietest. */}
        <LogoMark className={styles.watermark} size={286} />

        <div className={`u-shell ${styles.close}`}>
          <h2
            id="contact-title"
            className={`${styles.block} ${styles.quote}`}
            style={step(0)}
          >
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
            <Swash heading={content.quote} />
            <span className={styles.quoteMark} aria-hidden="true">
              &rdquo;
            </span>
          </h2>

          <ul className={styles.proofs}>
            {content.proofs.map((proof, index) => (
              <li
                key={proof.title}
                className={`${styles.block} ${styles.proof}`}
                style={step(index + 1)}
              >
                <h3 className={styles.proofTitle}>{proof.title}</h3>
                <p className={styles.proofBody}>{proof.body}</p>
              </li>
            ))}
          </ul>

          <div className={`${styles.block} ${styles.action}`} style={step(4)}>
            <a className={styles.cta} href={content.primaryCta.href}>
              <span>{content.primaryCta.label}</span>
              <svg
                className={styles.ctaIcon}
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <p className={styles.attribution}>{content.attribution}</p>
          </div>
        </div>

        <div className={`u-shell ${styles.inner}`}>
          <div className={`${styles.block} ${styles.lede}`} style={step(5)}>
            <Logo
              layout="stacked"
              size="clamp(40px, 4.5vw, 52px)"
              withTagline
            />

            <address className={styles.contact}>
              <a
                className={styles.email}
                href={`mailto:${content.contact.email}`}
              >
                {content.contact.email}
              </a>
              {content.contact.addressLines.map((line) => (
                <span key={line} className={styles.addressLine}>
                  {line}
                </span>
              ))}
            </address>
          </div>

          <nav className={styles.map} aria-label="Site map">
            {groups.map((group, index) => (
              <div
                key={group.label}
                className={`${styles.block} ${styles.group}`}
                style={step(index + 6)}
              >
                <h3 className={`u-label ${styles.groupLabel}`}>{group.label}</h3>
                <ul className={styles.list}>
                  {group.links.map((link) => {
                    const current = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          className={clsx(
                            styles.link,
                            current && styles.isCurrent,
                          )}
                          href={link.href}
                          aria-current={current ? "page" : undefined}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={`u-shell ${styles.base}`}>
          <p className={styles.legal}>{legal}</p>

          <a className={styles.toTop} href={topHref} onClick={onBackToTop}>
            <span>Back to top</span>
            <svg
              className={styles.toTopIcon}
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default EnclosureFooter;
