"use client";

import { useRef } from "react";
import type { CardItem, Stat, StoryContent } from "@/lib/pages";
import type { Cta, SwashHeading } from "@/lib/content";
import {
  countUp,
  gsap,
  maskReveal,
  revealOnEnter,
  useGsapScope,
} from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./HospitalityCorridor.module.css";

/**
 * /hospitality — the practice, then the spaces, then the record.
 *
 * THE SIGNATURE IS A CORRIDOR. The four things a podium can only offer if they
 * were in its blueprint travel SIDEWAYS while the page is scrolled down — the
 * stage is held still and the spaces pass through it, which is what walking a
 * service corridor actually is. It is the only section on the site whose
 * content moves horizontally under the reader's own scrolling; /projects has a
 * strip that leafs sideways, but that is decoration behind a masthead and
 * every frame in it is repeated as a real card below.
 *
 * IT IS BUILT ON `position: sticky`, NOT ON ScrollTrigger's pin. A pin puts
 * the stage into `position: fixed`, and this section lives inside
 * <main data-enclose-page>, which carries a transform while the footer closes
 * around it — a transformed ancestor becomes the containing block for a fixed
 * descendant and then clips it. PageShell says so at the element itself. Sticky
 * needs no such workaround: `overflow: clip` creates no scroll container, so
 * the stage resolves against the page scroll exactly as it should.
 *
 * THE RUNWAY IS MEASURED, NOT GUESSED. The travel is the track's real overflow,
 * read on every refresh, so the corridor comes to rest on its last space at any
 * viewport width and with any number of spaces. A hard-coded percentage would
 * stop short on a wide screen and overrun on a narrow one.
 *
 * BELOW 62rem IT IS NOT A CORRIDOR AT ALL. The spaces stack and the runway
 * collapses — a horizontal track on a phone fights the browser's own gesture
 * for going back, and a section that hijacks a scroll on a touch device is a
 * section that traps somebody. The content is identical; only the figure goes.
 *
 * THE STORY BAND CARRIES NO PHOTOGRAPH: the page's one picture is spent on the
 * hero. See the note there.
 */

