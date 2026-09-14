import {
  cardSection,
  closingLine,
  cta,
  faqSection,
  ledgerSection,
  stats,
} from "../../fields/pageFields";
import { pageGlobal } from "./pageGlobal";

/** NRI Corner and Investor Relations — see lib/pages/investing.ts. */

export const NriPage = pageGlobal({
  slug: "nri-page",
  label: "NRI Corner",
  path: "/nri-corner",
  tabs: [
    { label: "Stages", fields: [cardSection("steps", "How it goes")] },
    {
      label: "Questions",
      fields: [
        faqSection("faqs", "Questions"),
        closingLine("disclaimer", "Disclaimer"),
        cta(),
      ],
    },
  ],
});

export const InvestorsPage = pageGlobal({
  slug: "investors-page",
  label: "Investor Relations",
  path: "/investors",
  tabs: [
    {
      label: "Record",
      fields: [
        { name: "statsLabel", type: "text", label: "Rubric" },
        stats(),
      ],
    },
    { label: "Standing", fields: [cardSection("governance", "Standing")] },
    {
      label: "Documents",
      fields: [
        ledgerSection("documents", "Documentation"),
        closingLine(),
        cta(),
      ],
    },
  ],
});
