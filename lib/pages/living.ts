/**
 * Experiences and Hospitality.
 *
 * Two pages about the same subject from opposite ends: what it is like to
 * live in one of these buildings, and what the group does with the parts of
 * them that are not homes.
 *
 * EXPERIENCES IS SET IN ONE LIGHT. Its photographs are renders of the group's
 * amenities, and the five that arrived together in October 2026 — the roof
 * pool, the bedroom, the balcony, the skyline gym and the fire-lit roof
 * lounge — share a single golden hour with the older Anantaraa set
 * (`anantaraa/…`) and the first gallery (`gallery/…`). That shared light is
 * what lets the page be one evening's postcards rather than a brochure of
 * unrelated places.
 *
 * EVERY CAPTION STAYS INSIDE ITS FRAME. None of these renders is tied here to
 * a named project, so no line below says which building a room is in, and
 * nothing describes an amenity that is not visible in the photograph beside
 * it. Each card is cast against the copy it is evidence for: the bedroom for
 * rest, the children's room for play, and so on.
 *
 * NO CLOCK TIMES OR DAYS. The moments used to be labelled 07:40, 16:15, 20:00
 * and Saturday until the client asked for those to go; each carries a
 * one-word name instead, which the postcards letter across their fronts.
 * "Arrival" left with the October revamp: it was about a lobby and a
 * drop-off, and there was never a photograph of either.
 *
 * COPY: AUTHORED. Nothing below states a figure that is not already in
 * lib/content.ts. The hospitality page in particular claims a practice, not a
 * portfolio: the group runs food and beverage space inside its own
 * developments, and every line is written to stay inside that.
 */

import type {
  ExperiencesPageContent,
  HospitalityPageContent,
} from "./types";
import { siteImage } from "../siteImages";

