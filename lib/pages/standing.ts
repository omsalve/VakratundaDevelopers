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

/* ------------------------------------------------------------------ about */

export const aboutPage: AboutPageContent = {
  seo: {
    title: "About",
    description:
      "Vakratunda Group has built in Mumbai since 1973 — 2.1 million sq. ft. delivered, 2,500+ families moved in, and a second generation still signing the drawings.",
  },

  hero: {
    label: "About us",
    // The landing page's own framing: a legacy of shaping not just skylines
    // but lives (CP_Final p.4, via content.ts `concept.body`).
    heading: { before: "Fifty years of ", swash: "shaping", after: " more than skylines" },
    standfirst:
      "Vakratunda Group has built in Mumbai since 1973 — residential, commercial and redevelopment, across the island city, the eastern and western suburbs, and Thane. The drawings are signed by a second generation now.",
    meta: ["Established 1973", "Mumbai · MMR", "MCHI-CREDAI"],
  },

  story: {
    label: "The practice",
    heading: { before: "A single vision, ", swash: "rooted", after: " in purpose" },
    standfirst:
      "The group began with one address and a view about what an address ought to be worth to the people living at it. That view has not moved; the portfolio around it has.",
    body: [
      // content.ts `concept.body[0]`, opened out.
      "Established in 1973, Vakratunda Group began as a single vision, rooted in purpose and driven by progress. Over five decades later that vision has grown into a legacy of shaping not just skylines, but lives — 2.1 million sq. ft. developed across Mumbai, and more than 2,500 families who have moved into a home the group drew.",
      // The redevelopment practice, from `concept.legacy.proofs`.
      "A large part of that work is redevelopment, which is the hardest version of the job and the one the group is judged on most closely. A society that hands over the place it already calls home is not buying a render; it is trusting a builder with an address it has to come back to. Those projects are completed and occupied, and many more are in the pipeline.",
      // content.ts `concept.body[1]`, verbatim in substance.
      "At the heart of it lies a simple promise: to deliver more than structures, to deliver belonging. Because the group does not build for today — it builds for tomorrow, and a second generation is now signing the drawings its first generation started.",
    ],
    image: {
      src: "/images/concept.jpg",
      alt: "A Vakratunda Group residential tower seen from the street, its upper floors against open sky.",
      width: 2133,
      height: 2667,
      caption: "The work, as it is met from the pavement.",
    },
    // The landing page's promise line, set as the sentence that covers the
    // three paragraphs above it rather than any one of them.
    pullquote:
      "More than structures — a place to belong.",
  },

  principles: {
    heading: { before: "What the practice ", swash: "holds", after: " to" },
    standfirst:
      "Four commitments that decide the drawings, and that a fifty-year-old builder can be held to on any one of its addresses.",
    items: [
      {
        id: "belonging",
        eyebrow: "The promise",
        title: "More than structures",
        body: "A building is finished when it is lived in, not when it is handed over. Every plan is drawn against the ordinary evening a family will spend in it, which is the only test that outlasts a launch.",
      },
      {
        id: "redevelopment",
        eyebrow: "Redevelopment",
        title: "The address, returned",
        body: "A society that redevelops is trusting a builder with the place it already lives. The group treats that as the most demanding brief it takes, and its completed redevelopments are the record it would rather be read on.",
      },
      {
        id: "ground",
        eyebrow: "Sustainability",
        title: "Aligned with IGBC and LEED",
        body: "Green building practice, rainwater harvesting, waste management and energy-efficient design are specified into the work rather than added to it. The full ledger is set out on the sustainability page.",
      },
      {
        // AUTHORED. Vihaa's standing as a joint venture, stated beside the
        // two partners content.ts already names.
        id: "ventures",
        eyebrow: "Joint ventures",
        title: "Partnerships that hold",
        body: "The group builds alongside partners it can be measured against — Godrej Properties and Shapoorji Pallonji Real Estate among them — and not only in housing: Vihaa International School in Badlapur is a joint venture too, held to the standard of any address that carries the group's name.",
      },
    ],
  },
};

/* --------------------------------------------------------------- projects */

export const projectsPage: ProjectsPageContent = {
  seo: {
    title: "Our Projects",
    description:
      "Fourteen Vakratunda addresses across Mumbai, the suburbs and Thane — delivered, under construction and upcoming.",
  },

  hero: {
    label: "Our projects",
    heading: { before: "Every address the group has ", swash: "signed", after: "" },
    standfirst:
      "Delivered, under construction and upcoming, across Mumbai, the suburbs and Thane. The field below is the same record the landing page scrolls through.",
    meta: ["2.1 million sq. ft.", "2,500+ families", "Since 1973"],
  },

  filterLabel: "Filter by stage",
  allLabel: "All projects",
  // The filter only renders stages that have something under them, so this
  // is the genuinely empty case rather than the ordinary one.
  emptyMessage: "No projects filed under this stage yet.",
  note: "Photographs are of completed Vakratunda developments. Projects marked under construction or upcoming are represented by the group's own renders and drawings.",
};

/* --------------------------------------------------------- sustainability */

export const sustainabilityPage: SustainabilityPageContent = {
  seo: {
    title: "Sustainability",
    description:
      "IGBC and LEED-aligned building practice — green building, rainwater harvesting, waste management and energy-efficient design, specified into every Vakratunda Group scheme.",
  },

  hero: {
    label: "Sustainability",
    // AUTHORED, from the environment lead below: specified into the drawings
    // rather than added to a finished building.
    heading: { before: "Specified in, not ", swash: "added", after: " on" },
    standfirst:
      "Fifty years in, the work is also measured by what it asks of the ground it stands on. Four practices answer that, and each is decided at the drawing stage — where it is still cheap to get right.",
    meta: ["IGBC · LEED aligned", "Four practices", "Mumbai · MMR"],
  },

  environment: {
    label: "Environment",
    heading: { before: "The ground it ", swash: "stands", after: " on" },
    // content.ts `responsibility.environment.lead`, verbatim.
    lead: "Aligned with IGBC and LEED guidelines, to minimise carbon footprint and build a greener tomorrow. The four commitments below are specified into the drawings rather than added to a finished building.",
    items: [
      {
        id: "green",
        icon: "green",
        title: "Green building practices",
        body: "Eco-friendly structures that promote healthier living — materials, orientation and envelope decided at the drawing stage, where they are still cheap to get right.",
      },
      {
        id: "rainwater",
        icon: "rainwater",
        title: "Rainwater harvesting",
        body: "Water conserved to support future generations. Collection and recharge are planned into the podium and the landscape rather than retrofitted around them.",
      },
      {
        id: "waste",
        icon: "waste",
        title: "Waste management systems",
        body: "Cleaner communities through responsible disposal — segregation at source, with the space it needs designed into the service core instead of borrowed from the parking.",
      },
      {
        id: "energy",
        icon: "energy",
        title: "Energy-efficient design",
        body: "Smart lighting and ventilation that reduce energy use, and daylight and cross-ventilation drawn in first so that less of the load has to be engineered away later.",
      },
    ],
  },

  // content.ts `responsibility.coda`, verbatim.
  coda: "Every initiative reflects our belief that true prosperity lies in stronger, healthier and more self-reliant communities.",
  cta: { label: "Talk to the team", href: "/contact" },
};
