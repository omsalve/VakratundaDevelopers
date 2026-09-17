"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import type { PageHeroContent } from "@/lib/pages";
import type { ProjectSlide, ProjectStatus } from "@/lib/content";
import { gsap, maskReveal, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ProjectsIndexHero.module.css";

const STAGES: ProjectStatus[] = ["Completed", "Ongoing", "Upcoming"];

/**
 * /projects — the masthead of a catalogue.
 *
 * WHAT THIS REPLACES. The standard navy `PageHero`: a screen of empty ground
 * with a headline centred in it, then the work a scroll below. On a portfolio
 * that is the wrong opening — a catalogue is judged on how fast it shows you
 * what is in it, and a full screen of nothing is a page asking to be trusted
 * before it has shown anything.
 *
 * SO THE FIRST SCREEN IS THE CONTENTS. Cream from the top edge (identity.css
 * lights this page), the title ranged left, and beside it the tally: how many
 * addresses are delivered, how many are rising, how many are coming, drawn as
 * proportional rules. The tally is not decoration — it is the single most
 * useful fact on the page and it is above the fold.
 *
 * THEN THE CONTACT SHEET. Every project at thumbnail size, edge to edge,
 * TRAVELLING SIDEWAYS AS THE PAGE SCROLLS DOWN. One gesture, and it does three
 * things: it proves the portfolio is deep before a single card is read, it
 * gives the page a horizontal axis that no other page on the site has, and it
 * turns the act of scrolling into the act of leafing through.
 *
 * IT IS DECORATION AND IS MARKED AS SUCH. Every photograph in the strip is
 * repeated as a real, readable card below, so the strip carries `aria-hidden`
 * and adds nothing to the reading order — a screen reader meets each project
 * once, in the field, where it has a name and a status.
 */

export function ProjectsIndexHero({
  content,
  slides,
}: {
  content: PageHeroContent;
  slides: ProjectSlide[];
}) {
  const root = useRef<HTMLElement | null>(null);

  const tally = useMemo(
    () =>
      STAGES.map((status) => ({
        status,
        count: slides.filter((slide) => slide.status === status).length,
      })).filter((row) => row.count > 0),
    [slides],
  );

  const most = Math.max(1, ...tally.map((row) => row.count));

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "expo.out",
      stagger: 0.08,
    });

    // The tally rules extend to their share of the widest. `power1.out`
    // because a bar is an area: see the note in lib/arc.ts.
    gsap.fromTo(
      `.${styles.tallyBar}`,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.3,
        ease: "power1.out",
        stagger: 0.1,
        delay: 0.35,
      },
    );

    gsap.to(`.${styles.tallyRow}`, {
      opacity: 1,
      duration: 0.8,
      ease: "expo.out",
      stagger: 0.1,
      delay: 0.3,
    });

    maskReveal(`.${styles.sheet}`, rootEl, { from: "left", duration: 1.4, delay: 0.4 });

    /* The sheet leafs sideways as the page scrolls down. The travel is the
       strip's actual overflow, measured on refresh rather than guessed at, so
       it comes to rest exactly on its last frame at every viewport width and
       with any number of projects — a hard-coded percentage would either stop
       short or run past the end. */
    const track = rootEl.querySelector<HTMLElement>(`.${styles.track}`);
    const sheet = rootEl.querySelector<HTMLElement>(`.${styles.sheet}`);
    if (!track || !sheet) return;

    gsap.to(track, {
      x: () => -Math.max(0, track.scrollWidth - sheet.clientWidth),
      ease: "none",
      scrollTrigger: {
        trigger: rootEl,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  }, [slides.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.masthead}`}>
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>

          <h1 id="page-title" className={`u-display ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h1>

          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>
        </div>

        {/* The tally. A <dl> because each row is a term and its figure. */}
        <dl className={styles.tally}>
          {tally.map((row) => (
            <div key={row.status} className={styles.tallyRow}>
              <dt className={`u-label ${styles.tallyTerm}`}>{row.status}</dt>
              <dd className={styles.tallyValue}>
                <span className={`p-numeral ${styles.tallyCount}`}>
                  {row.count}
                </span>
                <span
                  className={styles.tallyBar}
                  style={{ "--share": row.count / most } as React.CSSProperties}
                  aria-hidden="true"
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The contact sheet. Decorative — every frame is a real card below. */}
      <div className={styles.sheet} aria-hidden="true">
        <div className={styles.track}>
          {slides.map((slide) => (
            <span key={slide.id} className={styles.thumb}>
              <Image
                src={slide.image.src}
                alt=""
                width={slide.image.width}
                height={slide.image.height}
                sizes="20vw"
                quality={55}
                className={styles.thumbImage}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsIndexHero;
