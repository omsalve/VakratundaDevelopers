import { cardSection, closingLine, cta, story } from "../../fields/pageFields";
import { pageGlobal } from "./pageGlobal";

/** About, Our Projects and Sustainability — see lib/pages/standing.ts. */

export const AboutPage = pageGlobal({
  slug: "about-page",
  label: "About",
  path: "/about",
  tabs: [
    { label: "Story", fields: [story()] },
    {
      label: "Principles",
      fields: [
        cardSection("principles", "Principles", { withRubric: false }),
      ],
    },
  ],
});

export const ProjectsPage = pageGlobal({
  slug: "projects-page",
  label: "Our Projects",
  path: "/projects",
  tabs: [
    {
      label: "Field",
      description:
        "The projects themselves are edited in the Projects collection. This is the chrome around them.",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "filterLabel",
              type: "text",
              label: "Filter rubric",
              admin: { width: "50%", placeholder: "Filter by stage" },
            },
            {
              name: "allLabel",
              type: "text",
              label: "Unfiltered option",
              admin: { width: "50%", placeholder: "All projects" },
            },
          ],
        },
        {
          name: "emptyMessage",
          type: "text",
          label: "Shown when a stage has no projects",
        },
        closingLine("note", "Small print under the field"),
      ],
    },
  ],
});

export const SustainabilityPage = pageGlobal({
  slug: "sustainability-page",
  label: "Sustainability",
  path: "/sustainability",
  tabs: [
    {
      label: "Environment",
      fields: [
        cardSection("environment", "Environment", {
          icons: true,
          standfirst: "lead",
        }),
      ],
    },
    { label: "Close", fields: [closingLine(), cta()] },
  ],
});
