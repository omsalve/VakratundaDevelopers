/**
 * About, Our Projects and Sustainability.
 *
 * The three pages that restate the landing page rather than extending it —
 * its concept band, its gallery and its responsibility band, each given the
 * length the landing page could not give it. A visitor arrives here having
 * already asked the question the band only had room to answer in a sentence.
 *
 * COPY: AUTHORED, and deliberately narrow. Nothing below states a figure that
 * is not already in lib/content.ts — the fifty years, the 2.1 million sq. ft.,
 * the 2,500+ families, the four environmental commitments and the joint
 * ventures are all read off the landing page, so there is exactly one place to
 * correct any of them. Where this page wants a fact the group has not published — an
 * IGBC rating on a named building, a spend, a headcount — it says the thing it
 * can stand behind instead of reaching for a number.
 *
 * THE PROJECTS PAGE HOLDS NO PROJECTS. Its field is `content.gallery.slides`,
 * read straight from the CMS by the route, so a project added in /admin
 * appears on the landing page and here without being entered twice. What is
 * below is only the chrome: the filter's labels and the note under the field.
 *
 * PHOTOGRAPHS ARE THE LIBRARY WE HAVE — the same note living.ts carries. The
 * story frame is the concept photograph, cropped to the portrait the band
 * wants. Sustainability carries no photographs: its four practices are drawn,
 * and the library has no frame that is evidence of any one of them.
 */

import type {
  AboutPageContent,
  ProjectsPageContent,
  SustainabilityPageContent,
} from "./types";
import { siteImage } from "../siteImages";

/* ------------------------------------------------------------------ about */

export const aboutPage: AboutPageContent = {
  seo: {
    title: "About",
    description:
      "Since 1973, Vakratunda Group has shaped not just skylines, but lives — 2.1 million sq. ft. developed, 2,500+ families home, a school in Badlapur, and a legacy now in its second generation.",
  },

  hero: {
    label: "About us",
    // CP_Final p.4, "The story Behind the Structure".
    heading: { before: "The ", swash: "story", after: " behind the structure" },
    // "and schools" is AUTHORED, and it is in the first sentence a visitor
    // reads for a reason: the school is not a footnote to the practice, and it
    // was previously named only once, in the last line of the last card on the
    // page. It stands on Vihaa International School, Badlapur — which the
    // landing page already carries as a section of its own (content.ts
    // `vihaa`), so nothing here claims anything new.
    standfirst:
      "Legacy-built, future-focused and human-first. Since 1973, we have shaped residential, commercial and redevelopment spaces across Mumbai City, its suburbs and Thane — and schools for the neighbourhoods we build in. Now led by a second generation.",
    meta: ["Established 1973", "Homes & schools", "Mumbai · MMR", "MCHI-CREDAI"],
  },

  story: {
    label: "Our story",
    heading: { before: "A single vision, ", swash: "rooted", after: " in purpose" },
    standfirst:
      "We began with one address and one belief: that a home should be worth more than its walls to the family inside. The belief hasn't moved; the skyline around it has.",
    body: [
      // content.ts `concept.body[0]`, opened out.
      "Established in 1973, Vakratunda Group began as a single vision, rooted in purpose and driven by progress. Over five decades later, that vision has grown into a legacy of shaping not just skylines, but lives — 2.1 million sq. ft. developed across Mumbai, and more than 2,500 families who now call a Vakratunda address home.",
      // The redevelopment practice, from `concept.legacy.proofs`.
      "Much of that journey is redevelopment — the most demanding work we do, and the work we are proudest of. A society that hands over the home it already loves isn't buying a render; it is trusting us with an address it will return to. Those projects stand completed and lived in, and many more are in the pipeline.",
      // AUTHORED. The education work, given a paragraph rather than a clause.
      // It stands on Vihaa International School in Badlapur — a joint venture
      // the landing page already sets out as a section of its own — and
      // claims nothing beyond it: no count, no second campus, no intake.
      "We do not only build homes. Vihaa International School in Badlapur is ours too — a joint venture held to the standard of every address that carries our name, and the clearest answer we have to what a neighbourhood needs besides somewhere to live. A school is a fifty-year building in the way a tower is not: it is judged by the people who come out of it.",
      // content.ts `concept.body[1]`, verbatim in substance.
      "At the heart of Vakratunda lies a simple promise: to deliver more than structures, to deliver belonging. Because we don't just build for today, we build for tomorrow — and a second generation now carries forward what the first began.",
    ],
    image: {
      src: siteImage("concept.jpg"),
      alt: "A Vakratunda Group residential tower seen from the street, its upper floors against open sky.",
      width: 2133,
      height: 2667,
      caption: "Our work, as the street first meets it.",
    },
    // The landing page's promise line, set as the sentence that covers the
    // three paragraphs above it rather than any one of them.
    pullquote:
      "More than structures — a place to belong.",
  },

  principles: {
    heading: { before: "Values you can ", swash: "build", after: " on" },
    standfirst:
      "Five commitments that shape every drawing — transparent, ethical and built to stand the test of time at every address we deliver.",
    items: [
      {
        id: "belonging",
        eyebrow: "The promise",
        title: "More than structures",
        body: "A home isn't finished when it is handed over, but when it is lived in. Every plan is drawn around the ordinary evenings a family will share there — the only test that outlasts a launch.",
      },
      {
        id: "redevelopment",
        eyebrow: "Redevelopment",
        title: "The address, returned",
        body: "A society that redevelops trusts us with the place it already calls home. We treat that as our most demanding brief — and our completed redevelopments are the record we would rather be read on.",
      },
      {
        id: "ground",
        eyebrow: "Sustainability",
        title: "Green today, greater tomorrow",
        body: "Aligned with IGBC and LEED guidelines, green building, rainwater harvesting, waste management and energy-efficient design are woven into our work, not added to it. The full story is on our sustainability page.",
      },
      {
        // AUTHORED. The two partners content.ts already names, and nothing
        // else: the school used to be a clause at the end of this card, which
        // is where a reader least expects to meet it. It has a station of its
        // own below now, and this one is back to being about partnerships.
        id: "ventures",
        eyebrow: "Joint ventures",
        title: "Partnerships that last",
        body: "We grow stronger through the right partnerships — Godrej Properties and Shapoorji Pallonji Real Estate among them. A partner's name on a site board is a standard we then have to keep, which is the point of having one.",
      },
      {
        // AUTHORED. A station rather than a clause — see the note on the
        // ventures card above. It states Vihaa International School, Badlapur
        // and its standing as a joint venture, both of which content.ts
        // `vihaa` already carries, and no figure beyond them.
        id: "education",
        eyebrow: "Education",
        title: "Not only homes — schools",
        body: "Vihaa International School in Badlapur is a joint venture of ours: a state-of-the-art institution built to give young learners an environment worth arriving at. We build schools for the same reason we build homes, and hold them to the same standard — a neighbourhood is made of more than the buildings people sleep in.",
      },
    ],
  },
};

