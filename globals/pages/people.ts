import {
  cardSection,
  ledgerSection,
  sectionHead,
  stats,
} from "../../fields/pageFields";
import { textLines } from "../../fields/swashHeading";
import { pageGlobal } from "./pageGlobal";

/** Careers and Contact Us — see lib/pages/people.ts. */

export const CareersPage = pageGlobal({
  slug: "careers-page",
  label: "Careers",
  path: "/careers",
  tabs: [
    {
      label: "Culture",
      fields: [cardSection("culture", "How it works here"), stats()],
    },
    { label: "Roles", fields: [ledgerSection("roles", "Disciplines")] },
    { label: "Hiring", fields: [cardSection("process", "How we hire")] },
  ],
});

export const ContactPage = pageGlobal({
  slug: "contact-page",
  label: "Contact Us",
  path: "/contact",
  tabs: [
    { label: "Channels", fields: [ledgerSection("channels", "Channels")] },
    {
      label: "Form",
      description:
        "The form opens an email to the contact address in the Home global's Contact tab.",
      fields: [
        {
          name: "form",
          type: "group",
          label: " ",
          fields: [
            { name: "label", type: "text", label: "Rubric" },
            // A plain sentence here, not a swash headline: the form band sets
            // its heading at a reading size.
            { name: "heading", type: "text", label: "Headline" },
            { name: "standfirst", type: "textarea", label: "Standfirst" },
            {
              name: "note",
              type: "textarea",
              label: "Small print under the form",
            },
          ],
        },
      ],
    },
    {
      label: "Office",
      fields: [
        {
          name: "office",
          type: "group",
          label: " ",
          fields: [
            ...sectionHead(),
            textLines("addressLines", "Address"),
            textLines("hours", "Visiting hours"),
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "Map",
            },
            { name: "imageCaption", type: "text", label: "Map caption" },
          ],
        },
      ],
    },
  ],
});
