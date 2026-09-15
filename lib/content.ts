/**
 * Content model + fallback content for the Vakratunda site.
 *
 * Two jobs:
 *  1. Define the shapes every section component accepts as props. The shapes
 *     map 1:1 onto the Payload `home` global (globals/Home.ts) and onto the
 *     `projects` collection, so a future /projects/[slug] route can reuse
 *     Hero, ImmersiveScene, GalleryCarousel and LocationTimeline unchanged.
 *  2. Carry the shipped copy, so the site renders correctly before anyone has
 *     logged into /admin and before the database has a `home` row.
 *
 * COPY PROVENANCE — every string below is either quoted from the brand guide
 * (CP_Final.pdf, page cited inline) or a factual restatement of it. Lines
 * marked AUTHORED are new writing in the guide's voice and are the ones to
 * review before launch; they are listed in README.md under "Copy to approve".
 */

/* ------------------------------------------------------------------ types */

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Rendered under the image where the layout shows a caption. */
  caption?: string;
}

/**
 * A headline with one word set in the swash italic, as the brand guide does
 * throughout ("The *story* Behind the Structure", "Blueprints of
 * *Versatility*", "*Ongoing* Projects").
 */
export interface SwashHeading {
  before?: string;
  swash: string;
  after?: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}

/**
 * A page's search and sharing fields, merged from the CMS's SEO tab over the
 * shipped values. lib/cms/metadata.ts turns it into route metadata.
 */
export interface SeoContent {
  /** The page's own name; the layout's title template appends the brand. */
  title: string;
  description: string;
  /** The share card. Absent means the site's default card. */
  image?: ImageAsset;
  noIndex?: boolean;
}

/**
 * One annotation glued to a point IN THE PHOTOGRAPH.
 *
 * `x` and `y` are percentages of the picture, not of the frame it is seen
 * through, and the difference is the whole point of the type. The opening
 * photograph travels its full length across the section, so a pin measured
 * against the frame holds still while its subject slides out from under it.
 * Journey lays these out inside the same two transforms the image itself
 * rides, over a box measured to the image's painted rectangle — so "39.6%"
 * means the same point on the photograph at every window size and at every
 * moment of the scroll.
 *
 * Distinct from Hotspot, which is the opposite instrument: a figure staked
 * out on the FRAME, deliberately unglued from what happens to be behind it.
 */
export interface ScenePin {
  id: string;
  /** Position within the photograph, in % of its painted box. */
  x: number;
  y: number;
  title: string;
  /** Two to four bullets, one short sentence each. */
  body: string[];
  cta: Cta;
  /** The line that ties the claim to what is actually in frame. */
  evidence: string;
}

export interface HeroContent {
  heading: SwashHeading;
  /** Sits below the headline — never an eyebrow above it. */
  meta: string[];
  standfirst: string;
  primaryCta: Cta;
  scrollCue: string;
  /**
   * ONE continuous photograph for the whole opening section — the hero and
   * the impact figures share it, and it travels from its top edge to its
   * bottom edge across every viewport the section is looked at. Nothing is
   * ever tiled or repeated, so the file has to carry the full descent in a
   * single frame.
   */
  background: ImageAsset;
  /**
   * Annotations pinned to points in that photograph. They ride it, so they
   * are the hero's content rather than the impact panel's — the impact
   * figures are staked out on the frame instead. See ScenePin.
   */
  pins: ScenePin[];
}

export interface Hotspot {
  id: string;
  /** Position within the scene, in % of its box. */
  x: number;
  y: number;
  /** Big figure, e.g. "2.1 Million". */
  value: string;
  /** Unit or qualifier under the figure, e.g. "Sq. Ft." */
  unit?: string;
  title: string;
  body: string;
}

export interface ImmersiveContent {
  heading: SwashHeading;
  standfirst: string;
  hotspots: Hotspot[];
}

/** One frame of the showcase at the foot of the story section. */
export interface ConceptSlide {
  image: ImageAsset;
  /**
   * The project this frame is of. It is not drawn — the caption below is what
   * the visitor reads — but it names the frame's own control, so the dots stop
   * announcing themselves as "Frame 2 of 3" to a screen reader and start
   * announcing the project they select.
   */
  name: string;
  /** Runs under the frame, and changes with it. Keep it to one line. */
  caption: string;
}

export interface ConceptShowcaseContent {
  heading: SwashHeading;
  /** Three is what the layout is drawn for; more would work, fewer is odd. */
  slides: ConceptSlide[];
}

/** The line drawing at the head of one legacy disc. */
export type LegacyIcon = "tower" | "plan" | "family" | "crane" | "trust";

/**
 * One disc in the story section's legacy lattice — the five proofs the brand
 * guide sets as circles on CP_Final p.3, drawn rather than photographed.
 *
 * Three of them lead on a figure and two on a phrase; the disc lays itself
 * out from whichever is present, so the two shapes are one component.
 */
export interface LegacyProof {
  id: string;
  icon: LegacyIcon;
  /** The figure, counted up on arrival. Digits, with at most one decimal. */
  value?: string;
  /** Rides the figure, raised and small: "+". */
  suffix?: string;
  /** Set in the swash italic beside the figure: "years", "Sq. ft.". */
  unit?: string;
  /** Carried instead of a figure by the two discs that have none. */
  phrase?: string;
  /** The small line at the foot of the disc. Two short lines, at most. */
  note: string;
}

export interface LegacyContent {
  kicker: string;
  heading: SwashHeading;
  body: string;
  /** Five is what the three-over-two lattice is drawn for. */
  proofs: LegacyProof[];
  /** A cut-out render; it stands on the cream with no frame of its own. */
  image: ImageAsset;
}

/**
 * The mark lockup the story section opens on, in place of a headline.
 *
 * Read top to bottom it is: the brand mark, the name under it, a hairline
 * dropped from that, and the promise the hairline is pointing at.
 *
 * IT IS ONE WORD. It used to be two, split either side of the mark —
 * "Vakratunda ✦ Group" — which is why this was a pair of strings. The name is
 * Vakratunda, so the mark has nothing to sit between any more and the lockup
 * stacks instead: mark over word, on the axis the rule and the promise below
 * already stand on.
 */
export interface ConceptLockup {
  /** The name, set under the mark. One word. */
  wordmark: string;
  /**
   * The line under the rule, pre-broken. Each entry is one line and is set as
   * written: the break is composed, not left to the wrap.
   */
  caption: string[];
}

export interface ConceptContent {
  /** The section's heading, set as the brand lockup rather than as a phrase. */
  lockup: ConceptLockup;
  /**
   * One short line, set on the arc of the transition itself as it opens.
   * Decorative and hidden from the accessibility tree, so it must never carry
   * anything the lockup and body do not already say.
   */
  arcText?: string;
  body: string[];
  /** The band between the copy and the showcase: the five proofs, drawn. */
  legacy: LegacyContent;
  showcase: ConceptShowcaseContent;
}

export type ProjectStatus = "Completed" | "Ongoing" | "Upcoming";

export interface ProjectSlide {
  id: string;
  name: string;
  locality: string;
  status: ProjectStatus;
  blurb: string;
  image: ImageAsset;
}

