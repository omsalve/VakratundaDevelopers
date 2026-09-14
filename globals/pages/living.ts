import {
  cardSection,
  closingLine,
  cta,
  stats,
  story,
} from "../../fields/pageFields";
import { pageGlobal } from "./pageGlobal";

/** Experiences and Hospitality — see lib/pages/living.ts. */

export const ExperiencesPage = pageGlobal({
  slug: "experiences-page",
  label: "Experiences",
  path: "/experiences",
  tabs: [
    {
      label: "A day",
      fields: [cardSection("day", "A day, in order", { figures: true })],
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
