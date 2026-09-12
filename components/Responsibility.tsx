"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ResponsibilityContent } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import PageLink from "./PageLink";
import ResponsibilityIcons from "./ResponsibilityIcons";
import Swash from "./Swash";
import styles from "./Responsibility.module.css";

/**
 * What the group owes — the community it builds among, and the ground it
 * builds on — as two bands of deliberately unequal weight.
 *
 * THE PROPORTION IS THE POINT. The section used to divide one field down the
 * middle, and the environment half was the wider of the two. That said the
 * practices outweighed the schools. They do not, so the division is now made
 * across the field instead of down it: the community band takes the section,
 * and the environment band is a footing under it — four drawings in two
 * pairs, a fifth of the whole. Nothing was cut to get there; the same two
 * schools and the same four commitments are all still here.
 *
 * ONE SCHOOL IS SHOWN. Vihaa International is the group's own institution and
 * the only entry with photographs, so it leads: two frames stepped against
 * each other, with its name in the display face ranged to the foot of the
 * first. The earlier school takes the counter-space of the second frame as a
 * single ruled entry — present, credited, and plainly secondary.
 *
 * THE SECTION IS DRAFTED, NOT ASSEMBLED. It arrives in the order a drawing is
 * made: the heading, then the rubric rule ruled open across the field, then
 * each photograph cut in from its foot with the picture easing off a small
 * push, then the type in the counter-space, and the four drawings inked last.
 * The frames use the same grammar as the ventures frame — mask first, push a
 * beat behind it — and the drawings are the same one-tween trick as the
 * legacy lattice: every path carries `pathLength="1"`, so nothing is measured.
 *
 * THE ONLY CONTAINERS ARE HAIRLINES. No card, no panel, no radius. The
 * photographs are the section's only filled shapes, which is what makes them
 * read as evidence.
 *
 * With no JavaScript, or under reduced motion, every element is already in
 * its final state: the rules are ruled, the frames are open, the drawings are
 * inked, and the bands are legible in document order.
 */