export interface GalleryContent {
  heading: SwashHeading;
  standfirst: string;
  slides: ProjectSlide[];
  /**
   * The way out of the section and on to the whole portfolio. The landing
   * page shows the work; /projects is where it can be filtered and read at
   * length, and the section is not finished without a door to it.
   */
  cta: Cta;
}

/* --------------------------------------------------------------- practice */
/*
 * THE PRACTICE — what "people before projects" actually commits the firm to.
 *
 * It sits between the portfolio and the team, on the cream the page's second
 * arc opens, and it is the only place on the site where the commitments are
 * written down as commitments rather than implied by a finished building. The
 * portfolio above it is what was built; the team below it is who built it;
 * this is the undertaking that connects the two, which is why it may not be
 * moved to either side of them.
 *
 * THE STATEMENT IS THE SECTION'S HEADING. There is no label above it and no
 * standfirst below it — the arc that introduces the section has already said
 * what it is, and a second introduction three lines later is the same
 * sentence twice.
 *
 * EVERY PHOTOGRAPH IS SUPPLIED. Should one ever be cleared, <PortraitPlate>
 * draws a lettered plate in its box at the same ratio and nothing in the
 * layout moves — which is why `place` is carried on every frame even now
 * that none of them needs it for that.
 */

/** One frame of the closing sequence. */
export interface PracticeSlide {
  id: string;
  /** The project the frame is of. It names the slide to a screen reader, and
   *  it is what the lettered plate is drawn from until the photograph
   *  arrives — so it is a place, not a sentence. */
  place: string;
  image: ImageAsset;
  /** Set under the frame. One line: what it is and where. */
  caption: string;
}

export interface PracticeContent {
  /**
   * The section's heading, and the whole of its argument. Set in caps with
   * the swash phrase left lowercase — the brand's own device, at the one
   * size on the page where a change of case is legible as a change of voice.
   */
  statement: SwashHeading;
  /** The undertaking, in specifics. Each sentence is a thing that is done. */
  detail: string;
  /** The circular control. It points at the section immediately below. */
  cta: Cta;
  /** The line that introduces the commitments. */
  commitmentsTitle: string;
  /** What holds on every project, whatever else changes. */
  commitments: string[];
  /** The tall photograph mounted on the navy plate. */
  portrait: ImageAsset;
  /** The wide photograph the statement is set under. */
  wide: ImageAsset;
  /** The frames the section closes on. Three is what the rail is drawn for. */
  slides: PracticeSlide[];
}

/* ------------------------------------------------------------- atmosphere */
/*
 * THE SPREAD — the one section on the page where interior and exterior are
 * held in the same composition rather than shown in turn.
 *
 * FIVE NAMED POSITIONS, NOT A LIST. The layout is drawn for exactly these
 * five frames and for the shape each of them is: a wide exterior the section
 * opens against, the wall of glass that is the section's whole argument, a
 * tall threshold plate that stands off the page and overlaps the frame beside
 * it, one interior, and the exterior it closes on. An array would buy a
 * `.map()` in the component and cost the composition — a sixth photograph has
 * nowhere to stand, and swapping two of them swaps two different crops.
 *
 * EVERY PLATE IS TAGGED, AND ONLY SOME ARE CAPTIONED. The tag is the side of
 * the threshold the frame stands on, drawn small on the plate itself; the
 * note is a block of micro-copy set in the negative space the plate opens
 * beside it. Two plates have no room for a note and carry the tag alone —
 * which is the difference between a spread and a grid of captioned cards.
 */

/** One photograph in the spread, and the two pieces of type that belong to it. */
export interface AtmospherePlate {
  image: ImageAsset;
  /** Wide-tracked tag, drawn on the plate: which side of the threshold this
   *  frame stands on. "Interior", "Exterior", or both at once. */
  side: string;
  /** Micro-copy set in the negative space beside the plate. Omitted where the
   *  composition has none to give and the tag carries the frame on its own. */
  note?: string;
}

export interface AtmosphereContent {
  /** The wide-tracked label the spread opens on. */
  eyebrow: string;
  /** The claim. It used to ride the cream of the arc above this section with
   *  nothing around it; it is now the headline of the composition that argues
   *  for it, which is why the arc no longer carries a line of its own. */
  heading: SwashHeading;
  /** The one paragraph. Set into the composition, not stacked under the
   *  headline — see the canvas in Atmosphere.module.css. */
  lead: string;
  plates: {
    /** Wide exterior. The frame the section opens against, top right. */
    deck: AtmospherePlate;
    /** Interior looking out through a full-height wall of glass. The section's
     *  argument, and the only frame that contains both sides at once. */
    glass: AtmospherePlate;
    /** Tall threshold plate. The nearest object in the composition: it stands
     *  off the page and overlaps the frame to its left. */
    terrace: AtmospherePlate;
    /** Interior. Breaks the right margin. */
    lounge: AtmospherePlate;
    /** Wide exterior. The frame the section closes on. */
    garden: AtmospherePlate;
  };
  /** The line that introduces the three details. */
  detailsTitle: string;
  /** Three things done that nobody is meant to notice. */
  details: string[];
  /** The last line of the section, alone in the left margin beside the
   *  closing photograph. */
  coda: string;
}

/* ------------------------------------------------------------------- team */
/*
 * THE TEAM SHOWCASE — four slides, and each one is a different shape.
 *
 * Modelled as four named blocks rather than as an array of a union, because
 * the slideshow is not a list that grows: it is an intro, a chairman, three
 * directors and a grid of functions, in that order, and every one of them
 * carries different fields. A union would buy a `.map()` in the component and
 * cost a discriminant switch, an unreadable Payload tab, and the ability of an
 * editor to create a fifth slide the layout has no design for.
 *
 * PORTRAITS ARE NOT SUPPLIED YET. Every `portrait` below ships with an empty
 * `src` and its final alt text already written; `<PortraitPlate>` draws a
 * lettered plate in the brand's line-work wherever it finds one. Fill the
 * `src` in — the intended path is on the line above each — and the photograph
 * replaces the plate with no other edit anywhere.
 */

/** One leader. The chairman carries a quote as well; see `TeamChairman`. */
export interface TeamMember {
  id: string;
  /** Full name, honorific included, as the brand guide sets it. */
  name: string;
  title: string;
  /** The one line that says what this person is FOR. Shown on the card. */
  superpower: string;
  /** One or two lines, opened from the card's own disclosure. */
  bio: string;
  portrait: ImageAsset;
}

export interface TeamChairman extends TeamMember {
  /** Set large, in the display face, as the slide's leading element. */
  quote: SwashHeading;
  /**
   * The chairman's slide hands on to the leadership slide rather than opening
   * a disclosure, so the control says so. See the note in TeamShowcase.tsx.
   */
  ctaLabel: string;
}

/** The functions on slide four. `icon` selects a drawing in TeamIcons.tsx. */
export type TeamRoleIcon =
  | "design"
  | "operations"
  | "sales"
  | "quality"
  | "sustainability"
  | "site";

export interface TeamRole {
  id: string;
  icon: TeamRoleIcon;
  title: string;
  /** One line, from the construction philosophy or the core values. */
  descriptor: string;
}

/**
 * The copy that rides the cream field between the projects section and this
 * one — the arc's own moment, which until now carried nothing at all. It
 * belongs to the team section rather than to the page: it is the sentence
 * that introduces the team, and it should travel with them.
 */
