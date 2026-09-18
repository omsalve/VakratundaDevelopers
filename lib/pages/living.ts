/**
 * Experiences and Hospitality.
 *
 * Two pages about the same subject from opposite ends: what it is like to
 * live in one of these buildings, and what the group does with the parts of
 * them that are not homes.
 *
 * THE PHOTOGRAPHS ARE HALF RE-SHOT. Two of the day's four frames are now
 * Anantaraa — the court at the hour after school, and the screening room on a
 * Saturday — and each is cast against the copy it is actually evidence for
 * rather than against the copy it happened to sit next to. Both also appear in
 * the landing page's spread, a whole page away and cropped to a different
 * shape, which is the rule this site works to: a frame repeated within a
 * screen of itself is a repeat, the same place seen twice across two pages is
 * a library.
 *
 * THE OTHER TWO ARE STILL THE OLD ART, and they are the next to go. Neither
 * 07:40 nor 20:00 has a frame that is evidence of what it claims — the walk
 * out is about a lobby and a drop-off, and there is no photograph of either.
 *
 * COPY: AUTHORED. Nothing below states a figure that is not already in
 * lib/content.ts, and nothing describes an amenity that is not visible in the
 * photograph beside it. The hospitality page in particular claims a practice,
 * not a portfolio: the group runs food and beverage space inside its own
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
      "Where homes don't just exist, they belong — the morning walk out, the hour after school, the terrace at eight, and what comes standard in every Vakratunda home.",
  },

  hero: {
    label: "Experiences",
    heading: { before: "The moments a ", swash: "home", after: " is built for" },
    standfirst:
      "A home isn't measured by its launch render, but by its ordinary evenings. This is what we design for: the walk in, the hour after school, the terrace at eight.",
    meta: ["Residential", "Mumbai · MMR", "Since 1973"],
  },

  day: {
    label: "A day, in order",
    heading: { before: "From the ", swash: "morning", after: " walk to the last light" },
    standfirst:
      "Four moments we design for by name, because long after the keys are handed over, these are the moments a family measures home by.",
    figures: [
      {
        src: siteImage("gallery/outdoor.png"),
        alt: "The landscaped deck of a Vakratunda development in the late afternoon, with seating under mature planting.",
        width: 1672,
        height: 941,
        caption: "The deck, as afternoon slows.",
      },
      {
        src: siteImage("anantaraa/basketball169.png"),
        alt: "A game under way on the lit court of a Vakratunda development in the late afternoon, with benches and a basket of balls at the near side.",
        width: 1672,
        height: 941,
        caption: "Room to play, safely.",
      },
      {
        src: siteImage("skydeck.jpg"),
        alt: "A rooftop sky deck looking out across the Mumbai skyline at dusk.",
        width: 4096,
        height: 2160,
        caption: "The sky deck, at golden hour.",
      },
      {
        src: siteImage("anantaraa/theatre169.png"),
        alt: "Residents together in the screening room of a Vakratunda development, tiered velvet seating turned to a lit screen.",
        width: 1672,
        height: 941,
        caption: "The whole building, in one room.",
      },
    ],
    items: [
      {
        id: "arrival",
        eyebrow: "07:40",
        title: "The walk out",
        body: "A lobby that welcomes rather than merely connects, lifts sized for the tower's real morning rush, and a drop-off where the school run and a delivery van never share the same line.",
      },
      {
        id: "afternoon",
        eyebrow: "16:15",
        title: "The hour after school",
        body: "Play space within sight of the homes above it, shaded through the hottest hours, and surfaced so a fall is only a fall — child-safe by design.",
      },
      {
        id: "evening",
        eyebrow: "20:00",
        title: "The terrace at eight",
        body: "The deck isn't just for golden-hour photographs, it's planted to be lived in after dark — lit low, screened from the road, and close enough to the lifts that going up needs no plan.",
      },
      {
        id: "weekend",
        eyebrow: "Saturday",
        title: "The whole community, together",
        body: "Common spaces sized for the days a building truly comes alive — a society meeting, a festival, a birthday that spills out of a home — because that is when a community is made.",
      },
    ],
  },

  standard: {
    label: "In every home",
    heading: { before: "What is ", swash: "standard", after: ", not optional" },
    standfirst:
      "The foundations of every home — decided once, at the drawing board, and built in so they never need adding later.",
    items: [
      {
        id: "light",
        eyebrow: "Orientation",
        title: "Daylight in every habitable room",
        body: "Wings turned to the sun path and the monsoon wind, not the plot boundary, so every living room is filled with light, not heat.",
      },
      {
        id: "air",
        eyebrow: "Ventilation",
        title: "Cross-ventilation as a plan rule",
        body: "Openings on two sides wherever the plan allows, and lobbies that breathe rather than trap heat — the most natural cooling a home can have.",
      },
      {
        id: "landscape",
        eyebrow: "Landscape",
        title: "Planting that is chosen to thrive",
        body: "Species selected for a Mumbai monsoon and a Mumbai April, with irrigation and soil depth planned at the podium stage, so every garden takes root for good.",
      },
      {
        id: "safety",
        eyebrow: "Safety",
        title: "Safety, always — drawn first",
        body: "Fire tender access, refuge floors and hydrant runs are set before the home layouts, in strict adherence to IS codes and NBC — safety is never an afterthought.",
      },
    ],
  },

  coda: "Built to last, designed for life — each of these is drawn in from the start, which is why our homes still feel right, five decades on.",
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
