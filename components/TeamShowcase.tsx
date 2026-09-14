"use client";

import { useCallback, useId, useRef, useState } from "react";
import clsx from "clsx";
import type { TeamContent, TeamMember } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import { usePopover } from "@/lib/usePopover";
import PortraitPlate from "./PortraitPlate";
import Swash from "./Swash";
import TeamIcons from "./TeamIcons";
import styles from "./TeamShowcase.module.css";

/**
 * The team, as four slides.
 *
 * It stands where the presence timeline stood, and it keeps that section's
 * one idea: A RULE WITH NODES ON IT, measuring a set. The rule used to be a
 * survey line and the nodes were localities; it is now the slideshow's own
 * control rail and the nodes are the four slides. Same grammar, same
 * disclosure behaviour (usePopover, exactly as the stops used), same
 * two-layouts-from-one-markup construction — a different subject.
 *
 * TWO LAYOUTS, FROM THE SAME MARKUP — the house pattern:
 *
 *   · DEFAULT (no JS, reduced motion, or under 64rem). Four ordinary cream
 *     blocks, stacked, in document order. Nothing is sticky, nothing is
 *     hidden, no slide is unreachable, and the control rail — which has
 *     nothing to control once every slide is already on the page — is not
 *     rendered at all. THE SECTION IS COMPLETE. This is also, exactly and
 *     without a second code path, the reduced-motion fallback: `motion-on`
 *     is never set for that visitor and `useGsapScope` never runs the setup
 *     below, so there is no timeline to get stuck inside.
 *
 *   · `.motion-on`, 64rem and up. The section grows to SPAN viewports, its
 *     stage goes sticky, and the four slides share one frame while the
 *     scroll cuts between them.
 *
 * ============================================================================
 * THE CUT — ONE SLIDE ON SCREEN, EVER
 * ============================================================================
 *
 * NO TWO SLIDES ARE VISIBLE AT THE SAME TIME, AT ANY POINT. That is the
 * constraint this transition is built from, and it rules out the whole
 * dissolve family: a crossfade is two compositions lying over each other by
 * definition, and no amount of easing changes what is on the screen during
 * one. Every wipe has the same problem in a different arrangement — it shows
 * both slides at once, side by side instead of stacked.
 *
 * SO THE CUT HAPPENS UNDER COVER. A plane of the page's own cream passes
 * through the frame; the slide is exchanged underneath it at the moment the
 * frame is completely covered; and the plane carries on out the other side.
 * Before that moment the screen holds the outgoing slide and the plane. After
 * it, the plane and the incoming slide. Never both slides. The change itself
 * is a hard cut — the cleanest edit there is — and it is invisible because
 * there is nothing to see it against.
 *
 * THE PLANE IS THE PAGE'S OWN CURVE, at a different scale and on a different
 * axis. Its leading and trailing edges are a very shallow arc, drawn across
 * twice the frame's width, so what crosses the composition is almost a
 * straight edge and not quite — the same family as the petal the page changes
 * ground on twice, without being that gesture. And it is CREAM because the
 * section is cream: what the visitor sees is not an object sliding over the
 * page, it is the GROUND ITSELF rising to take one composition back and set
 * the next one down. A navy plane would have been a third change of ground,
 * and the page is allowed two.
 *
 * SUBTLE, AND STILL DRAMATIC. Four things keep a cream plane on a cream page
 * from being nothing at all:
 *
 *   1. IT IS LIT. A soft gradient along its travel axis runs from cream-300
 *      at the ends to cream-100 through the middle, so it reads as light
 *      passing rather than as a fill arriving.
 *   2. IT CASTS. A wide, offset shadow travels ahead of it onto the slide it
 *      is covering — the one place in this section where an element is
 *      physically above another, and the whole of what makes the edge
 *      legible against a ground of its own colour.
 *   3. THE COMPOSITION LEAVES UNDER ITS OWN POWER. The outgoing slide drifts
 *      back and racks OUT of focus for as long as any of it is still on
 *      screen, so it is going rather than merely being covered up.
 *   4. THE NEXT ONE IS ALREADY MOVING when the trailing edge uncovers it, and
 *      is given a fifth longer than the cut to settle — so it is still coming
 *      into focus a beat after the plane has gone. That lag, more than any
 *      single tween here, is the difference between a camera move and a
 *      change of slide.
 *
 * THE COVER IS SHORTER THAN THE REVEAL, deliberately: the plane takes 0.42 of
 * the cut to arrive and the remaining 0.58 to leave. A transition that spends
 * as long hiding a composition as it does presenting one has put its emphasis
 * in the wrong half.
 *
 * NOTHING HERE IS A CAROUSEL TIMER. The scroll is the transport, the rail is
 * the control, and a visitor who stops scrolling gets a completely still
 * frame — which is the only state any of this copy is meant to be read in.
 */