export interface TeamInterstitial {
  heading: SwashHeading;
  subtext: string;
}

export interface TeamContent {
  /** Slide one, and the section's own <h2>. */
  heading: SwashHeading;
  standfirst: string;
  interstitial: TeamInterstitial;
  intro: {
    image: ImageAsset;
    /** Advances the slideshow to the chairman. */
    ctaLabel: string;
  };
  chairman: TeamChairman;
  leadership: TeamMember[];
  roles: TeamRole[];
  /** On every role card. */
  roleCta: Cta;
  /** On the chairman and on each leadership card. */
  bioCtaLabel: string;
}


/* --------------------------------------------------------------- ventures */
/*
 * THE JOINT VENTURES — three partnerships, one frame.
 *
 * Modelled as a short fixed list rather than as an open collection: this is
 * not the portfolio (that is `gallery`), it is the three names the group is
 * trusted by, and the layout is designed for exactly one of them at a time.
 * Each slide carries its own two measurements, because what is worth
 * measuring differs from one partnership to the next — acres in Badlapur,
 * towers in Bandra, families rehoused in a redevelopment.
 */

/** One measurement on a venture slide: a wide-tracked label over a figure. */
export interface VentureStat {
  label: string;
  /** Set in the display face, so keep it short — a figure, not a sentence. */
  value: string;
}

export interface VentureSlide {
  id: string;
  /** The partner, set large across the foot of the photograph. */
  partner: string;
  /** The line above the stats: what the partnership is, and where. */
  kicker: string;
  /** Exactly two. The layout is a pair; a third would not have a place. */
  stats: [VentureStat, VentureStat];
  blurb: string;
  cta: Cta;
  image: ImageAsset;
}

export interface VenturesContent {
  heading: SwashHeading;
  standfirst: string;
  slides: VentureSlide[];
}

/* ------------------------------------------------------------------ vihaa */
/*
 * VIHAA INTERNATIONAL SCHOOL — a joint venture, not an initiative.
 *
 * It used to be modelled as the community half of the responsibility ledger:
 * a thing built for somebody else's benefit. It is a venture the group holds
 * a stake in, so it is modelled beside `ventures` instead, and it borrows
 * that section's shapes — a name set across a photograph, and a pair of
 * label-over-value facts — so the page records it the way it records every
 * other partnership.
 *
 * THE PARTNER IS NOT NAMED. The site says "joint venture" and nothing more
 * about who with; add a fact here when that is published.
 */

export interface VihaaContent {
  /** Set across the foot of the cover. `mark` in capitals, at the ventures'
   *  partner size; `rest` in the wide-tracked label under it. */
  name: { mark: string; rest: string };
  /** The display sentence at the head of the sticky copy. */
  heading: SwashHeading;
  standfirst: string;
  /** Exactly two, as a venture slide has. */
  facts: [VentureStat, VentureStat];
  /** The group's own published sentence about the school. */
  note: string;
  /** The whole class — the frame the name stands across. */
  cover: ImageAsset;
  /** The day, in portraits. Dealt into two columns in order: left, right. */
  moments: ImageAsset[];
}

/* --------------------------------------------------------- responsibility */
/*
 * THE LEDGER — what the group owes the ground it stands on.
 *
 * ONE OBLIGATION. This section used to carry a community band built around
 * Vihaa International School; the school is a joint venture and now has its
 * own section (see `vihaa` above), so what is left here is the environmental
 * ledger alone, which is also what /sustainability sets out at length.
 *
 * THE OPENING CARRIES ONE PHOTOGRAPH. The heading alone was a slide of type,
 * so the ledger opens on planted ground, standing on the section's ground line
 * beside the claim it illustrates.
 *
 * THE PRACTICES ARE DRAWN. A commitment is a practice that holds on every
 * site, so it carries a line drawing in the same hand as LegacyIcons and
 * TeamIcons and no name beyond what it does.
 */

/** `icon` selects a drawing in ResponsibilityIcons.tsx. */
export type CommitmentIcon = "green" | "rainwater" | "waste" | "energy";

export interface Commitment {
  icon: CommitmentIcon;
  title: string;
  /** One line. What the practice actually does on a site. */
  detail: string;
}

export interface ResponsibilityContent {
  heading: SwashHeading;
  standfirst: string;
  /** The one photograph on the opening slide, standing beside the heading. */
  image: ImageAsset;
  environment: {
    /** Wide-tracked rubric set into the rule that opens the band. */
    label: string;
    /** The standard the practices are measured against. */
    lead: string;
    /** Four, in two compact ruled pairs under the community band. */
    commitments: [Commitment, Commitment, Commitment, Commitment];
  };
  /** The last line of the section, ranged right against the field's edge. */
  coda: string;
}

/** The address the site publishes: the line a visitor can act on, then the
    lines they cannot. Shared by the close and the footer. */
export interface Contact {
  email: string;
  addressLines: string[];
}

export interface FinalCtaContent {
  quote: SwashHeading;
  attribution: string;
  proofs: { title: string; body: string }[];
  primaryCta: Cta;
  contact: Contact;
}

export interface SiteContent {
  nav: { links: NavLink[]; cta: Cta };
  hero: HeroContent;
  immersive: ImmersiveContent;
  concept: ConceptContent;
  gallery: GalleryContent;
  atmosphere: AtmosphereContent;
  practice: PracticeContent;
  team: TeamContent;
  ventures: VenturesContent;
  vihaa: VihaaContent;
  responsibility: ResponsibilityContent;
  finalCta: FinalCtaContent;
  legal: string;
  /** The home page's own metadata. Its title is used whole, not templated. */
  seo: SeoContent;
}

/* ---------------------------------------------------------------- content */

