import type { Metadata } from "next";
import ArcTransition from "@/components/ArcTransition";
import Atmosphere from "@/components/Atmosphere";
import Concept from "@/components/Concept";
import EnclosureFooter from "@/components/EnclosureFooter";
import JointVentures from "@/components/JointVentures";
import Journey from "@/components/Journey";
import Legacy from "@/components/Legacy";
import Openland from "@/components/Openland";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import Responsibility from "@/components/Responsibility";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/SmoothScroll";
import TeamShowcase from "@/components/TeamShowcase";
import Testimonials from "@/components/Testimonials";
import Vihaa from "@/components/Vihaa";
import { buildMetadata } from "@/lib/cms/metadata";
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

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return buildMetadata(content.seo, { path: "/", absoluteTitle: true });
}

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

      {/* `data-enclose-page` is the handle EnclosureFooter closes around —
          see the header comment in components/EnclosureFooter.tsx. Anything
          `position: fixed` inside this element must portal to <body>, as
          Lightbox already does. */}
      <main id="top" data-enclose-page>
        {/* The brand line, then the photograph on its own with the pins
            staked out on it. One section, one continuous photograph. */}
        <Journey hero={content.hero} />

        {/* Navy → cream. The dome is Concept's own top edge. */}
        <Concept content={content.concept} />

        {/* The rooms, straight after the flagships the story closes on — in
            the place the milestones used to take. The story ends on "more
            than structures — belonging", and this is what that feels like
            from the inside and the outside, on the same cream. */}
        <Atmosphere content={content.atmosphere} />

        {/* The proof, after the rooms rather than before them: the guide's
            own circles, and the Skygarden roof render bled to the foot of the
            cream, where the portfolio below cuts straight to navy. */}
        <Legacy content={content.concept.legacy} />

        {/* The portfolio, as one continuous transition: two panels merge
            into a single full-bleed photograph, the title lands across it,
            and the scroll walks through every project in turn. It then holds
            that last frame still, which is the ground the arc below opens
            against — the two are a pair. */}
        <ProjectsShowcase content={content.gallery} />

        {/* Navy → cream, second and last. The arc carries the page's second
            lockup — a tower of type on a screen of open cream — and hands it
            straight to the partnerships. Nothing may be inserted between the
            arc and the section above it. Its line is still read from
            `team.interstitial`, where it has always been edited. */}
        <ArcTransition interstitial={content.team.interstitial}>
          {/* THE PROOF COMES BEFORE THE PEOPLE. The site's job is to show the
              group is what it says it is, and the strongest case for that is
              the company it keeps and what it has built beyond housing: the
              names it builds beside, and then its own school. So those two
              follow the portfolio directly, and the team — the longest scroll
              set piece on the page — follows them, rather than standing
              between the portfolio and its proof.

              The partnerships, driven by hand rather than by the scroll — the
              one section the visitor operates. */}
          <JointVentures content={content.ventures} />
        </ArcTransition>

        {/* The school, given priority: the group's own institution, straight
            after the partnerships, whose first slide has just shown Badlapur,
            the school's own town. Same cream; the sticky copy and drifting
            columns are read, not driven, so the page does not gain a third
            scroll set piece. */}
        <Vihaa content={content.vihaa} />

        {/* The people, once the case for them has been made. */}
        <TeamShowcase content={content.team} />

        {/* The land: what the group builds from nothing — open ground,
            surveyed and laid out whole. Its own ground (a survey sheet on
            cream) rather than a third change of ground: the page still goes
            navy → cream exactly twice. */}
        <Openland content={content.openland} />

        {/* The clients, in their own words — the last voices before the
            page's closing section. Same cream, and read rather than driven: a
            thread of quotes that ink in as the eye reaches them, not a scroll
            set piece or a second carousel. */}
        <Testimonials content={content.testimonials} />

        {/* What the group owes the ground it builds on, on the same cream. It
            is the last thing said before the close and the smallest section on
            the page, which is the right proportion for it — a claim about
            conduct that runs long stops being a claim about conduct.

            IT DOES NOT CHANGE THE GROUND. The page still changes ground twice
            and only twice; this section takes the cream above it and hands
            the same cream to the shell below, which closes over it in navy —
            the same cut to navy the close always made, now made by the thing
            that encloses the page rather than by its last section. */}
        <Responsibility content={content.responsibility} />
      </main>

      {/* Outside <main>: the shell closes AROUND the page, and is the page's
          contentinfo landmark rather than the tail of a section. */}
      <EnclosureFooter
        content={content.finalCta}
        legal={content.legal}
        topHref="#top"
      />
    </>
  );
}