/* ============================================================================
   THE SEQUENCE, in timeline units. A unit is a unit of the timeline, not of
   the section: the section's height is DERIVED from the sum below, so the
   holds and the cuts can be re-paced without a viewport figure anywhere
   needing to be re-tuned to match.
   ========================================================================== */

/** The four slides, in order. The labels are the rail's, and the accessible
 *  names of the slides themselves. */
const SLIDES = [
  { id: "intro", label: "Introduction" },
  { id: "chairman", label: "Chairman" },
  { id: "leadership", label: "Leadership" },
  { id: "teams", label: "Core teams" },
] as const;

const COUNT = SLIDES.length;

/** Units a slide is held perfectly still. */
const HOLD = 1.05;

/** Units one cut occupies — HALF AS LONG AGAIN as the hold either side of it.
 *  The one number that decides whether this reads as a move or as a change of
 *  slide, and the reason every ease below can afford to be gentle: there is
 *  enough scroll inside a cut for a slow move to still finish. */
const CUT = 1.6;

/** Where in the cut the frame is completely covered, and therefore where the
 *  slide is exchanged. Before the halfway mark, so the reveal is given more
 *  of the cut than the cover is. */
const COVERED = 0.42;

/** Viewports of scroll one unit is worth. */
const PACE = 0.6;

/** The whole timeline: every slide held, and every gap between two of them
 *  cut across. */
const UNITS = COUNT * HOLD + (COUNT - 1) * CUT;

/** Viewports the section occupies: one for the stage, the rest for travel. */
const SPAN = UNITS * PACE;

/** Where slide `i` begins to be held, in units. */
const holdAt = (i: number) => i * (HOLD + CUT);

/** Where the cut OUT of slide `i` begins, in units. */
const cutAt = (i: number) => holdAt(i) + HOLD;

/** The plane's rest position, as a percentage of its own width. At -75 its
 *  trailing edge sits exactly on the frame's left edge and at +75 its leading
 *  edge is past the right — off-frame, and therefore invisible, at both ends
 *  of every cut. See the geometry note on `.shutter` in the stylesheet, which
 *  is where this number is actually derived. */
const PLANE_OUT = 75;

/** Below this the motion layout is not built at all — see the stylesheet. */
const MOTION_QUERY = "(min-width: 64rem)";
const STANDING_QUERY = "(max-width: 63.99rem)";

/**
 * The state a slide waits in, and the state its plate waits in. Stated once:
 * the setup below puts every slide but the first into it, and every cut
 * brings the incoming slide out of exactly it.
 *
 * THE BLUR IS ON THE SLIDE AND ONLY ON THE SLIDE. A plate inside a blurred
 * slide already inherits the filter, and a second blur on top of it is twice
 * the cost for a soft edge nobody asked for. The plate's own share of the
 * move is the extra scale and travel below — which is what puts the picture
 * and the type it belongs to at two different depths.
 */
const SLIDE_IN = { opacity: 0, scale: 1.1, filter: "blur(9px)" };
const PLATE_IN = { scale: 1.24, yPercent: 8 };

