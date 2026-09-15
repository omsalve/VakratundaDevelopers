/**
 * Careers and Contact Us.
 *
 * ⚠️ THE OPEN ROLES ARE PLACEHOLDERS. The brief supplied no vacancies, so
 * `careersPage.roles.entries` describes the disciplines a practice of this
 * size runs rather than posts that are open today. Every row is a real
 * function of the group's own work — nothing here invents a department it does
 * not have — and each one routes to the office by email rather than to an
 * applicant tracking system it does not run. Replace the array when the real
 * vacancies exist, and delete this notice.
 *
 * THERE IS NO CONTACT FORM, DELIBERATELY. A form needs somewhere to post; the
 * project has no submission endpoint and no enquiries collection, and a form
 * that silently drops what a society writes into it is worse than no form at
 * all. Every channel on the contact page is therefore a real address the
 * office already reads, pre-subjected so the right person opens it. Wiring a
 * real form is a small piece of work — a Payload collection and a server
 * action — and it should be done before launch.
 *
 * The one telephone number the group has not published anywhere in the brief
 * is absent for the same reason: it is not invented here.
 */

import type { CareersPageContent, ContactPageContent } from "./types";

const OFFICE_EMAIL = "info@vakratundagroup.com";

export const careersPage: CareersPageContent = {
  seo: {
    title: "Careers",
    description:
      "Working at Vakratunda Group — a second-generation Mumbai practice where the person who drew a detail is the person who answers for it on site.",
  },

  hero: {
    label: "Careers",
    heading: { before: "A practice small enough to ", swash: "sign", after: " your own work" },
    standfirst:
      "Fifty years, two generations, and a drawing office where the person who drew a detail is still the person who answers for it on site.",
    meta: ["Mumbai · MMR", "Second generation", "Triple ISO certified"],
  },

  culture: {
    label: "How it works here",
    heading: { before: "What the ", swash: "job", after: " is actually like" },
    standfirst:
      "Four things that are true of working here, including the ones that will not suit everybody.",
    items: [
      {
        id: "ownership",
        eyebrow: "Ownership",
        title: "You will be named on your work",
        body: "Teams are small and projects are long. Nobody here hands a drawing to a department and stops thinking about it — the same office answers for a detail at design stage and at handover, years later.",
      },
      {
        id: "site",
        eyebrow: "Site",
        title: "The office and the site are the same job",
        body: "Everyone who draws goes to site, and regularly. A practice where the drawing office and the site team argue by email produces buildings that show it.",
      },
      {
        id: "pace",
        eyebrow: "Pace",
        title: "Long projects, and a real handover date",
        body: "Redevelopment runs for years and the date at the end of it is a commitment to families who have moved out of their homes. That is the pressure the work carries — and it is the reason the schedule is taken seriously rather than the reason corners get cut.",
      },
      {
        id: "scale",
        eyebrow: "Scale",
        title: "A private company, not a listed one",
        body: "Decisions are made in the building, quickly, by people you will meet in your first week. There is no quarterly cycle here, and no layer between a good idea and the person who can approve it.",
      },
    ],
  },

  stats: [
    {
      id: "since",
      value: "1973",
      note: "Continuously building in Mumbai, now under the second generation.",
    },
    {
      id: "delivered",
      value: "2.1",
      unit: "M sq. ft.",
      note: "Delivered — the work you would be joining the next phase of.",
    },
    {
      id: "families",
      value: "2500",
      suffix: "+",
      unit: "families",
      note: "Living in buildings this office drew and handed over.",
    },
  ],

  roles: {
    label: "Disciplines",
    heading: { before: "Where the group ", swash: "hires" },
    standfirst:
      "The functions the practice runs in-house. Write to us against any of them and the letter is read, whether or not a post is open that week.",
    // ⚠️ PLACEHOLDER — see the notice at the head of this file.
    entries: [
      {
        id: "role-design",
        meta: "Design",
        title: "Architects and design coordinators",
        note: "Working drawings, coordination with structural and services consultants, and the approvals sequence that goes with them. Mumbai office, with regular site.",
        href: `mailto:${OFFICE_EMAIL}?subject=Careers%20%E2%80%94%20Design`,
        action: "Apply",
      },
      {
        id: "role-site",
        meta: "Projects",
        title: "Site engineers and project managers",
        note: "Running a live site against a programme and a handover date, across residential and redevelopment work in the MMR.",
        href: `mailto:${OFFICE_EMAIL}?subject=Careers%20%E2%80%94%20Projects`,
        action: "Apply",
      },
      {
        id: "role-liaison",
        meta: "Liaison",
        title: "Approvals and liaison",
        note: "Statutory approvals, RERA filings and the sequencing between them — the discipline that decides whether a programme is a schedule or a queue.",
        href: `mailto:${OFFICE_EMAIL}?subject=Careers%20%E2%80%94%20Liaison`,
        action: "Apply",
      },
      {
        id: "role-sales",
        meta: "Sales",
        title: "Sales and society relations",
        note: "Redevelopment work means sitting with a society's committee for years. This is the role that does that, and it is not a closing job.",
        href: `mailto:${OFFICE_EMAIL}?subject=Careers%20%E2%80%94%20Sales`,
        action: "Apply",
      },
      {
        id: "role-qs",
        meta: "Commercial",
        title: "Quantity surveying and procurement",
        note: "Bills of quantities, contractor packages and the rate analysis behind them.",
        href: `mailto:${OFFICE_EMAIL}?subject=Careers%20%E2%80%94%20Commercial`,
        action: "Apply",
      },
    ],
    note: "Send a CV and, if you have one, three pages of work you would be happy to be asked about in detail. Everything received is read by someone in the discipline it was sent to.",
  },

  process: {
    label: "How we hire",
    heading: { before: "Three ", swash: "conversations", after: ", not eight" },
    standfirst:
      "The process is short because the people who decide are in the room from the start.",
    items: [
      {
        id: "hire-1",
        eyebrow: "01",
        title: "A first call",
        body: "Thirty minutes with the person who would work with you daily, about what you have actually built rather than about where you see yourself.",
      },
      {
        id: "hire-2",
        eyebrow: "02",
        title: "Work, discussed",
        body: "You walk us through a project of your own — a drawing set, a site problem, a package you priced. We ask about the decisions, not the software.",
      },
      {
        id: "hire-3",
        eyebrow: "03",
        title: "The office, and an answer",
        body: "A visit to the office and, where it makes sense, to a live site. A decision follows within a week, either way, with a reason attached to it.",
      },
    ],
  },
};