export const experiencesPage: ExperiencesPageContent = {
  seo: {
    title: "Experiences",
    description:
      "Homes designed around everyday life — the room you come home to, the play space, the roof and the rooms a community shares — and what comes standard in every Vakratunda home.",
  },

  hero: {
    label: "Experiences",
    heading: { before: "The moments a ", swash: "home", after: " is built for" },
    standfirst:
      "A home is judged by everyday life, not by its launch render. So that is what we design for: the room you come home to, the play downstairs, the roof shared with neighbours.",
    meta: ["Residential", "Mumbai · MMR", "Since 1973"],
    image: {
      src: siteImage("gallery/roof-pool.png"),
      alt: "A rooftop pool at sunset: timber decking, two loungers and a lit planted wall beside the water, with the city skyline beyond a glass balustrade.",
      width: 1489,
      height: 1056,
    },
  },

  /* The postcards. A card's front is the figure at its own position, so the
     two lists are edited together: the bedroom is Rest because it is first. */
  day: {
    label: "Moments we design for",
    heading: { before: "From your own room to the ", swash: "roof", after: "" },
    standfirst:
      "Six moments we design for by name — long after handover, they are how a family measures home.",
    figures: [
      {
        src: siteImage("gallery/bedroom.png"),
        alt: "A bedroom at sunset: an upholstered headboard under a misty forest mural and a glass chandelier, with full-height glass opening onto a planted balcony.",
        width: 1672,
        height: 941,
        caption: "The bedroom, as the sun goes down.",
      },
      {
        src: siteImage("gallery/balcony.png"),
        alt: "A private balcony at sunset: a woven lounge chair, a footstool and potted palms on timber decking, behind a glass balustrade high above the city.",
        width: 1482,
        height: 1061,
        caption: "A private balcony, open to the city.",
      },
      {
        src: siteImage("gallery/skyline-gym.png"),
        alt: "A residents’ gym at dusk: treadmills, a stair climber and racked dumbbells along a full-height wall of glass, with the skyline and the setting sun beyond.",
        width: 1492,
        height: 1054,
        caption: "The residents’ gym, along its wall of glass.",
      },
      {
        src: siteImage("gallery/kids.png"),
        alt: "The children’s room: a book wall and small timber furniture beside a climbing wall, with the play garden through full-height glass.",
        width: 1537,
        height: 1023,
        caption: "The children’s room and its play garden.",
      },
      {
        src: siteImage("anantaraa/theatre169.png"),
        alt: "The residents’ screening room: tiered velvet sofas lit from beneath, ribbed acoustic walls and a fibre-optic ceiling, turned to a lit screen.",
        width: 1672,
        height: 941,
        caption: "The screening room, lit for a film.",
      },
      {
        src: siteImage("gallery/roof-lounge.png"),
        alt: "A rooftop lounge at dusk: deep sofas around a glass-cased fire table and candles, with planting lit from below and the sun setting over the city.",
        width: 1488,
        height: 1057,
        caption: "The roof lounge, by firelight.",
      },
    ],
    items: [
      {
        id: "rest",
        eyebrow: "Rest",
        title: "A room that keeps the evening",
        body: "Full-height glass to the balcony, planting just beyond it, and a room laid out so the last of the light reaches the bed before the lamps do.",
      },
      {
        id: "outlook",
        eyebrow: "Outlook",
        title: "Your own share of the sky",
        body: "A balcony deep enough for a chair, a footstool and a pot of palms, with glass rather than a wall at its edge — so the city stays in view.",
      },
      {
        id: "move",
        eyebrow: "Move",
        title: "A gym with the skyline in it",
        body: "Cardio along a wall of glass and free weights racked and ready — a gym in the building, so the habit never depends on the commute.",
      },
      {
        id: "play",
        eyebrow: "Play",
        title: "A room of their own",
        body: "Built for the youngest residents: a wall of books, furniture sized for them, a wall to climb — and the play garden just past the glass.",
      },
      {
        id: "community",
        eyebrow: "Community",
        title: "The whole community, together",
        body: "Common rooms sized for the days a building comes alive — a film night for the whole society, a birthday that spills out of a home. That is how a community is made.",
      },
      {
        id: "unwind",
        eyebrow: "Unwind",
        title: "A roof made for evenings",
        body: "Deep sofas, a fire table and planting lit from below — a terrace built to be lived on, not just photographed, and only a lift ride from home.",
      },
    ],
  },

  /* The rack. Every other shared space in the gallery, each once. The two
     portrait frames lead their columns, which is what lets the rack balance
     at three columns: portrait-and-landscape, twice, beside four landscapes. */
  spaces: {
    label: "Every space",
    heading: { before: "Shared by ", swash: "everyone", after: " who lives here" },
    standfirst:
      "Gardens, courts, pools and common rooms — planned into the building from the start, never added to it later.",
    figures: [
      {
        name: "The roof terrace",
        src: siteImage("anantaraa/terrace916.png"),
        alt: "The roof terrace at sunset: residents in low seating and on an open lawn between planted beds and timber canopies, with the lit city and the hills below the parapet.",
        width: 941,
        height: 1672,
        caption: "A lawn, low seating and timber canopies above the city.",
      },
      {
        name: "The garden",
        src: siteImage("gallery/outdoor.png"),
        alt: "The landscaped garden at the foot of the tower at sunset, with lit stone seating, a lawn and a timber deck.",
        width: 1672,
        height: 941,
        caption: "Lit stone seating, a lawn and a deck at the tower’s foot.",
      },
      {
        name: "The dining terrace",
        src: siteImage("gallery/restaurant.png"),
        alt: "The rooftop dining terrace at sunset: tables laid among planting, with the city framed by an opening in the wall behind the bar.",
        width: 941,
        height: 1672,
        caption: "Tables laid among planting, the city beyond the bar.",
      },
      {
        name: "The court",
        src: siteImage("anantaraa/basketball169.png"),
        alt: "The lit court at the foot of the tower at sunset: a game under way, benches and a basket of balls at the near side, mature planting behind the screen.",
        width: 1672,
        height: 941,
        caption: "Lit for a game, with benches at the courtside.",
      },
      {
        name: "The pool",
        src: siteImage("gallery/pool169.png"),
        alt: "A pool at dusk beside a residential tower: lit water between a planted wall and the building, with palms, loungers and umbrellas along its edge.",
        width: 2560,
        height: 1440,
        caption: "Lit water beside the tower, loungers along its edge.",
      },
      {
        name: "The fitness deck",
        src: siteImage("anantaraa/outgym169.png"),
        alt: "The open-air fitness deck on the roof at sunset: equipment on a coloured track beside timber decking and lit planters, a resident at the parapet with the skyline beyond.",
        width: 1672,
        height: 941,
        caption: "Open-air equipment on the roof, beside the planting.",
      },
      {
        name: "The gym by the pool",
        src: siteImage("anantaraa/gym169.png"),
        alt: "The residents’ gym: treadmills and weights ranged along a full-height wall of glass, with the podium garden, the pool and the sunset beyond it.",
        width: 1672,
        height: 941,
        caption: "Treadmills and weights along a wall of glass.",
      },
      {
        name: "The residents’ lounge",
        src: siteImage("gallery/bar.png"),
        alt: "The residents’ lounge: timber panelling, leather banquettes and brass pendants over round tables.",
        width: 1672,
        height: 941,
        caption: "Timber panelling, leather banquettes, brass pendants.",
      },
    ],
  },

  standard: {
    label: "In every home",
    heading: { before: "What is ", swash: "standard", after: ", not optional" },
    standfirst:
      "Decided at the drawing board and built in from the start — never added later.",
    items: [
      {
        id: "light",
        eyebrow: "Orientation",
        title: "Daylight in every habitable room",
        body: "Wings turned to the sun and the monsoon wind, not the plot line — so living rooms fill with light, not heat.",
      },
      {
        id: "air",
        eyebrow: "Ventilation",
        title: "Cross-ventilation as a rule",
        body: "Openings on two sides wherever the plan allows, and lobbies that breathe instead of trapping heat — the most natural cooling there is.",
      },
      {
        id: "landscape",
        eyebrow: "Landscape",
        title: "Planting chosen to thrive",
        body: "Species picked for Mumbai's monsoon and summer heat, with irrigation and soil depth planned at the podium stage — so gardens take root for good.",
      },
      {
        id: "safety",
        eyebrow: "Safety",
        title: "Safety, drawn first",
        body: "Fire-tender access, refuge floors and hydrant lines are planned before the homes, to IS codes and the NBC. Safety is never an afterthought.",
      },
    ],
  },

  coda: "Built to last, designed for life — which is why our homes still feel right, five decades on.",
  cta: { label: "Explore our addresses", href: "/projects" },
};