/* --------------------------------------------------------------- projects */

export const projectsPage: ProjectsPageContent = {
  seo: {
    title: "Our Projects",
    description:
      "Vakratunda addresses where dreams found a home — delivered, rising and upcoming across Mumbai, its suburbs and Thane.",
  },

  hero: {
    label: "Our projects",
    heading: { before: "Every address where a dream found a ", swash: "home", after: "" },
    standfirst:
      "Delivered, rising and upcoming, across Mumbai, its suburbs and Thane. Each one is more than a structure — it is a promise we keep.",
    meta: ["2.1 million sq. ft.", "2,500+ families", "Since 1973"],
  },

  filterLabel: "Filter by stage",
  allLabel: "All projects",
  // The filter only renders stages that have something under them, so this
  // is the genuinely empty case rather than the ordinary one.
  emptyMessage: "New addresses are on their way to this stage.",
  note: "Photographs show completed Vakratunda developments. Projects under construction or upcoming are shown through our own renders and drawings.",
};

/* --------------------------------------------------------- sustainability */

export const sustainabilityPage: SustainabilityPageContent = {
  seo: {
    title: "Sustainability",
    description:
      "Green today, greater tomorrow — IGBC and LEED-aligned green building, rainwater harvesting, waste management and energy-efficient design, woven into every Vakratunda Group project.",
  },

  hero: {
    label: "Sustainability",
    // CP_Final p.17, "Green today, greater tomorrow."
    heading: { before: "Green today, ", swash: "greater", after: " tomorrow" },
    standfirst:
      "Sustainability shapes every decision we make. Four practices carry that promise, and each is woven in at the drawing stage — so every project is kinder to the ground it stands on.",
    meta: ["IGBC · LEED aligned", "Four practices", "Mumbai · MMR"],
  },

  environment: {
    label: "Environment",
    heading: { before: "The ground we ", swash: "build", after: " on" },
    // content.ts `responsibility.environment.lead`, verbatim.
    lead: "Aligned with IGBC and LEED guidelines, to minimise carbon footprint and build a greener tomorrow. The four commitments below are woven into every layer of our construction process, not added at the end.",
    items: [
      {
        id: "green",
        icon: "green",
        title: "Green building practices",
        body: "Eco-friendly structures that promote healthier living — materials, orientation and envelope chosen at the drawing stage, where good decisions take root.",
      },
      {
        id: "rainwater",
        icon: "rainwater",
        title: "Rainwater harvesting",
        body: "Water conserved to support future generations. Collection and recharge are planned into the podium and landscape from day one, never retrofitted around them.",
      },
      {
        id: "waste",
        icon: "waste",
        title: "Waste management systems",
        body: "Cleaner communities through responsible disposal — segregation at source, with room for it designed into the service core, not borrowed from the parking.",
      },
      {
        id: "energy",
        icon: "energy",
        title: "Energy-efficient design",
        body: "Smart lighting and ventilation that reduce energy use — with ample daylight and airflow drawn in first, so homes breathe naturally and need less to keep them cool.",
      },
    ],
  },

  // content.ts `responsibility.coda`, verbatim.
  coda: "Every initiative reflects our belief that true prosperity lies in stronger, healthier and more self-reliant communities.",
  cta: { label: "Talk to our team", href: "/contact" },
};