export const siteContent: SiteContent = {
  nav: {
    /* FOUR ROUTES, NOT FOURTEEN. The masthead carries what a visitor arrives
       looking for; the rest of the site is grouped in the footer's map (see
       lib/navigation.ts). A bare "#team" would be dead on /about, so anything
       that IS an anchor is written root-relative and the masthead collapses
       it back to a hash while it is on the landing page. */
    links: [
      { label: "Story", href: "/#story" },
      { label: "Impact", href: "/#impact" },
      { label: "Projects", href: "/#projects" },
      { label: "Team", href: "/#team" },
    ],
    cta: { label: "Contact", href: "/#contact" },
  },

  hero: {
    // CP_Final p.1 — the brand line, verbatim.
    heading: { before: "Where ", swash: "dreams", after: " find an address" },
    // CP_Final p.4 — "Established in 1973"; "A proud member of MCHI-CREDAI".
    meta: ["Established 1973", "Mumbai · MMR", "MCHI-CREDAI"],
    // CP_Final p.4, condensed.
    standfirst:
      "Fifty years of building in Mumbai — residential, commercial and redevelopment, across the island city, the eastern and western suburbs, and Thane.",
    primaryCta: { label: "Explore the portfolio", href: "#projects" },
    // AUTHORED — the label on the cue at the foot of the opening frame. It is
    // required by HeroContent and rendered by Journey, but was missing here,
    // so the cue shipped with an empty label.
    scrollCue: "Scroll",
    background: {
      src: "/images/mainheroimage.png",
      alt: "",
      width: 1182,
      height: 1330,
    },
    // AUTHORED. Coordinates are percentages of the photograph's own frame —
    // 1182 x 1330, the same 0.889 aspect the previous file carried, so the
    // cover box Journey measures is unchanged and only the subjects moved.
    // Each pin was placed by measuring the render itself, and each sits ON
    // the thing its evidence line names: pavilion on the lit beam, lounge on
    // the seating cluster, deck on a daybed, pool in open water, skyline on
    // the lit city beyond the coping, green on the planted strip.
    //
    // THE COPY IS NOT A SPEC SHEET, AND THAT IS THE POINT. The picture is a
    // render — an unbuilt terrace standing in for the practice, not a
    // property on sale — so a pin that sold the decking would be selling
    // something that does not exist. Each one instead reads its subject as a
    // figure for Vakratunda: the frame for the founding, the seating for the
    // trust redevelopment runs on, the loungers for the families, the
    // vanishing edge for building past today, the skyline for the line on
    // CP_Final p.4 ("shaping not just skylines, but lives"), the planting for
    // what the work owes back. Every figure quoted is one already carried by
    // `immersive.hotspots` or `story.legacy`, so the metaphor never invents a
    // claim — it only gives a real one somewhere to stand.
    //
    // `evidence` keeps its job through all of it: it names what is actually
    // in frame. That is the hinge the metaphor turns on, and without it the
    // copy floats free of the picture it is pinned to.
    pins: [
      {
        id: "pavilion",
        x: 10.5,
        y: 62.2,
        title: "Rooted in Purpose",
        body: [
          "Vakratunda began in 1973 as a single vision, and has been family-led ever since.",
          "Second generation now, on the same footing the first one set.",
          "Everything that followed was arranged inside that frame.",
        ],
        cta: { label: "The practice", href: "#practice" },
        evidence:
          "Shown: the open pavilion frame — built before the room it holds.",
      },
      {
        id: "lounge",
        x: 10.0,
        y: 84.0,
        title: "Trust, Handed Over",
        body: [
          "33(7) society and cluster schemes redeveloped through MCGM and MHADA.",
          "Each one began with people handing over the place they already called home.",
          "That decision, not the drawing, is what the work is built on.",
        ],
        cta: { label: "Redevelopment", href: "#practice" },
        evidence:
          "Shown: the seating turned in on itself — a circle for talking, not a row for looking.",
      },
      {
        id: "deck",
        x: 40.0,
        y: 83.0,
        title: "Where Dreams Find an Address",
        body: [
          "2,500+ families have moved into a Vakratunda home and stayed.",
          "An address rather than a unit — the number the practice measures itself by.",
          "A run of places, and every one of them somebody’s.",
        ],
        cta: { label: "Our projects", href: "#projects" },
        evidence:
          "Shown: the loungers in a run along the water, each one lit on its own.",
      },
      {
        id: "pool",
        x: 64.0,
        y: 84.5,
        title: "Built for Tomorrow",
        body: [
          "The promise on the first page: we don’t just build for today.",
          "Fifty years in, the measure is what still stands and is still lived in.",
          "The edge is where the built stops — and the reason to keep going.",
        ],
        cta: { label: "The Vakratunda Impact", href: "#impact" },
        evidence:
          "Shown: the infinity edge, where the water runs out and the city begins.",
      },
      {
        id: "skyline",
        x: 84.0,
        y: 75.0,
        title: "Skylines, and Then Lives",
        body: [
          "2.1 million sq. ft. across the island city, both suburbs and Thane.",
          "Residential, commercial and redevelopment — with Godrej Properties and Shapoorji Pallonji among the partners.",
          "The skyline is the part you can see. It was never the point.",
        ],
        cta: { label: "The Vakratunda Impact", href: "#impact" },
        evidence:
          "Shown: the lit city beyond the coping — the visible half of the work.",
      },
      {
        id: "green",
        x: 76.0,
        y: 88.0,
        title: "What the Ground Is Owed",
        body: [
          "Aligned with IGBC and LEED guidelines, to build a greener tomorrow.",
          "Rainwater, waste and energy, specified into the drawings rather than added after.",
          "The work is measured twice: by what it gives, and by what it asks.",
        ],
        cta: { label: "Responsibility", href: "#responsibility" },
        evidence:
          "Shown: the planting that runs the full length of the terrace, holding its edge.",
      },
    ],
  },

  immersive: {
    // CP_Final p.3 — "The Vakratunda Impact".
    heading: { before: "The Vakratunda ", swash: "Impact" },
    // CP_Final p.3, verbatim.
    standfirst:
      "Each number is more than a metric, it’s a milestone built on trust, legacy, and our people-first values.",
    // All five figures: CP_Final p.3.
    hotspots: [
      {
        id: "years",
        x: 17,
        y: 34,
        value: "50+",
        unit: "years",
        title: "Of building futures",
        body: "A second-generation practice. The group was established in 1973 and has been led by the family ever since.",
      },
      {
        id: "area",
        x: 38,
        y: 62,
        value: "2.1",
        unit: "Million sq. ft.",
        title: "Developed across Mumbai",
        body: "Residential, commercial and redevelopment work spanning the island city, both suburbs and Thane.",
      },
      {
        id: "families",
        x: 59,
        y: 29,
        value: "2500+",
        unit: "families",
        title: "Moved into dream homes",
        body: "Handed over and lived in — the number the practice measures itself by.",
      },
      {
        id: "redevelopment",
        x: 77,
        y: 58,
        value: "33(7)",
        unit: "& cluster schemes",
        title: "Redevelopment completed",
        body: "Society and MHADA layout redevelopment delivered through MCGM and MHADA, with many more in the pipeline.",
      },
      {
        id: "partners",
        x: 90,
        y: 38,
        value: "2",
        unit: "national partners",
        title: "Trusted by industry giants",
        body: "Joint ventures with Godrej Properties and Shapoorji Pallonji Real Estate, among others.",
      },
    ],
  },

  concept: {
    // The section opens on the mark rather than on a phrase: the mark, and the
    // name under it (CP_Final p.1).
    lockup: {
      // CP_Final p.1. The name only — the mark above it carries the rest.
      wordmark: "Vakratunda",
      // AUTHORED, from the promise on CP_Final p.4: "to deliver more than
      // structures, to deliver belonging."
      caption: ["More than structures —", "a place to belong"],
    },
    // AUTHORED — the founding year and the market, from CP_Final p.4. It no
    // longer repeats the brand name: the lockup below it is the brand name.
    arcText: "Established 1973 · Mumbai",
    body: [
      // CP_Final p.4, verbatim.
      "Established in 1973, Vakratunda Group began as a single vision, rooted in purpose, driven by progress. Over five decades later, that vision has grown into a legacy of shaping not just skylines, but lives.",
      // CP_Final p.4, verbatim.
      "At the heart of Vakratunda lies a simple promise: to deliver more than structures, to deliver belonging. Because we don’t just build for today, we build for tomorrow.",
    ],
    // The five proofs of CP_Final p.3, drawn as the guide's own circles and
    // set against the Skygarden roof render. AUTHORED framing; every figure
    // is the one already carried by `immersive.hotspots` above.
    legacy: {
      kicker: "The record so far",
      heading: { before: "What fifty years ", swash: "add up", after: " to" },
      body: "Every figure here is a building that stands, a family that moved in, or a society that handed us the place they already called home.",
      proofs: [
        {
          id: "years",
          icon: "tower",
          value: "50",
          suffix: "+",
          unit: "years",
          note: "Of building futures, second generation",
        },
        {
          id: "area",
          icon: "plan",
          value: "2.1",
          unit: "Million sq. ft.",
          note: "Developed across Mumbai",
        },
        {
          id: "families",
          icon: "family",
          value: "2500",
          suffix: "+",
          unit: "families",
          note: "Moved into dream homes",
        },
        {
          id: "redevelopment",
          icon: "crane",
          phrase: "Redevelopment projects completed",
          note: "And many more in the pipeline",
        },
        {
          id: "partners",
          icon: "trust",
          phrase: "Trusted by industry giants",
          note: "Godrej, Shapoorji Pallonji & more",
        },
      ],
      image: {
        src: "/images/herosection2.png",
        alt: "Two Vakratunda residential towers rising over a glazed retail and office podium, with the city and its treeline behind",
        width: 3238,
        height: 2371,
      },
    },
    showcase: {
      // AUTHORED — from CP_Final p.4, "shaping not just skylines, but lives".
      heading: { before: "Enclaves ", swash: "Living." },
      // THE THREE FLAGSHIPS, and only those three. The set used to be a
      // sampler — one stock tower, one delivered building, one under
      // construction — which made the plate a slideshow of the practice. It is
      // the shortlist now, so each frame has a name and the dots below name it
      // too.
      //
      // The captions are name and locality and nothing else. Every other line
      // on this page that makes a claim can point at a page of CP_Final; these
      // three cannot yet, so they claim nothing.
      slides: [
        {
          name: "Anantaraa",
          image: {
            src: "/images/anantaraa/anantaraa.jpeg",
            alt: "Anantaraa at dusk: a slender residential tower lit floor by floor above a glazed retail podium, seen from the arterial road at its foot",
            width: 1600,
            height: 1600,
          },
          // ⚠️ The locality is the one fact missing from the repo for this
          // project. Add it here — "Anantaraa, <locality>" — to match the two
          // captions below.
          caption: "Anantaraa",
        },
        {
          name: "Vihaa Gardens",
          // ⚠️ REPLACE ART. The group's own Badlapur render, standing in until
          // the Vihaa Gardens frame arrives. Everything under
          // public/images/projects is generated placeholder art — the real
          // photography on this site is in hero/, jv/ and anantaraa/ — so a
          // stand-in has to be picked from those, not from the name that
          // matches.
          image: {
            src: "/images/jv/skygardens.png",
            alt: "A residential cluster at Badlapur photographed at blue hour, its apartments lit above planted grounds and a lit arterial road",
            width: 941,
            height: 1672,
          },
          caption: "Vihaa Gardens, Badlapur",
        },
        {
          name: "Vedanta",
          // ⚠️ REPLACE ART. The group's own Bandra tower, standing in until the
          // Vedanta frame arrives. See the note above.
          image: {
            src: "/images/hero/bkc-28.png",
            alt: "A slender residential tower in Bandra at sunset, seen from the road at its foot",
            width: 1672,
            height: 941,
          },
          caption: "Vedanta, Bandra",
        },
      ],
    },
  },

  gallery: {
    // CP_Final p.25 — "Our Projects".
    heading: { before: "Our ", swash: "Projects" },
    // AUTHORED — factual summary of pp.9-12.
    standfirst:
      "Fourteen addresses across the city, from delivered redevelopment in Bandra to a twenty-acre township in Badlapur.",
    // The section shows the portfolio; /projects is where it can be filtered,
    // sorted and read at length. Same array, more room.
    cta: { label: "View all projects", href: "/projects" },
    slides: [
      // Ongoing — CP_Final p.9.
      {
        id: "bkc-28",
        name: "BKC 28",
        locality: "Bandra",
        status: "Ongoing",
        blurb: "Under construction in the Bandra East corridor.",
        image: {
          src: "/images/hero/bkc-28.png",
          alt: "BKC 28, a slender residential tower in Bandra, illuminated at night",
          width: 1672,
          height: 941,
        },
      },
      {
        id: "godrej-skygarden",
        name: "Godrej Skygarden — Vakratunda",
        locality: "Badlapur",
        status: "Ongoing",
        blurb:
          "Part of the twenty-acre mini-township developed with Godrej Properties.",
        image: {
          src: "/images/jv/skygardens.png",
          alt: "Godrej Skygarden in Badlapur, a white mid-rise residential cluster",
          width: 941,
          height: 1672,
        },
      },
      // Upcoming — CP_Final p.10.
      {
        id: "bkc-32",
        name: "BKC 32",
        locality: "Bandra",
        status: "Upcoming",
        blurb: "Mixed-use, with retail at the podium.",
        image: {
          src: "/images/projects/bkc-32.jpg",
          alt: "BKC 32, a twin-wing tower in Bandra with a landscaped podium",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "parijat",
        name: "Parijat by Vakratunda",
        locality: "Kandivali",
        status: "Upcoming",
        blurb: "A high-rise on the western suburban corridor.",
        image: {
          src: "/images/projects/parijat.jpg",
          alt: "Parijat by Vakratunda, a tall bronze-toned residential tower in Kandivali",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "kolshet",
        name: "Kolshet Road Residences",
        locality: "Thane",
        status: "Upcoming",
        blurb: "Residential development on Kolshet Road.",
        image: {
          src: "/images/jv/shapoorji.png",
          alt: "Planned residential development on Kolshet Road, Thane",
          width: 941,
          height: 1672,
        },
      },
      {
        id: "badlapur-east",
        name: "Badlapur East",
        locality: "Badlapur",
        status: "Upcoming",
        blurb: "Next phase of the group’s Badlapur footprint.",
        image: {
          src: "/images/projects/badlapur-east.jpg",
          alt: "Planned development in Badlapur East",
          width: 1200,
          height: 1500,
        },
      },
      // Completed — CP_Final pp.11-12.
      {
        id: "bkc-28-completed",
        name: "BKC 28",
        locality: "Bandra",
        status: "Completed",
        blurb: "Delivered redevelopment in Bandra East.",
        image: {
          src: "/images/projects/bkc-28.jpg",
          alt: "BKC 28, a completed glass-and-stone tower in Bandra",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "godrej-vihaa",
        name: "Godrej Vihaa by Vakratunda",
        locality: "Badlapur",
        status: "Completed",
        blurb:
          "Delivered with Godrej Properties as part of the Badlapur township.",
        image: {
          src: "/images/projects/godrej-vihaa.jpg",
          alt: "Godrej Vihaa in Badlapur, low-rise residential blocks lit at dusk",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "dilkhush",
        name: "Vakratunda Dilkhush",
        locality: "Andheri",
        status: "Completed",
        blurb: "Society redevelopment in Andheri.",
        image: {
          src: "/images/hero/dilkhush.png",
          alt: "Vakratunda Dilkhush, a white residential building in Andheri",
          width: 1537,
          height: 1023,
        },
      },
      {
        id: "dilbahar",
        name: "Vakratunda Dilbahar",
        locality: "Santacruz",
        status: "Completed",
        blurb: "Society redevelopment in Santacruz.",
        image: {
          src: "/images/projects/dilbahar.jpg",
          alt: "Vakratunda Dilbahar in Santacruz, framed by trees",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "corporate-park",
        name: "Vakratunda Corporate Park",
        locality: "Goregaon",
        status: "Completed",
        blurb: "The group’s commercial address in Goregaon.",
        image: {
          src: "/images/projects/corporate-park.jpg",
          alt: "Vakratunda Corporate Park, a glazed commercial building in Goregaon",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "royale",
        name: "Vakratunda Royale",
        locality: "Sion",
        status: "Completed",
        blurb: "Residential redevelopment in Sion.",
        image: {
          src: "/images/projects/royale.jpg",
          alt: "Vakratunda Royale, a mid-rise residential building in Sion",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "palace",
        name: "Vakratunda Palace",
        locality: "Bhandup",
        status: "Completed",
        blurb: "Residential development in Bhandup.",
        image: {
          src: "/images/projects/palace.jpg",
          alt: "Vakratunda Palace, a sand-coloured tower in Bhandup",
          width: 1200,
          height: 1500,
        },
      },
      {
        id: "residency",
        name: "Vakratunda Residency",
        locality: "Thane",
        status: "Completed",
        blurb: "Residential development in Thane.",
        image: {
          src: "/images/projects/residency.jpg",
          alt: "Vakratunda Residency, a residential tower in Thane",
          width: 1200,
          height: 1500,
        },
      },
    ],
  },


  /* ---- The spread ------------------------------------------------------
     AUTHORED, AND NOT YET APPROVED, on the same terms as `practice` below
     it: the brief supplies the claim and nothing that stands behind it, and
     every line here is written to be the thing that stands behind it. No
     invented figures — the details named are things a drawing office
     actually decides, not warranties.

     THE PHOTOGRAPHY IS THE LIBRARY WE HAVE, NOT THE ONE THIS WANTS. Four of
     the five frames are also used by `practice`, which follows immediately;
     they are cropped to entirely different shapes here so the two sections
     read as different views of one place rather than as a repeat. When the
     shoot lands, this is the section to re-photograph first — it is the one
     that is about how the buildings feel. */
  atmosphere: {
    eyebrow: "Interior & exterior",
    /* The claim the arc above used to carry on an empty field of cream. It
       is set here instead, inside the composition that argues for it. */
    heading: {
      before: "Spaces you don’t just see — ",
      swash: "you feel",
      after: ".",
    },
    // BRIEF — supplied copy, verbatim.
    lead:
      "From facade to finish, every detail is intentional — built around how people actually live.",

    plates: {
      deck: {
        image: {
          src: "/images/skydeck.jpg",
          alt: "The rooftop sky deck at dusk: residents at the parapet with the city lit below, timber decking and a canopy behind them",
          width: 4096,
          height: 2160,
        },
        side: "Exterior",
        note: "The sky deck at the hour it was drawn for. The city is still there — it just stops being loud.",
      },
      glass: {
        image: {
          src: "/images/gallery/kids.png",
          alt: "The children’s room: a book wall and small timber furniture beside a full-height wall of glass, with the play garden and the skyline beyond it",
          width: 1537,
          height: 1023,
        },
        side: "Interior, and out",
        note: "One wall of glass, and the garden on the other side of it. The room borrows a view it does not own.",
      },
      terrace: {
        image: {
          src: "/images/gallery/restaurant.png",
          alt: "The rooftop dining terrace at sunset: a laid table set among planting, with the city framed by an opening in the wall behind the bar",
          width: 941,
          height: 1672,
        },
        side: "The threshold",
        note: "Planting brought up to the table — the outside made somewhere you sit, rather than somewhere you look at.",
      },
      lounge: {
        image: {
          src: "/images/gallery/bar.png",
          alt: "The residents’ lounge: timber panelling, leather banquettes and brass pendants over round tables",
          width: 1672,
          height: 941,
        },
        side: "Interior",
      },
      garden: {
        image: {
          src: "/images/gallery/outdoor.png",
          alt: "The landscaped garden at the foot of the tower at sunset, with lit stone seating, a lawn and a timber deck",
          width: 1672,
          height: 941,
        },
        side: "Exterior",
        note: "Dusk at the foot of the tower. The lighting was specified before the benches were.",
      },
    },

    detailsTitle: "What the detail is for",
    details: [
      "A threshold drawn so the floor inside and the deck outside meet at one level.",
      "Light warm enough at dusk that nobody reaches for a switch.",
      "Planting placed for the window it will be seen through, not for the plan.",
    ],
    coda:
      "You will not notice most of it. That is the whole of the intention — the room simply agrees with you.",
  },

  /* ---- The practice ----------------------------------------------------
     AUTHORED, AND NOT YET APPROVED. The brief supplies "people before
     projects" as a claim and nothing that stands behind it; everything below
     is written to be the thing that stands behind it, from ordinary Mumbai
     redevelopment practice. Every sentence is a commitment the firm would be
     held to, so all of it needs signing off — or replacing — before launch.
     Deliberately no invented figures: the one legal term named is the defect
     liability RERA already obliges, not a warranty of our own devising. */
  practice: {
    statement: {
      before: "Every decision here is made in a room with the families who will ",
      swash: "live with it",
      after: ".",
    },
    detail:
      "",
    cta: { label: "Meet the people behind it", href: "#team" },
    commitmentsTitle: "Held to on every project:",
    commitments: [
      "A resident committee in every design review",
      "Monthly progress, open to the whole society",
      "No handover until the last snag is closed",
    ],
    portrait: {
      src: "/images/gallery/restaurant.png",
      alt: "The rooftop dining terrace at sunset: tables laid among planting, with the city framed by an opening in the wall behind the bar",
      width: 941,
      height: 1672,
    },
    wide: {
      src: "/images/gallery/kids.png",
      alt: "The children’s room: a book wall, small timber furniture and a climbing wall, with the play garden through full-height glass",
      width: 1537,
      height: 1023,
    },
    /* THE SHARED SPACES, as a walk up the building: the garden at its foot,
       the lounge off the lobby, and the roof. The order is the ascent, which
       is why the set reads as a sequence rather than as three pictures — and
       it is the answer to the statement above it in the only currency that
       counts, which is what was actually built.

       The children's room is not in this set because it is the photograph the
       statement itself is set under: a statement about the families who will
       live with the decision, over the room built for the children in them. */
    slides: [
      {
        id: "garden",
        place: "The garden",
        image: {
          src: "/images/gallery/outdoor.png",
          alt: "The landscaped garden at the foot of the tower at sunset, with lit stone seating, a lawn and a timber deck",
          width: 1672,
          height: 941,
        },
        caption: "The garden at the foot of the tower, lit for the evening.",
      },
      {
        id: "lounge",
        place: "The lounge",
        image: {
          src: "/images/gallery/bar.png",
          alt: "The residents’ lounge: timber panelling, leather banquettes and brass pendants over round tables",
          width: 1672,
          height: 941,
        },
        caption: "The residents’ lounge, off the main lobby.",
      },
      {
        id: "skygarden-roof",
        place: "Godrej Skygarden",
        image: {
          src: "/images/skygarden6.png",
          alt: "The planted roof terrace at Godrej Skygarden, Badlapur, on the day it was handed over",
          width: 2000,
          height: 1088,
        },
        // AUTHORED — factual, from the projects list.
        caption: "Godrej Skygarden, Badlapur — the roof, on handover.",
      },
    ],
  },

  team: {
    // BRIEF — supplied copy, verbatim.
    heading: { before: "Where dreams find an ", swash: "address", after: "." },
    // BRIEF — supplied copy, verbatim.
    standfirst:
      "Spaces you don’t just see — you feel. From facade to finish, every detail is intentional — built around how people actually live.",

    /* Rides the cream of the page's second arc, between the portfolio and
       everything the arc opens onto.

       AUTHORED. It cannot be the brief's "spaces you don't just see — you
       feel": Atmosphere sets that line as its own headline one screen below,
       and the same sentence twice inside a screen of itself makes the first
       one a caption on the second. So the arc states the claim the whole of
       the cream then argues — the rooms, and then the people behind them —
       and Atmosphere answers it in its own words.

       SET FOR THE TOWER, NOT FOR THE MEASURE. Four roman words is exactly
       ArcTransition's STACK_MAX, so this stacks one word to a line and
       arrives at a short swash; a longer `swash` would set a wide italic
       line at 1.34em against single words above it and break the stack. */
    interstitial: {
      heading: {
        before: "Built for the people ",
        swash: "in them",
        after: ".",
      },
      subtext: "What that looks like, and who stands behind it.",
    },

    intro: {
      image: {
        // TO SUPPLY → /images/team/group.jpg
        src: "",
        alt: "The Vakratunda Group team photographed together at the Bandra East office",
        width: 1600,
        height: 1100,
      },
      // BRIEF — supplied copy.
      ctaLabel: "Meet the team",
    },

    chairman: {
      id: "ram-makhecha",
      // BRIEF — supplied copy.
      name: "Mr. Ram Kantilal Makhecha",
      title: "Chairman",
      // AUTHORED. The brief labelled this control "view full bio" and pointed
      // it at the leadership section; a control has to name where it goes.
      ctaLabel: "Meet the leadership",
      // BRIEF — supplied quote, verbatim. The swash falls on the word the
      // sentence turns on.
      quote: {
        before: "We don’t just build homes, we build a ",
        swash: "continuum",
        after: " of purpose, progress, and people.",
      },
      // BRIEF — supplied copy.
      superpower: "Disciplined delivery, and a people-first outlook.",
      bio: "Ram Makhecha drives the organisation with disciplined delivery and a people-first outlook.",
      portrait: {
        src: "/images/team/ram.JPG",
        alt: "Portrait — Ram Makhecha, Chairman",
        width: 7008,
        height: 4672,
      },
    },

    leadership: [
      {
        id: "khelaan-unadkat",
        // BRIEF — supplied copy.
        name: "Mr. Khelaan Manoj Unadkat",
        title: "Director",
        superpower:
          "A young, dynamic leader who adds energy and ideas to the group.",
        bio: "Khelaan brings energy and strategic ideas that help scale operations and set higher standards across projects.",
        portrait: {
          // TO SUPPLY → /images/team/khelaan-unadkat.jpg
          src: "",
          alt: "Portrait — Khelaan Unadkat, Director",
          width: 1000,
          height: 1250,
        },
      },
      {
        id: "siddhesh-tendulkar",
        // BRIEF — supplied copy.
        name: "Mr. Siddhesh Tendulkar",
        title: "Vice President, Planning & Design",
        superpower:
          "Planning and design lead, with deep redevelopment experience.",
        bio: "Siddhesh has 18 years of experience in design and execution, guiding project planning with practical, people-first design choices.",
        portrait: {
          // TO SUPPLY → /images/team/siddhesh-tendulkar.jpg
          src: "",
          alt: "Portrait — Siddhesh Tendulkar, Vice President, Planning & Design",
          width: 1000,
          height: 1250,
        },
      },
      {
        id: "naimesh-tanna",
        // BRIEF — supplied copy.
        name: "Mr. Naimesh Tanna",
        title: "Vice President, Operations",
        superpower:
          "Operations from land selection to handover; liaison and execution.",
        bio: "Naimesh handles on-ground delivery, government liaison and smooth project handovers, ensuring timelines and compliance.",
        portrait: {
          // TO SUPPLY → /images/team/naimesh-tanna.jpg
          src: "",
          alt: "Portrait — Naimesh Tanna, Vice President, Operations",
          width: 1000,
          height: 1250,
        },
      },
    ],

    /* The six functions. Every descriptor is either quoted from CP_Final or
       restates a line already carried elsewhere in this file, so the grid
       reads in the same voice as the rest of the page rather than in the
       voice of an org chart. */
    roles: [
      {
        id: "design",
        icon: "design",
        title: "Planning & Design",
        // From the planning lead's own brief: "practical, people-first
        // design choices".
        descriptor:
          "Practical, people-first design choices, settled before a line is built.",
      },
      {
        id: "operations",
        icon: "operations",
        title: "Operations",
        // Restates the operations brief above.
        descriptor:
          "Land selection to handover, with the liaison work that keeps a timeline honest.",
      },
      {
        id: "sales",
        icon: "sales",
        title: "Sales",
        // AUTHORED, against the 2500+ families figure on CP_Final p.3.
        descriptor:
          "The first conversation a family has with the place they will live in.",
      },
      {
        id: "quality",
        icon: "quality",
        title: "Quality Assurance",
        // CP_Final p.4 verbatim, plus where it is actually checked. The
        // triple ISO certification behind it is on CP_Final p.23.
        descriptor:
          "Legacy-built, future-focused and human-first — checked on site, floor by floor.",
      },
      {
        id: "sustainability",
        icon: "sustainability",
        title: "Sustainability",
        // CP_Final p.4, verbatim.
        descriptor: "Because we don’t just build for today, we build for tomorrow.",
      },
      {
        id: "site",
        icon: "site",
        title: "Site Teams",
        // AUTHORED, from the promise on CP_Final p.4: "to deliver more than
        // structures, to deliver belonging".
        descriptor:
          "The crews who turn a sanctioned drawing into somewhere to belong.",
      },
    ],

    roleCta: { label: "Contact", href: "#contact" },
    bioCtaLabel: "View full bio",
  },

  /* ---- Joint ventures ---------------------------------------------------
     Sourced from CP_Final: the partners on p.13 ("Godrej Properties and
     Shapoorji Pallonji Real Estate, among others") and the redevelopment
     mandates on p.9. The photographs are the built work each partnership
     produced, so the slide shows the venture rather than a logo. */
  ventures: {
    heading: {
      before: "Built ",
      swash: "together",
      after: "",
    },
    standfirst:
      "Three partnerships, and the ground each one covers. National developers and civic bodies bring the mandate; the group brings the site, the approvals and the delivery.",
    slides: [
      {
        id: "godrej",
        partner: "Godrej Properties",
        kicker: "Joint venture — Badlapur",
        stats: [
          { label: "Township", value: "20 acres" },
          { label: "Homes delivered", value: "1,400+" },
        ],
        blurb:
          "A twenty-acre mini-township taken from land assembly to handover — Vihaa delivered, Skygarden rising behind it.",
        cta: { label: "Explore the township", href: "#projects" },
        image: {
          src: "/images/jv/skygardens.png",
          alt: "Godrej Skygarden in Badlapur, a white mid-rise residential cluster",
          width: 941,
          height: 1672,
        },
      },
      {
        id: "shapoorji",
        partner: "Shapoorji Pallonji",
        kicker: "Joint venture — Thane",
        stats: [
          { label: "Frontage", value: "Kolshet Rd" },
          { label: "Planned", value: "3 towers" },
        ],
        blurb:
          "A residential address on Kolshet Road, developed with one of India's oldest builders — their engineering, our ground.",
        cta: { label: "See the development", href: "#projects" },
        image: {
          src: "/images/jv/shapoorji.png",
          alt: "Planned residential development on Kolshet Road, Thane",
          width: 941,
          height: 1672,
        },
      },
      {
        id: "redevelopment",
        partner: "MHADA & MCGM",
        kicker: "Redevelopment mandates — Mumbai",
        stats: [
          { label: "Societies", value: "9 rehoused" },
          { label: "Completion", value: "100%" },
        ],
        blurb:
          "Society and MHADA layout redevelopment across the western suburbs — every family returned to a better building than the one they left.",
        cta: { label: "Read the record", href: "#projects" },
        image: {
          src: "/images/hero/dilkhush.png",
          alt: "Vakratunda Dilkhush in Andheri, a completed society redevelopment",
          width: 1537,
          height: 1023,
        },
      },
    ],
  },

  /* ---- Vihaa International School ---------------------------------------
     A joint venture. The note is CP_Final verbatim; everything marked
     AUTHORED is new writing in the guide's voice and wants approving. The
     partner is deliberately not named, and nothing here states a figure —
     a year, a board, a roll — the group has not published.
     Photographed on site; captions describe what is in the frame and claim
     nothing beyond it. */
  vihaa: {
    name: { mark: "Vihaa", rest: "International School" },
    // AUTHORED.
    heading: { before: "A school the group has a ", swash: "stake", after: " in" },
    // AUTHORED.
    standfirst:
      "Vihaa International School in Badlapur is a joint venture, held the way the group holds every address that carries its name — built to a standard, and answered for long after the opening day.",
    facts: [
      { label: "Structure", value: "Joint venture" },
      { label: "Town", value: "Badlapur" },
    ],
    // CP_Final, verbatim.
    note: "A state-of-the-art institution designed to give young learners an environment worth arriving at.",
    cover: {
      src: "/images/vihaa/children.jpg",
      alt: "A class of Vihaa International School pupils in blue uniform, laughing and making peace signs on the painted play surface of the school yard.",
      width: 2560,
      height: 1707,
    },
    moments: [
      {
        src: "/images/vihaa/vihaa-3174.jpg",
        alt: "A pupil laughing as she holds a picture book up at arm's length in a bright classroom.",
        width: 1707,
        height: 2560,
        caption: "A picture book, held up to be read.",
      },
      {
        src: "/images/vihaa/vihaa-2883.jpg",
        alt: "A pupil jumping a row of yellow training hurdles in the school yard, classmates queued behind her.",
        width: 1704,
        height: 2560,
        caption: "Hurdles in the yard.",
      },
      {
        src: "/images/vihaa/vihaa-3080.jpg",
        alt: "A boy fitting wooden letter pegs into an alphabet puzzle board at a classroom table.",
        width: 1707,
        height: 2560,
        caption: "Letters, a peg at a time.",
      },
      {
        src: "/images/vihaa/vihaa-3057.jpg",
        alt: "Pupils kneeling at a raised bed, pressing soil around young plants.",
        width: 1707,
        height: 2560,
        caption: "Planting out a bed.",
      },
      {
        src: "/images/vihaa/vihaa-3198.jpg",
        alt: "Two pupils at a play kitchen, one smiling across at the other over a set of steel pots.",
        width: 1707,
        height: 2560,
        caption: "The play kitchen.",
      },
      {
        src: "/images/vihaa/vihaa-3145.jpg",
        alt: "A girl kneeling on a foam play mat, laughing as she holds up a tower of red, blue and white blocks.",
        width: 1707,
        height: 2560,
        caption: "A tower, held up for inspection.",
      },
    ],
  },

  /* CP_Final — the sustainability spread. Every sentence below is quoted from
     it or is a factual restatement of it; the lines marked AUTHORED are new
     writing in the guide's voice. */
  responsibility: {
    // AUTHORED — the concept pin's own title, "What the Ground Is Owed", so
    // the pin and the section it links to say the same thing.
    heading: { before: "What the ground is ", swash: "owed", after: "" },
    // AUTHORED.
    standfirst:
      "Fifty years in, the work is also measured by what it asks of the ground it stands on — and that is answered in the drawings, where it is still cheap to get right.",

    // A render of a Vakratunda garden podium, so the caption says so.
    image: {
      src: "/images/gallery/outdoor.png",
      alt: "The landscaped garden at the foot of the tower at sunset, with lit stone seating, a lawn and a timber deck",
      width: 1672,
      height: 941,
      caption: "Planted ground at the foot of the tower, as rendered.",
    },

    environment: {
      label: "Environment",
      // CP_Final, sustainability spread, condensed.
      lead: "Aligned with IGBC and LEED guidelines, to minimise carbon footprint and build a greener tomorrow.",
      commitments: [
        {
          icon: "green",
          title: "Green building practices",
          detail: "Eco-friendly structures that promote healthier living.",
        },
        {
          icon: "rainwater",
          title: "Rainwater harvesting",
          detail: "Water conserved to support future generations.",
        },
        {
          icon: "waste",
          title: "Waste management systems",
          detail: "Cleaner communities through responsible disposal.",
        },
        {
          icon: "energy",
          title: "Energy-efficient design",
          detail: "Smart lighting and ventilation that reduce energy use.",
        },
      ],
    },

    // CP_Final, verbatim.
    coda: "Every initiative reflects our belief that true prosperity lies in stronger, healthier and more self-reliant communities.",
  },

  finalCta: {
    // CP_Final p.16, verbatim.
    quote: {
      before:
        "When you build with values, you don’t just shape a skyline, you shape a ",
      swash: "society",
    },
    attribution: "Vakratunda Group",
    proofs: [
      {
        // CP_Final p.23.
        title: "Triple ISO certified",
        body: "9001:2015 quality, 14001:2015 environment, 45001:2018 health & safety.",
      },
      {
        // CP_Final pp.14-15.
        title: "Joint ventures that hold",
        body: "Godrej Properties and Shapoorji Pallonji Real Estate — 100% accuracy in project completion.",
      },
      {
        // CP_Final pp.3-4.
        title: "A second-generation practice",
        body: "MCHI-CREDAI member, building in Mumbai since 1973.",
      },
    ],
    primaryCta: {
      label: "Start a conversation",
      href: "mailto:info@vakratundagroup.com",
    },
    // CP_Final p.26, verbatim.
    contact: {
      email: "info@vakratundagroup.com",
      addressLines: ["Vakratunda CHS Ltd, Bandra East", "Mumbai — 400 051"],
    },
  },

  legal: "© Vakratunda Group. All rights reserved.",

  // The site's shipped title and description, editable from the Home global's
  // SEO tab. Used whole: the home page's title is not templated.
  seo: {
    title: "Vakratunda — Where dreams find an address",
    description:
      "Vakratunda Group has been building in Mumbai since 1973 — 2.1 million sq. ft. delivered, 2,500+ families moved in, and joint ventures with Godrej Properties and Shapoorji Pallonji.",
  },
};