export const hospitalityPage: HospitalityPageContent = {
  seo: {
    title: "Hospitality",
    description:
      "Food and beverage spaces inside Vakratunda's own developments — designed into the podium from the structural stage, and run with the same care as the homes above.",
  },

  hero: {
    label: "Hospitality",
    heading: { before: "A ground floor with ", swash: "open", after: " doors" },
    standfirst:
      "Food and beverage spaces inside our own developments — run with the same care as the homes above them, and delivered on the same date.",
    meta: ["Food & beverage", "Retail podiums", "Mumbai · MMR"],
  },

  story: {
    label: "Our approach",
    heading: { before: "A building the neighbourhood can ", swash: "enter" },
    standfirst:
      "Commercial ground floors are too often let and forgotten. We treat them as part of the address, because they are the part the whole city gets to experience.",
    body: [
      "A residential tower gives the street a wall and a gate. Its podium is the only part a passer-by will ever step inside, and it shapes how the whole building is remembered — which is why we design, fit and operate that floor rather than handing it over as a shell.",
      "Our focus is deliberately narrow: dining and beverage spaces inside developments we have built, where services, ventilation routes and delivery access were planned into the structure years before a tenant arrived. A restaurant squeezed into a podium never planned for one is a restaurant with a kitchen extract running up the front of the building.",
      "It is also where trust is earned fastest. A society sees whether we can run a single room with care long before it sees us hand over an entire tower on the date we promised.",
    ],
    image: {
      src: siteImage("gallery/restaurant.png"),
      alt: "The dining room of a restaurant in a Vakratunda development, laid for service under warm pendant lighting.",
      width: 941,
      height: 1672,
      caption: "The dining room, set for its guests.",
    },
    pullquote:
      "The ground floor is where a building doesn't just meet the street — it welcomes the city.",
  },

  offer: {
    label: "What is on offer",
    heading: { before: "Space that was ", swash: "planned", after: " to be used" },
    standfirst:
      "Four things a podium can only offer if they were part of its blueprint.",
    items: [
      {
        id: "kitchen",
        eyebrow: "Services",
        title: "Kitchen services in the structure",
        body: "Extract routes, grease traps, water and power sized for a commercial kitchen from the structural stage — built in, never chased into a slab later.",
      },
      {
        id: "access",
        eyebrow: "Access",
        title: "A delivery route that is not the lobby",
        body: "Service access kept apart from the residential entrance, so a restaurant's morning never crowds a resident's welcome home.",
      },
      {
        id: "acoustics",
        eyebrow: "Acoustics",
        title: "A floor slab that keeps the peace",
        body: "Acoustic separation between the podium and the homes above it, specified at the design stage — the one detail that lets a society and its tenant live as good neighbours.",
      },
      {
        id: "frontage",
        eyebrow: "Frontage",
        title: "A street edge worth walking past",
        body: "Glazing, signage and lighting designed as part of the building's elevation, so the street edge carries the same care as every floor above.",
      },
    ],
  },

  stats: [
    {
      id: "since",
      value: "1973",
      note: "Building futures in Mumbai — residential, commercial and redevelopment.",
    },
    {
      id: "commercial",
      value: "2.1",
      unit: "M sq. ft.",
      note: "Developed to date, across every kind of space we build.",
    },
    {
      id: "iso",
      value: "3",
      unit: "ISO",
      note: "9001:2015 quality, 14001:2015 environment, 45001:2018 health & safety.",
    },
  ],

  coda: "The room downstairs is held to the same standard as the tower above it — because every brick we lay carries the same promise.",
  cta: { label: "Enquire about a space", href: "/contact" },
};