export function Responsibility({ content }: { content: ResponsibilityContent }) {
  const root = useRef<HTMLElement | null>(null);
  const plate = useRef<HTMLDivElement | null>(null);
  const environment = useRef<HTMLDivElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    const plateEl = plate.current;
    const envEl = environment.current;
    if (!rootEl || !plateEl || !envEl) return;

    revealOnEnter(`.${styles.head} > *`, rootEl, { stagger: 0.09 });

    /* Each band's rule is ruled open as that band is reached, so the two
       rubrics are two separate beats rather than one that fires early. */
    for (const band of [plateEl, envEl]) {
      gsap.to(band.querySelector(`.${styles.rubricRule}`), {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: band, start: "top 82%", once: true },
      });
    }

    /* The photographs, each on its own trigger: they are stepped far enough
       apart vertically that one shared trigger would open the second frame
       long before it is in view. Two rates inside each — the mask finishes
       first, the push a beat after it — so a frame settles rather than
       stopping. */
    for (const frame of rootEl.querySelectorAll<HTMLElement>(
      `.${styles.frame}`,
    )) {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: frame, start: "top 85%", once: true },
      });
      timeline.to(frame, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "expo.out",
      });
      timeline.to(
        frame.querySelector(`.${styles.image}`),
        { scale: 1, duration: 1.5, ease: "expo.out" },
        0,
      );
    }

    /* Scoped by class, not by the ref: the GSAP context resolves selector
       text against the section root, so a bare `[data-reveal]` here would
       also re-bind the two elements in the head above. */
    revealOnEnter(`.${styles.plate} [data-reveal]`, plateEl, {
      start: "top 78%",
      stagger: 0.08,
      delay: 0.14,
    });

    revealOnEnter(`.${styles.envBody} [data-reveal]`, envEl, {
      start: "top 84%",
      stagger: 0.07,
    });

    // Inked last, and in the order they are read.
    gsap.to(`.${styles.icon} path`, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: "power1.inOut",
      stagger: 0.05,
      scrollTrigger: { trigger: envEl, start: "top 74%", once: true },
    });

    revealOnEnter(`.${styles.coda}`, rootEl, { start: "top 92%" });
  }, []);

  const [lead, court] = content.community.school.images;

  return (
    <section
      ref={root}
      id="responsibility"
      className={`on-cream ${styles.section}`}
      aria-labelledby="responsibility-title"
    >
      <div className={`u-shell u-head ${styles.head}`}>
        <h2 id="responsibility-title" className="u-h2" data-reveal="up">
          <Swash heading={content.heading} />
        </h2>
        <p data-reveal="up">{content.standfirst}</p>
      </div>

      {/* ---- The community band: one school, shown twice ---------------- */}
      <div ref={plate} className="u-shell">
        <p className={styles.rubric}>
          <span className={`u-label ${styles.rubricLabel}`}>
            {content.community.label}
          </span>
          <span className={styles.rubricRule} aria-hidden="true" />
        </p>

        <div className={`${styles.field} ${styles.plate}`}>
          <figure className={styles.leadFigure}>
            <div className={styles.frame}>
              <Image
                src={lead.src}
                alt={lead.alt}
                width={lead.width}
                height={lead.height}
                sizes="(max-width: 63.99rem) 92vw, 62vw"
                quality={82}
                className={styles.image}
              />
            </div>
            {lead.caption ? (
              <figcaption className={styles.caption} data-reveal="up">
                {lead.caption}
              </figcaption>
            ) : null}
          </figure>

          <div className={styles.school}>
            <h3 className={styles.schoolName} data-reveal="up">
              {content.community.school.name}
            </h3>
            <p className={styles.schoolPlace} data-reveal="up">
              {content.community.school.place}
            </p>
            <p className={styles.schoolNote} data-reveal="up">
              {content.community.school.note}
            </p>
          </div>

          <figure className={styles.courtFigure}>
            <div className={styles.frame}>
              <Image
                src={court.src}
                alt={court.alt}
                width={court.width}
                height={court.height}
                sizes="(max-width: 63.99rem) 92vw, 62vw"
                quality={82}
                className={styles.image}
              />
            </div>
            {court.caption ? (
              <figcaption className={styles.caption} data-reveal="up">
                {court.caption}
              </figcaption>
            ) : null}
          </figure>

          {/* The earlier school, in the second frame's counter-space. */}
          <div className={styles.also} data-reveal="up">
            <h3 className={styles.alsoName}>{content.community.also.name}</h3>
            <p className={styles.alsoPlace}>{content.community.also.place}</p>
            <p className={styles.alsoNote}>{content.community.also.note}</p>
          </div>
        </div>
      </div>

      {/* ---- The environment footing: four practices, drawn ------------- */}
      <div ref={environment} className={`u-shell ${styles.environment}`}>
        <p className={styles.rubric}>
          <span className={`u-label ${styles.rubricLabel}`}>
            {content.environment.label}
          </span>
          <span className={styles.rubricRule} aria-hidden="true" />
        </p>

        <div className={`${styles.field} ${styles.envBody}`}>
          <p className={styles.envLead} data-reveal="up">
            {content.environment.lead}
          </p>

          <ul className={styles.commitments}>
            {content.environment.commitments.map((commitment) => (
              <li
                key={commitment.title}
                className={styles.commitment}
                data-reveal="up"
              >
                <span className={styles.icon}>
                  <ResponsibilityIcons name={commitment.icon} />
                </span>
                <h3 className={styles.commitmentTitle}>{commitment.title}</h3>
                <p className={styles.commitmentDetail}>{commitment.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The last line of the section, and the way into the long version of
          both bands — the sustainability page carries the same two ledgers,
          the schools and the ground, at length. The mark takes the six
          columns the coda leaves empty, so the row reads across the field
          rather than stacking two closing gestures on the same edge. */}
      <div className={`u-shell ${styles.field} ${styles.codaRow}`}>
        <PageLink
          className={styles.onward}
          size="sm"
          href="/sustainability"
          label="Both ledgers, in full"
        />
        <p className={styles.coda} data-reveal="up">
          {content.coda}
        </p>
      </div>
    </section>
  );
}

export default Responsibility;