export function TeamShowcase({ content }: { content: TeamContent }) {
  const root = useRef<HTMLElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scroller = useRef<((index: number) => void) | null>(null);

  /** Which slide is being held. Drives the rail and, in the stacked layout,
   *  which slide is reachable at all. */
  const [index, setIndex] = useState(0);

  /** True only while the sticky, one-frame layout is actually built. The
   *  standing layout has every slide on the page and must inert none of
   *  them. */
  const [stacked, setStacked] = useState(false);

  /** A slide reports its node up rather than being handed the array to write
   *  into: a ref passed down as a prop is the parent's, and writing to it
   *  from a child is a mutation of a prop however it is spelled. */
  const holdSlide = useCallback((i: number, el: HTMLDivElement | null) => {
    slideRefs.current[i] = el;
  }, []);

  const goTo = useCallback((i: number) => {
    const scroll = scroller.current;
    if (scroll) {
      scroll(i);
      return;
    }
    // Standing layout, or a click that lands before the timeline is built:
    // the slides are real blocks in document order, so an ordinary jump is
    // both correct and all that is wanted.
    slideRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useGsapScope(root, () => {
    const section = root.current;
    if (!section) return;

    /* Slide one is the section's head, and it arrives the way every other
       head on the site arrives. Outside the matchMedia on purpose: it is the
       one entrance both layouts share. */
    revealOnEnter(`.${styles.introReveal} > *`, section, {
      stagger: 0.09,
      start: "top 78%",
    });

    const mm = gsap.matchMedia();

    /* ---- Wide: one frame, and the scroll cuts through it ---------------- */
    mm.add(MOTION_QUERY, () => {
      const q = gsap.utils.selector(section);
      const slides = q(`.${styles.slide}`);
      const veil = q(`.${styles.veil}`)[0];
      const shutter = q(`.${styles.shutter}`)[0];
      const fill = q(`.${styles.railFill}`)[0];
      if (slides.length !== COUNT) return;

      setStacked(true);

      /* Empty for slides three and four, which are type alone — every tween
         that moves a plate has to ask before it runs. */
      const plateOf = (slide: Element) => slide.querySelectorAll("[data-plate]");

      /* The bodies of slides two to four are marked `data-reveal`, which the
         global stylesheet holds at opacity 0 under `motion-on` so the
         STANDING layout can bring them in one at a time. In this layout the
         slide itself owns visibility, so they are handed back visible before
         anything else runs. gsap.context reverts this on the way out. */
      gsap.set(q("[data-reveal]"), { opacity: 1, y: 0 });

      /* Every slide but the first starts in the state its own cut will bring
         it out of, so the first frame of the section is slide one alone. */
      slides.forEach((slide, i) => {
        if (i === 0) return;
        gsap.set(slide, SLIDE_IN);
        const plate = plateOf(slide);
        if (plate.length) gsap.set(plate, PLATE_IN);
      });

      // And the plane waits off the frame's left edge, where it cannot be
      // seen until a cut brings it through.
      gsap.set(shutter, { xPercent: -PLANE_OUT });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          /* A long scrub. The cut lags the wheel by a beat and eases to rest
             whenever scrolling stops, which is most of what reads as
             composure rather than reaction — the same figure ArcTransition
             opens its disc on, for the same reason. */
          scrub: 1.1,
          invalidateOnRefresh: true,
          // Promote for the range the cuts actually run in, and no longer —
          // four full-frame layers kept composited for the rest of the page
          // is the wasteful version of this effect.
          onToggle: (self) => {
            section.dataset.cutting = self.isActive ? "on" : "off";
          },
          onUpdate: (self) => {
            const at = self.progress * UNITS;

            // The rail fills across the whole section, continuously — it is
            // a measure of the scroll, not a stepped indicator.
            if (fill) gsap.set(fill, { scaleX: self.progress });

            /* Which slide is being held. The rail changes hands on exactly
               the frame the slide does — under full cover — so the label and
               the composition are never describing two different things.
               React bails out on an unchanged value, so this costs a
               comparison a frame. */
            const step = HOLD + CUT;
            let held = Math.min(COUNT - 1, Math.floor(at / step));
            if (at - held * step > HOLD + CUT * COVERED) {
              held = Math.min(COUNT - 1, held + 1);
            }
            setIndex(held);
          },
        },
      });

      /* The timeline has to be exactly UNITS long whatever the tweens on it
         happen to add up to, or the scrub would map the section's scroll
         onto the wrong range. One tween, spanning the whole of it, does that
         and nothing else. */
      tl.to({}, { duration: UNITS }, 0);

      for (let i = 0; i < COUNT - 1; i += 1) {
        const from = slides[i]!;
        const to = slides[i + 1]!;
        const at = cutAt(i);
        /** The frame is completely covered here, and nowhere else. */
        const covered = at + CUT * COVERED;

        tl
          /* (1) THE PLANE, in one continuous pass. It accelerates in — a
             plane that arrives at a constant rate reads as a bar being
             pushed — and decelerates out over the longer half, which is the
             half that has a new composition to present. */
          .fromTo(
            shutter,
            { xPercent: -PLANE_OUT },
            { xPercent: 0, duration: CUT * COVERED, ease: "sine.in" },
            at,
          )
          .to(
            shutter,
            {
              xPercent: PLANE_OUT,
              duration: CUT * (1 - COVERED),
              ease: "power2.out",
            },
            covered,
          )

          /* (2) THE OUTGOING SLIDE, behind it. It falls back and racks out of
             focus for exactly as long as any of it is still on screen, and
             not one unit longer — everything after `covered` would be work
             done on something nobody can see. */
          .to(
            from,
            {
              scale: 1.06,
              filter: "blur(8px)",
              duration: CUT * COVERED,
              ease: "sine.in",
            },
            at,
          )

          /* (3) THE CUT ITSELF. Two frames, under full cover, and therefore
             invisible — which is the entire reason the plane exists. */
          .to(from, { opacity: 0, duration: 0.01 }, covered)
          .to(to, { opacity: 1, duration: 0.01 }, covered)

          /* (4) THE INCOMING SLIDE. It starts moving on the same frame, so it
             is already travelling when the trailing edge uncovers it, and it
             is given a fifth longer than the whole cut to come to rest — so
             the picture is still sharpening a beat into the hold. */
          .fromTo(
            to,
            { scale: SLIDE_IN.scale, filter: SLIDE_IN.filter },
            {
              scale: 1,
              filter: "blur(0px)",
              duration: CUT * 1.05,
              ease: "expo.out",
            },
            covered,
          )

          /* (5) The vignette closes down around the frame as the plane takes
             it and opens again once the new composition is standing. Low
             enough to be felt rather than seen: at the setting where a
             vignette can be read as a shape it has stopped being one. */
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 0.2, duration: CUT * COVERED, ease: "sine.inOut" },
            at,
          )
          .to(
            veil,
            {
              opacity: 0,
              duration: CUT * (1 - COVERED) * 0.85,
              ease: "sine.inOut",
            },
            covered,
          );

        /* The plate's half of (2) and (4). Off the chain because a cut into
           or out of a type-only slide has no plate to move, and every
           position above is absolute, so adding them last still lands them
           on the frames they belong to. */
        const fromPlate = plateOf(from);
        if (fromPlate.length) {
          tl.to(
            fromPlate,
            {
              scale: 1.16,
              yPercent: -7,
              duration: CUT * COVERED,
              ease: "sine.in",
            },
            at,
          );
        }

        const toPlate = plateOf(to);
        if (toPlate.length) {
          tl.fromTo(
            toPlate,
            PLATE_IN,
            {
              scale: 1,
              yPercent: 0,
              duration: CUT * 1.2,
              ease: "expo.out",
            },
            covered,
          );
        }
      }

      /* The rail's buttons move the SCROLL, because the scroll is what the
         slideshow is made of. The middle of a slide's hold is the one place
         in its range where nothing is moving. */
      const st = tl.scrollTrigger;
      scroller.current = (i: number) => {
        if (!st) return;
        const target = (holdAt(i) + HOLD / 2) / UNITS;
        window.scrollTo({
          top: st.start + (st.end - st.start) * target,
          behavior: "smooth",
        });
      };

      return () => {
        scroller.current = null;
        setStacked(false);
        setIndex(0);
        tl.scrollTrigger?.kill();
      };
    });

    /* ---- Narrow: four blocks, and the page scrolls them ----------------- */
    mm.add(STANDING_QUERY, () => {
      const q = gsap.utils.selector(section);
      q("[data-reveal]").forEach((body) => {
        revealOnEnter(body, body, { start: "top 82%" });
      });
    });

    return () => mm.revert();
  }, []);

  const { chairman, leadership, roles, intro } = content;

  return (
    <section
      ref={root}
      id="team"
      className={`on-cream ${styles.section}`}
      aria-labelledby="team-title"
      style={{ "--span": SPAN } as React.CSSProperties}
    >
      <div className={styles.stage}>
        <div className={styles.frame}>
          {/* ---------------------------------------------- 1 · the intro */}
          <Slide
            index={0}
            active={index}
            stacked={stacked}
            onMount={holdSlide}
            className={styles.intro}
          >
            <div className={clsx(styles.introText, styles.introReveal)}>
              <h2 id="team-title" className={`u-h1 ${styles.headline}`}>
                <Swash heading={content.heading} />
              </h2>
              <p className={styles.standfirst}>{content.standfirst}</p>
              <button
                type="button"
                className={styles.cta}
                onClick={() => goTo(1)}
              >
                {intro.ctaLabel}
                <Arrow />
              </button>
            </div>
            <PortraitPlate
              image={intro.image}
              name="Vakratunda Group"
              ratio="3 / 2"
              sizes="(max-width: 64rem) 90vw, 44vw"
              className={styles.introPlate}
              priority
            />
          </Slide>

          {/* ------------------------------------------- 2 · the chairman */}
          <Slide
            index={1}
            active={index}
            stacked={stacked}
            onMount={holdSlide}
            className={styles.chairman}
          >
            <PortraitPlate
              image={chairman.portrait}
              name={chairman.name}
              sizes="(max-width: 64rem) 60vw, 24vw"
              className={styles.chairmanPlate}
            />
            <div className={styles.chairmanText} data-reveal="up">
              <blockquote className={styles.quote}>
                <p className={`u-h2 ${styles.quoteText}`}>
                  <Swash heading={chairman.quote} />
                </p>
                <footer className={styles.byline}>
                  <cite className={styles.name}>{chairman.name}</cite>
                  <span className={styles.role}>{chairman.title}</span>
                </footer>
              </blockquote>
              <p className={styles.bio}>{chairman.bio}</p>
              <button
                type="button"
                className={styles.textCta}
                onClick={() => goTo(2)}
              >
                {chairman.ctaLabel}
                <Arrow />
              </button>
            </div>
          </Slide>

          {/* ----------------------------------------- 3 · the leadership */}
          <Slide
            index={2}
            active={index}
            stacked={stacked}
            onMount={holdSlide}
            className={styles.leadership}
          >
            <ul className={styles.people} data-reveal="up">
              {leadership.map((member) => (
                <LeaderCard
                  key={member.id}
                  member={member}
                  ctaLabel={content.bioCtaLabel}
                />
              ))}
            </ul>
          </Slide>

          {/* ---------------------------------------------- 4 · the teams */}
          <Slide
            index={3}
            active={index}
            stacked={stacked}
            onMount={holdSlide}
            className={styles.teams}
          >
            <ul className={styles.roles} data-reveal="up">
              {roles.map((role) => (
                <li key={role.id} className={styles.roleCard}>
                  <span className={styles.roleIcon} aria-hidden="true">
                    <TeamIcons name={role.icon} />
                  </span>
                  <h3 className={styles.roleTitle}>{role.title}</h3>
                  <p className={styles.roleBody}>{role.descriptor}</p>
                  <a
                    className={styles.roleCta}
                    href={content.roleCta.href}
                    aria-label={`${content.roleCta.label} the ${role.title} team`}
                  >
                    {content.roleCta.label}
                  </a>
                </li>
              ))}
            </ul>
          </Slide>

          {/* The plane that carries every cut, and the vignette that closes
              around the frame while it passes. Neither is rendered in the
              standing layout, where there is no cut to carry. The vignette is
              ABOVE the plane on purpose: it belongs to the lens, not to the
              composition, so it darkens the cream as readily as the type. */}
          <div className={styles.shutter} aria-hidden="true" />
          <div className={styles.veil} aria-hidden="true" />
        </div>

        {/* ---- The rail ---------------------------------------------------
            The presence timeline's survey line, kept: a rule with a node on
            it for every item in the set. It measures four slides now instead
            of nine localities, and each node is the control that goes there.

            Not rendered in the standing layout — see the stylesheet. Every
            slide is already on the page there, and a control rail for four
            adjacent blocks is a navigation aid for a journey nobody is on. */}
        <nav className={styles.rail} aria-label="Team slides">
          <span className={styles.railTrack} aria-hidden="true">
            <span className={styles.railFill} />
          </span>
          <ul className={styles.railStops}>
            {SLIDES.map((slide, i) => (
              <li key={slide.id} className={styles.railStop}>
                <button
                  type="button"
                  className={styles.railButton}
                  data-active={i === index}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                >
                  <span className={styles.node} aria-hidden="true" />
                  <span className={styles.railLabel}>{slide.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/**
 * One slide's box.
 *
 * ASCENDING z-index, so the stack order is the reading order and the pair
 * being exchanged under the plane can never resolve the wrong way round
 * during the two frames both of them are non-zero. Harmless in the standing
 * layout, where nothing overlaps anything.
 *
 * `inert` ONLY in the stacked layout, and only off the active slide: three
 * slides at opacity 0 lying over each other are three slides a keyboard must
 * not be able to tab into. In the standing layout every one of them is a real
 * block on the page and none may be made unreachable.
 */
function Slide({
  index,
  active,
  stacked,
  onMount,
  className,
  children,
}: {
  index: number;
  active: number;
  stacked: boolean;
  onMount: (index: number, el: HTMLDivElement | null) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={(el) => {
        onMount(index, el);
      }}
      className={clsx(styles.slide, className)}
      style={{ zIndex: index + 1 }}
      role="group"
      aria-label={SLIDES[index]!.label}
      data-active={index === active}
      inert={stacked && index !== active}
    >
      {children}
    </div>
  );
}

/**
 * One leader.
 *
 * The card carries the name, the title and the one line that says what the
 * person is FOR; the bio is what the disclosure opens. That split is what
 * earns the control — a "view full bio" that reveals a line already printed
 * two lines above it is a button that does nothing.
 *
 * Same disclosure grammar as the timeline stops it replaces: click or Enter
 * to open, Escape to close, click-away and focus-away to dismiss, focus
 * returned to the trigger.
 */
function LeaderCard({
  member,
  ctaLabel,
}: {
  member: TeamMember;
  ctaLabel: string;
}) {
  const { open, toggle, close, groupRef, triggerRef } =
    usePopover<HTMLLIElement, HTMLButtonElement>();
  const panelId = `bio-${useId().replace(/:/g, "")}`;

  return (
    <li ref={groupRef} className={clsx(styles.person, open && styles.isOpen)}>
      <PortraitPlate
        image={member.portrait}
        name={member.name}
        sizes="(max-width: 64rem) 40vw, 14vw"
        className={styles.personPlate}
      />
      <h3 className={styles.personName}>{member.name}</h3>
      <p className={styles.personRole}>{member.title}</p>
      <p className={styles.personLead}>{member.superpower}</p>

      <button
        ref={triggerRef}
        type="button"
        className={styles.personCta}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        {ctaLabel}
        <span className={styles.personCtaMark} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label={`${member.name} — full bio`}
        className={styles.panel}
        hidden={!open}
      >
        <p className={styles.panelText}>{member.bio}</p>
        <button type="button" className={styles.close} onClick={() => close()}>
          Close
        </button>
      </div>
    </li>
  );
}

/** The house arrow, as the close sets it. */
function Arrow() {
  return (
    <svg
      className={styles.ctaIcon}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default TeamShowcase;