export const contactPage: ContactPageContent = {
  seo: {
    title: "Contact Us",
    description:
      "Reach Vakratunda Group's office in Bandra East — enquiries about buying, society redevelopment, land and joint development, or working with the group.",
  },

  hero: {
    label: "Contact Us",
    heading: { before: "Write to the ", swash: "office", after: ", not to a queue" },
    standfirst:
      "Every enquiry below reaches the group's own office in Bandra East. Choose the line that fits and it opens addressed to the person who can answer it.",
    meta: ["Bandra East", "Mumbai — 400 051", "MCHI-CREDAI"],
  },

  channels: {
    label: "Channels",
    heading: { before: "Pick the ", swash: "line", after: " that fits" },
    standfirst:
      "Each of these opens an email to the office with its subject already set, so it lands with the right person rather than in a general inbox.",
    entries: [
      {
        id: "buy",
        meta: "Buying",
        title: "A home, or commercial space",
        note: "Availability, floor plates, specification and the approved plan for a specific unit.",
        href: `mailto:${OFFICE_EMAIL}?subject=Enquiry%20%E2%80%94%20Buying`,
        action: "Write",
      },
      {
        id: "redevelopment",
        meta: "Societies",
        title: "Redevelopment of your society",
        note: "For committees at any stage, including the one before a general body meeting has resolved anything.",
        href: `mailto:${OFFICE_EMAIL}?subject=Enquiry%20%E2%80%94%20Society%20redevelopment`,
        action: "Write",
      },
      {
        id: "land",
        meta: "Landowners",
        title: "A plot, or a joint development",
        note: "Land in the MMR that you would like assessed for a development agreement.",
        href: `mailto:${OFFICE_EMAIL}?subject=Enquiry%20%E2%80%94%20Land%20and%20joint%20development`,
        action: "Write",
      },
      {
        id: "nri",
        meta: "From abroad",
        title: "Buying as a non-resident",
        note: "Documents, timing and the parts of the process that need you present.",
        href: `mailto:${OFFICE_EMAIL}?subject=Enquiry%20%E2%80%94%20NRI%20purchase`,
        action: "Write",
      },
      {
        id: "careers",
        meta: "Careers",
        title: "Working here",
        note: "CVs and portfolios, to the discipline you want to work in.",
        href: "/careers",
        action: "Open",
      },
      {
        id: "press",
        meta: "Media",
        title: "Press and interview requests",
        note: "Handled directly by the group rather than through an agency.",
        href: `mailto:${OFFICE_EMAIL}?subject=Press%20enquiry`,
        action: "Write",
      },
      {
        id: "grievance",
        meta: "Complaints",
        title: "A grievance about the group or this site",
        note: "The procedure, the officer it goes to, and what happens after it is logged.",
        href: "/grievance-redressal",
        action: "Read",
      },
    ],
    note: `Everything above reaches ${OFFICE_EMAIL}. There is no contact form on this site: an enquiry from a society committee is worth more than a form submission, and it is answered by a person.`,
  },

  form: {
    label: "Or write it here",
    heading: "Tell us what you need, in your own words",
    standfirst:
      "The same office, reached the other way round: fill this in and it is laid out into an email for you, addressed and titled, ready to send.",
    note: "The form does not send anything by itself. It opens the enquiry in your own mail client, so you keep a copy of exactly what you sent and we reply to an address you already use.",
  },

  office: {
    label: "The office",
    heading: { before: "Bandra ", swash: "East" },
    standfirst:
      "The group has one office and it is where the drawings are. Visitors are welcome by appointment — write first and we will confirm a time.",
    addressLines: [
      "Vakratunda Group",
      "Vakratunda CHS Ltd, Bandra East",
      "Mumbai — 400 051",
      "Maharashtra, India",
    ],
    hours: [
      "Monday to Friday, by appointment",
      "Saturday, by prior arrangement",
    ],
    image: {
      src: "/images/maps.png",
      alt: "A map of the Mumbai Metropolitan Region marking the localities the group has built in, from the island city through the western and eastern suburbs to Thane and Badlapur.",
      width: 3344,
      height: 1880,
      caption: "Where the group has built.",
    },
  },

  cta: { label: `Write to ${OFFICE_EMAIL}`, href: `mailto:${OFFICE_EMAIL}` },
};
