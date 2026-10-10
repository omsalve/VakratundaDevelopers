import {
  cardSection,
  closingLine,
  cta,
  placeSection,
  stats,
  story,
} from "../../fields/pageFields";
import { pageGlobal } from "./pageGlobal";

/** Experiences and Hospitality — see lib/pages/living.ts. */

export const ExperiencesPage = pageGlobal({
  slug: "experiences-page",
  label: "Experiences",
  path: "/experiences",
  // The opening is a postcard: the photograph is the front it is lettered on.
  hero: { image: true },
  tabs: [
    {
      // Stored as `day` since the page was a day in four hours; renaming the
      // group would drop its columns, so only the labels moved on.
      label: "Postcards",
      fields: [
        cardSection("day", "The postcards", {
          figures: true,
          figuresDescription:
            "Each card's front is the photograph at its own position: the first photograph is the first card's. Six read best.",
        }),
      ],
    },
    {
      label: "Every space",
      fields: [
        placeSection(
          "spaces",
          "Every space",
          "The rack under the postcards. Mix landscape and portrait photographs freely; each keeps its own shape.",
        ),
      ],
    },
    {
      label: "In every scheme",
      fields: [cardSection("standard", "In every scheme")],
    },
    { label: "Close", fields: [closingLine(), cta()] },
  ],
});

export const HospitalityPage = pageGlobal({
  slug: "hospitality-page",
  label: "Hospitality",
  path: "/hospitality",
  tabs: [
    { label: "Story", fields: [story()] },
    { label: "Offer", fields: [cardSection("offer", "What is on offer")] },
    { label: "Record", fields: [stats(), closingLine(), cta()] },
  ],
});
