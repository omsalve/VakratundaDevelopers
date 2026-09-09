import ArcTransition from "@/components/ArcTransition";
import Atmosphere from "@/components/Atmosphere";
import Concept from "@/components/Concept";
import FinalCTA from "@/components/FinalCTA";
import JointVentures from "@/components/JointVentures";
import Journey from "@/components/Journey";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import Responsibility from "@/components/Responsibility";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/SmoothScroll";
import TeamShowcase from "@/components/TeamShowcase";
import { getSiteContent } from "@/lib/getSiteContent";

/**
 * The page, as a sequence of slides.
 *
 * A Server Component: content is read from Payload at request time and passed
 * down as plain props, so the section components stay pure and reusable for a
 * future /projects/[slug] route.
 *
 * The page changes ground — navy → cream — exactly twice, and each change is
 * the SAME arc: one curve, one measurement, one eased radius, in lib/arc.
 * They differ only in what they carry. Concept's dome is the section's own top
 * edge and the brand lockup lands inside it; ArcTransition's carries the one
 * line that opens the cream, and the sections it introduces then arrive
 * unclipped behind it. Two changes of ground, no more — which is what keeps
 * the device from wearing out.
 *
 * BOTH ARCS OVERLAP THE SECTION ABOVE THEM, and both are paid for by that
 * section rather than taken from it. Concept is pulled back over Journey;
 * ArcTransition is pulled back over ProjectsShowcase, which grows by the
 * length of the arc and holds its last frame perfectly still for it. In each
 * case the arc opens against a frame nobody is moving, and the two elements
 * release on the same scroll pixel. Nothing may be inserted between either
 * pair, and neither arc may be given a section that does not hold still.
 */

export const revalidate = 60;

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      {/* Set enabled={false} to ship without smooth scrolling. */}
      <SmoothScroll enabled />

      <a className="u-skip-link" href="#story">
        Skip to content
      </a>
      <div className="u-grain" aria-hidden="true" />

      <SiteHeader links={content.nav.links} cta={content.nav.cta} />

      <main id="top">
        {/* The brand line, then the photograph on its own with the pins
            staked out on it. One section, one continuous photograph. */}
        <Journey hero={content.hero} />

        {/* Navy → cream. The dome is Concept's own top edge. */}
        <Concept content={content.concept} />

        {/* The portfolio, as one continuous transition: two panels merge
            into a single full-bleed photograph, the title lands across it,
            and the scroll walks through every project in turn. It then holds
            that last frame still, which is the ground the arc below opens
            against — the two are a pair. */}
        <ProjectsShowcase content={content.gallery} />

        {/* Navy → cream, second and last. THE ARC CARRIES THE PAGE'S SECOND
            LOCKUP — a tower of type on a screen of open cream with nothing
            else in it, which is the one moment where the ground itself is
            the composition. Its copy is `team.interstitial`, and it is NOT
            Atmosphere's headline: that sentence is set one screen below as
            the head of the composition arguing for it, and setting it twice
            within a screen of itself would make the first a caption on the
            second. So the arc states the claim and Atmosphere answers it.

            WHAT FOLLOWS THE ARC IS ONE ARGUMENT IN TWO PARTS, in order and
            inseparably: the rooms, and the people behind them. Atmosphere is
            the claim and what it feels like; the team is who it is a claim
            about. The arc opens the field, Atmosphere states it, the team
            answers it. Nothing may be inserted between the two, and neither
            may be moved past the other.

            Atmosphere closes on no padding of its own, because TeamShowcase
            opens on --section-pad-lg — one interval between them, not two. */}
        <ArcTransition interstitial={content.team.interstitial}>
          <Atmosphere content={content.atmosphere} />
          <TeamShowcase content={content.team} />
        </ArcTransition>

        {/* The partnerships, on the same cream the team stands on and driven
            by hand rather than by the scroll — the one section the visitor
            operates. It closes the case the team opened: who trusts them. */}
        <JointVentures content={content.ventures} />

        {/* What the group owes, on the same cream, ruled into two columns:
            the community it builds among and the ground it builds on. It is
            the last thing said before the close and the smallest section on
            the page, which is the right proportion for it — a claim about
            conduct that runs long stops being a claim about conduct.

            IT DOES NOT CHANGE THE GROUND. The page still changes ground twice
            and only twice; this section takes the ventures' cream and hands
            the same cream to FinalCTA, which cuts it to navy exactly where it
            always did. */}
        <Responsibility content={content.responsibility} />

        <FinalCTA content={content.finalCta} legal={content.legal} />
      </main>
    </>
  );
}