export function HospitalityCorridor({
  story,
  offer,
  stats,
  coda,
  cta,
}: {
  story: StoryContent;
  offer: {
    label: string;
    heading: SwashHeading;
    standfirst: string;
    items: CardItem[];
  };
  stats: Stat[];
  coda: string;
  cta?: Cta;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.storyHead} > [data-reveal]`, rootEl, {
      stagger: 0.09,
    });
    revealOnEnter(`.${styles.para}`, rootEl, {
      start: "top 86%",
      stagger: 0.1,
    });

    const quote = rootEl.querySelector(`.${styles.quote}`);
    if (quote) {
      maskReveal(`.${styles.quoteText}`, quote, {
        from: "left",
        duration: 1.3,
        start: "top 84%",
      });
    }

    revealOnEnter(`.${styles.offerHead} > [data-reveal]`, rootEl, {
      start: "top 84%",
      stagger: 0.09,
    });

    /* The corridor. Only where there is room for one — below 62rem the spaces
       stack and there is no runway to travel along. Matching the breakpoint in
       the stylesheet here is deliberate: the layout and the motion have to
       agree about whether a corridor exists at all. */
    const wide = window.matchMedia("(min-width: 62rem)");
    if (wide.matches) {
      const track = rootEl.querySelector<HTMLElement>(`.${styles.track}`);
      const stage = rootEl.querySelector<HTMLElement>(`.${styles.stage}`);
      const runway = rootEl.querySelector<HTMLElement>(`.${styles.runway}`);

      if (track && stage && runway) {
        /* THE SPACES HAVE TO BE REVEALED HERE TOO. Every `[data-reveal]` on the
           site starts at opacity 0 and is shown by a trigger of its own — but a
           card that is off to the RIGHT of a held stage never enters the
           viewport from below, so a per-element trigger would never fire and
           the whole corridor would read as empty. They come in together,
           against the runway, as the stage takes the screen. */
        revealOnEnter(`.${styles.space}`, runway, {
          start: "top 72%",
          stagger: 0.08,
        });

        gsap.to(track, {
          x: () => -Math.max(0, track.scrollWidth - stage.clientWidth),
          ease: "none",
          scrollTrigger: {
            trigger: runway,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
      }
    } else {
      revealOnEnter(`.${styles.space}`, rootEl, {
        start: "top 86%",
        stagger: 0.08,
      });
    }

    maskReveal(`.${styles.closeRule}`, rootEl, {
      from: "left",
      duration: 1.1,
      start: "top 90%",
    });
    revealOnEnter(`.${styles.stat} > [data-reveal]`, rootEl, {
      start: "top 90%",
      stagger: 0.07,
    });
    revealOnEnter(`.${styles.codaRow} > [data-reveal]`, rootEl, {
      start: "top 92%",
      stagger: 0.1,
    });

    for (const el of rootEl.querySelectorAll<HTMLElement>(`.${styles.value}`)) {
      countUp(el, { duration: 1.6 });
    }
  }, [offer.items.length, stats.length]);

  return (
    <section ref={root}>
      {/* ---- The practice ---- */}
      <div className={styles.story} aria-labelledby="practice-title">
        <div className={`u-shell ${styles.storyInner}`}>
          <div className={styles.storyHead}>
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {story.label}
            </p>
            <h2 id="practice-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
              <Swash heading={story.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {story.standfirst}
            </p>
          </div>

          {/* Two columns of prose — no photograph. See the note above. */}
          <div className={styles.prose}>
            {story.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className={styles.para} data-reveal="up">
                {paragraph}
              </p>
            ))}
          </div>

          <blockquote className={styles.quote}>
            <p className={styles.quoteText}>{story.pullquote}</p>
          </blockquote>
        </div>
      </div>

      {/* ---- The corridor ---- */}
      <div
        className={styles.runway}
        aria-labelledby="offer-title"
        /* The runway's length is derived from how many spaces there are, so a
           fifth added in /admin buys itself the scroll it needs instead of
           being dragged past in the same distance as four. */
        style={{ "--spaces": offer.items.length } as React.CSSProperties}
      >
        <div className={styles.stage}>
          <div className={`u-shell ${styles.offerHead}`}>
            <p className={`u-label ${styles.label}`} data-reveal="up">
              {offer.label}
            </p>
            <h2 id="offer-title" className={`u-h2 ${styles.heading}`} data-reveal="up">
              <Swash heading={offer.heading} />
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {offer.standfirst}
            </p>
          </div>

          <ol className={styles.track}>
            {offer.items.map((item, index) => (
              <li key={item.id} className={styles.space} data-reveal="up">
                <span className={`p-numeral ${styles.spaceNumber}`} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {item.eyebrow ? (
                  <p className={`u-label ${styles.spaceEyebrow}`}>{item.eyebrow}</p>
                ) : null}

                <h3 className={`u-h3 ${styles.spaceTitle}`}>{item.title}</h3>
                <p className={styles.spaceBody}>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ---- The record ---- */}
      <div className={`on-cream ${styles.close}`}>
        <div className={`u-shell ${styles.closeInner}`}>
          <dl className={styles.stats}>
            <span className={styles.closeRule} aria-hidden="true" />

            {stats.map((stat) => (
              <div key={stat.id} className={styles.stat}>
                <dd className={styles.statValue} data-reveal="up">
                  <span className={`p-numeral ${styles.value}`}>{stat.value}</span>
                  {stat.suffix ? (
                    <span className={styles.suffix}>{stat.suffix}</span>
                  ) : null}
                  {stat.unit ? (
                    <span className={styles.unit}>{stat.unit}</span>
                  ) : null}
                </dd>
                <dt className={styles.statNote} data-reveal="up">
                  {stat.note}
                </dt>
              </div>
            ))}
          </dl>

          <div className={styles.codaRow}>
            <p className={styles.coda} data-reveal="up">
              {coda}
            </p>

            {cta ? (
              <p data-reveal="up">
                <a className={styles.cta} href={cta.href}>
                  <span>{cta.label}</span>
                  <svg
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
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HospitalityCorridor;
