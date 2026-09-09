/**
 * Experiences and Hospitality.
 *
 * Two pages about the same subject from opposite ends: what it is like to
 * live in one of these buildings, and what the group does with the parts of
 * them that are not homes.
 *
 * THE PHOTOGRAPHS ARE THE LIBRARY WE HAVE, NOT THE ONE THIS WANTS — the same
 * note the landing page's `atmosphere` block carries. Four of the frames here
 * are the amenity photographs already in public/images; they are cropped to
 * different shapes than the landing page gives them so the two read as
 * different views rather than a repeat. When the shoot lands, Experiences is
 * the second page to re-photograph, after the spread.
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

export const experiencesPage: ExperiencesPageContent = {
  hero: {
    label: "Experiences",
    heading: { before: "The hours a ", swash: "home", after: " is actually for" },
    standfirst:
      "A building is judged on the ordinary evening, not the launch render. This is what the group draws for: the walk in, the hour after school, the terrace at eight.",
    meta: ["Residential", "Mumbai · MMR", "Since 1973"],
  },

  day: {
    label: "A day, in order",
    heading: { before: "From the ", swash: "morning", after: " walk to the last light" },
    standfirst:
      "Four moments the drawing office plans for by name, because they are the ones a family measures a home by once the novelty has worn off.",
    figures: [
      {
        src: "/images/gallery/outdoor.png",
        alt: "The landscaped deck of a Vakratunda development in the late afternoon, with seating under mature planting.",
        width: 1672,
        height: 941,
        caption: "The deck, late afternoon.",
      },
      {
        src: "/images/gallery/kids.png",
        alt: "Children playing on the shaded play surface of a Vakratunda residential development.",
        width: 1537,
        height: 1023,
        caption: "The play surface.",
      },
      {
        src: "/images/skydeck.jpg",
        alt: "A rooftop sky deck looking out across the Mumbai skyline at dusk.",
        width: 4096,
        height: 2160,
        caption: "The sky deck at dusk.",
      },
      {
        src: "/images/skygarden6.png",
        alt: "A landscaped sky garden between residential wings, planted along its full length.",
        width: 2000,
        height: 1088,
        caption: "The sky garden.",
      },
    ],
    items: [
      {
        id: "arrival",
        eyebrow: "07:40",
        title: "The walk out",
        body: "A lobby that is a room rather than a corridor, lifts sized for the tower's real morning peak instead of its average, and a drop-off that does not put a school run and a delivery van on the same line.",
      },
      {
        id: "afternoon",
        eyebrow: "16:15",
        title: "The hour after school",
        body: "Play space in sight of the flats that overlook it, shaded through the hottest part of the afternoon, and surfaced so a fall is a fall rather than an injury.",
      },
      {
        id: "evening",
        eyebrow: "20:00",
        title: "The terrace at eight",
        body: "The deck is planted to be used after dark, not only photographed at golden hour — lit low, screened from the road, and close enough to the lift core that a resident goes up without planning it.",
      },
      {
        id: "weekend",
        eyebrow: "Saturday",
        title: "The whole building, at once",
        body: "Common space sized for the day the building is genuinely full — a society meeting, a festival, a birthday that spills out of a flat — because that is the day the plan is tested.",
      },
    ],
  },

  standard: {
    label: "In every scheme",
    heading: { before: "What is ", swash: "standard", after: ", not optional" },
    standfirst:
      "The parts of a development that are decided once, in the drawing office, and cannot be added afterwards.",
    items: [
      {
        id: "light",
        eyebrow: "Orientation",
        title: "Daylight in every habitable room",
        body: "Wings turned against the sun path and the monsoon wind rather than against the plot boundary, so a living room is lit without being heated.",
      },
      {
        id: "air",
        eyebrow: "Ventilation",
        title: "Cross-ventilation as a plan rule",
        body: "Openings on two sides wherever the plan allows it, and lobbies that vent rather than trap — the cheapest cooling a building will ever get.",
      },
      {
        id: "landscape",
        eyebrow: "Landscape",
        title: "Planting that is specified to survive",
        body: "Species chosen for a Mumbai monsoon and a Mumbai April, with the irrigation and the soil depth drawn in at the podium stage rather than resolved on site.",
      },
      {
        id: "safety",
        eyebrow: "Safety",
        title: "Firefighting and access, drawn first",
        body: "Tender access, refuge floors and hydrant runs are set before the flat layouts are optimised, because a plan that has to be re-cut for them late is a plan that loses rooms.",
      },
    ],
  },

  coda: "Every one of these is easier to draw at the start than to add at handover, which is the only reason they are all still here fifty years in.",
  cta: { label: "See the projects", href: "/projects" },
};

export const hospitalityPage: HospitalityPageContent = {
  hero: {
    label: "Hospitality",
    heading: { before: "The ground floor is a ", swash: "public", after: " room" },
    standfirst:
      "Food and beverage space inside the group's own developments — run to the standard of the buildings above it, and to the same handover date.",
    meta: ["Food & beverage", "Retail podiums", "Mumbai · MMR"],
  },

  story: {
    heading: { before: "A building the neighbourhood can ", swash: "enter" },
    standfirst:
      "Commercial ground floors are usually let and forgotten. The group treats them as part of the address, because they are the part of it the city actually sees.",
    body: [
      "A residential tower gives the street a wall and a gate. Its podium is the only part a passer-by will ever be inside, and it sets what the whole building is taken to be — which is why the group designs, fits and operates that floor rather than handing it over as a shell.",
      "The work is deliberately narrow: dining and beverage space inside developments the group has built, where the services, the ventilation routes and the delivery access were drawn into the structure years before a tenant was found. A restaurant retrofitted into a podium that was never planned for one is a restaurant with a kitchen extract running up the front of the building.",
      "It is also the part of the portfolio with the shortest feedback loop. A society sees whether the group can run a room to a standard long before it sees whether the group can hand over a tower on the date it promised.",
    ],
    image: {
      src: "/images/gallery/restaurant.png",
      alt: "The dining room of a restaurant in a Vakratunda development, laid for service under warm pendant lighting.",
      width: 941,
      height: 1672,
      caption: "The dining room, before service.",
    },
    pullquote:
      "The ground floor is the only part of a building most of the city will ever stand in.",
  },

  offer: {
    label: "What is on offer",
    heading: { before: "Space that was ", swash: "planned", after: " to be used" },
    standfirst:
      "Four things a podium can only have if it was drawn with them in it.",
    items: [
      {
        id: "kitchen",
        eyebrow: "Services",
        title: "Kitchen services in the structure",
        body: "Extract routes, grease traps, water and power sized for a commercial kitchen at the structural stage — not chased into a slab afterwards.",
      },
      {
        id: "access",
        eyebrow: "Access",
        title: "A delivery route that is not the lobby",
        body: "Service access separated from the residential entrance, so a restaurant's morning and a resident's morning do not use the same door.",
      },
      {
        id: "acoustics",
        eyebrow: "Acoustics",
        title: "A floor slab that ends the argument",
        body: "Acoustic separation between the podium and the flats above it, specified at design stage — the single thing that decides whether a society and its tenant get along.",
      },
      {
        id: "frontage",
        eyebrow: "Frontage",
        title: "A street edge worth walking past",
        body: "Glazing, signage zones and lighting set as part of the building's elevation rather than left to whatever a tenant's contractor brings to site.",
      },
    ],
  },

  stats: [
    {
      id: "since",
      value: "1973",
      note: "Building in Mumbai, across residential, commercial and redevelopment.",
    },
    {
      id: "commercial",
      value: "2.1",
      unit: "M sq. ft.",
      note: "Delivered by the group to date, across every asset class it builds.",
    },
    {
      id: "iso",
      value: "3",
      unit: "ISO",
      note: "9001:2015 quality, 14001:2015 environment, 45001:2018 health & safety.",
    },
  ],

  coda: "The room downstairs is held to the same certificate as the tower above it, because to the person standing in it there is no difference.",
  cta: { label: "Enquire about a space", href: "/contact" },
};
