/**
 * Terms & Conditions, Disclaimer, Grievance Redressal.
 *
 * ⚠️ NOT LEGAL ADVICE, AND NOT YET APPROVED. These three documents are drafted
 * to the shape an Indian real-estate developer's site needs and in plain
 * English, but they are written by the people who built the site, not by
 * counsel. Have all three reviewed and signed off before launch. Two of them
 * additionally cannot go live as drafted:
 *
 *   1. RERA. Every project advertised on this site must carry its own RERA
 *      registration number, and the authority's website must be named beside
 *      it. The disclaimer says so; the project pages must actually do it. The
 *      numbers were not supplied with the brief and are NOT invented here.
 *
 *   2. THE GRIEVANCE OFFICER MUST BE A NAMED PERSON. The Information
 *      Technology (Intermediary Guidelines and Digital Media Ethics Code)
 *      Rules require the officer's name and contact details to be published.
 *      The document below names the ROLE and the office's real address and
 *      email, and marks the person as to be appointed — because inventing a
 *      name for a statutory officer would be worse than leaving the gap
 *      visible. Fill it in before launch.
 *
 * The address and the email are the ones already published in lib/content.ts.
 * The `updated` dates below must be re-set on the day each document is
 * approved — a "last updated" line that predates the text under it is worse
 * than none.
 */

import type { LegalPageContent } from "./types";

const OFFICE_EMAIL = "info@vakratundagroup.com";
const UPDATED = "9 September 2026";

export const termsPage: LegalPageContent = {
  hero: {
    label: "Legal",
    heading: { before: "Terms & ", swash: "Conditions" },
    standfirst:
      "The terms on which this website is made available, written to be read rather than to be scrolled past.",
    meta: ["Website terms", `Updated ${UPDATED}`, "Mumbai"],
  },

  doc: {
    updated: UPDATED,
    intro: [
      "This website is published by Vakratunda Group. By using it you accept the terms below. If you do not accept them, please stop using the site.",
      "These terms cover the website only. Any purchase of property from the group is governed by the agreement for sale and the allotment letter executed between you and the group, and nothing on this site varies those documents.",
    ],
    clauses: [
      {
        id: "use",
        heading: "Use of this site",
        body: [
          "You may read, print and share the pages of this site for your own information or for a genuine enquiry about the group's work.",
        ],
        list: [
          "Do not use the site for any unlawful purpose, or in any way that could damage, disable or impair it.",
          "Do not attempt to gain unauthorised access to the site, its server, or any system connected to it.",
          "Do not use automated means to scrape, harvest or republish its content without written permission.",
        ],
      },
      {
        id: "content",
        heading: "Content, images and plans",
        body: [
          "The renders, plans, elevations, dimensions and specifications shown on this site are indicative. They are prepared to describe a scheme, not to form part of a contract, and they may change as approvals are obtained and construction progresses.",
          "Photographs of completed projects show those projects. Photographs used to illustrate a scheme that is not yet built are identified as such wherever they appear. Furniture, landscaping and fittings shown in any image are for illustration and are not part of any offer unless they appear in your agreement.",
        ],
      },
      {
        id: "no-offer",
        heading: "Nothing here is an offer",
        body: [
          "No part of this site is an offer, an invitation to offer, or a contract of any kind. No statement on it creates any liability on the group, and no employee or agent of the group has authority to vary these terms by anything said or written outside a signed agreement.",
          "Prices, availability and payment terms, where they are discussed at all, are indicative and are confirmed only in writing at the time of booking.",
        ],
      },
      {
        id: "ip",
        heading: "Intellectual property",
        body: [
          "The name Vakratunda, the group's mark and logo, and the text, photographs, drawings and design of this site belong to the group or to its licensors, and are protected by the applicable intellectual property laws.",
          "You may quote short extracts with attribution and a link. Anything beyond that — reproduction, adaptation, or commercial use of the imagery or the mark — needs written permission first.",
        ],
      },
      {
        id: "third-party",
        heading: "Links to other sites",
        body: [
          "Where this site links to a third party — a statutory authority's register, a joint venture partner, or a publication — that link is provided for convenience. The group does not control those sites and is not responsible for their content or their privacy practices.",
        ],
      },
      {
        id: "liability",
        heading: "Liability",
        body: [
          "The site is provided on an as-is basis. The group takes reasonable care to keep it accurate and available, but does not warrant that it will be uninterrupted, error-free, or current at every moment.",
          "To the extent permitted by law, the group is not liable for any loss arising from reliance on the site's contents. Nothing in these terms limits liability for fraud, or for anything else that cannot be limited under Indian law.",
        ],
      },
      {
        id: "privacy",
        heading: "Information you send us",
        body: [
          "If you write to the group through an address published on this site, we use what you send only to answer you and to keep a record of the enquiry. We do not sell it, and we do not pass it to third parties except where the law requires it or where you have asked us to.",
          "This site does not collect personal information through a form; there is no form on it. Ask us to delete an enquiry and its correspondence at any time by writing to the address in clause 9.",
        ],
      },
      {
        id: "law",
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of India. The courts at Mumbai have exclusive jurisdiction over any dispute arising from them or from the use of this site.",
        ],
      },
      {
        id: "contact",
        heading: "How to contact us about these terms",
        body: [
          `Write to ${OFFICE_EMAIL}, or to Vakratunda Group, Vakratunda CHS Ltd, Bandra East, Mumbai — 400 051, Maharashtra, India.`,
          "We may update these terms from time to time. The date at the head of this document is the date of the version you are reading.",
        ],
      },
    ],
    closing:
      "If anything here is unclear, write and ask rather than assume — the address above reaches a person.",
    cta: { label: "Contact the office", href: "/contact" },
  },
};

export const disclaimerPage: LegalPageContent = {
  hero: {
    label: "Legal",
    heading: { before: "", swash: "Disclaimer" },
    standfirst:
      "What the material on this site is, what it is not, and where to verify a project for yourself.",
    meta: ["Project information", `Updated ${UPDATED}`, "RERA"],
  },

  doc: {
    updated: UPDATED,
    intro: [
      "This site describes the work of Vakratunda Group. It is published for information. It is not an offer, an invitation to offer, or a solicitation to buy or invest, and it does not form part of any contract.",
      "Read this page before relying on anything shown elsewhere on the site — particularly any image, plan, area or date.",
    ],
    clauses: [
      {
        id: "rera",
        heading: "RERA registration",
        body: [
          "Every project of qualifying size is registered with the Maharashtra Real Estate Regulatory Authority before it is advertised or sold. The registration number for a specific project is shown with that project and in the material issued for it.",
          "Verify it yourself on the authority's own website — maharera.maharashtra.gov.in — by searching the registration number rather than by following a link supplied with an advertisement. The register also carries the declared completion date, the sanctioned plan and the quarterly progress updates, all of which are worth more than a brochure.",
        ],
      },
      {
        id: "indicative",
        heading: "Renders, plans and specifications are indicative",
        list: [
          "Renders and artist's impressions are illustrative and are not to scale.",
          "Plans, elevations, areas and dimensions are subject to change as approvals are obtained and as construction requires.",
          "Furniture, fittings, landscaping and accessories shown in any image are for illustration only and do not form part of any offer.",
          "The specification for a unit is the one in your agreement for sale, and nothing else.",
        ],
      },
      {
        id: "areas",
        heading: "Areas",
        body: [
          "Where an area is stated on this site it is indicative and, unless expressly described otherwise, is not carpet area as defined under the Real Estate (Regulation and Development) Act. The carpet area of a specific unit is set out in the agreement for that unit.",
        ],
      },
      {
        id: "timelines",
        heading: "Dates and timelines",
        body: [
          "Any date shown on this site for a project under construction is the current expectation and is not a commitment. The date the group is bound by is the completion date declared for that project on the RERA register and in your agreement.",
        ],
      },
      {
        id: "third-party",
        heading: "Joint ventures and third parties",
        body: [
          "Some projects are developed jointly with partners, including Godrej Properties and Shapoorji Pallonji Real Estate. Where a project is a joint venture, the contracting entity for a purchase is the one named in the agreement for that project, which may not be Vakratunda Group.",
          "Names and marks belonging to third parties are used on this site only to describe a factual relationship, and remain the property of their owners.",
        ],
      },
      {
        id: "no-advice",
        heading: "Nothing here is professional advice",
        body: [
          "The explanatory material on this site — including the notes published under Blogs and the guidance in the NRI Corner — is general description of process. It is not legal, tax, financial or investment advice, it is not a substitute for advice on your own circumstances, and it may not reflect a change in the law made after the date at the head of the page.",
          "Take your own advice from your own advocate and chartered accountant before you commit to anything.",
        ],
      },
      {
        id: "accuracy",
        heading: "Accuracy",
        body: [
          "The group takes reasonable care that this site is accurate at the time of publication, and updates it as projects progress. It does not warrant that every page is current at every moment, and it accepts no liability for any loss arising from reliance on the site rather than on the documents issued for a project.",
          "If you find something on this site that is wrong, please tell us — the address below reaches a person, and errors are corrected rather than argued about.",
        ],
      },
    ],
    closing:
      "The documents issued for a project always prevail over anything on this website.",
    cta: { label: "Report something on this site", href: "/grievance-redressal" },
  },
};

export const grievancePage: LegalPageContent = {
  hero: {
    label: "Legal",
    heading: { before: "Grievance ", swash: "Redressal" },
    standfirst:
      "How to raise a complaint about the group, a project, or this website — who it goes to, and what happens after it is logged.",
    meta: ["Complaints", `Updated ${UPDATED}`, "Bandra East"],
  },

  doc: {
    updated: UPDATED,
    intro: [
      "The group would rather hear a complaint early and directly than read it somewhere else later. This page sets out how to make one, who receives it, and the timeline you can hold us to.",
      "Nothing on this page limits any right you have under the Real Estate (Regulation and Development) Act or under any other law. You may take a complaint to the regulator at any point, including instead of using this procedure.",
    ],
    clauses: [
      {
        id: "scope",
        heading: "What this procedure covers",
        list: [
          "A project: construction, specification, possession, documentation, or the conduct of anyone acting for the group.",
          "A society redevelopment: transit rent, timelines, or the development agreement's performance.",
          "This website: content that is wrong, an image used incorrectly, or an accessibility problem that stops you using a page.",
          "Data: a request to correct or delete an enquiry you sent the group.",
        ],
      },
      {
        id: "how",
        heading: "How to raise one",
        body: [
          `Write to ${OFFICE_EMAIL} with "Grievance" in the subject line, or by post to the Grievance Officer at Vakratunda Group, Vakratunda CHS Ltd, Bandra East, Mumbai — 400 051, Maharashtra, India.`,
        ],
        list: [
          "Your name, and an address or number we can reply to.",
          "The project, unit or page the complaint concerns.",
          "What happened, with dates, and what you would like done about it.",
          "Copies of anything relevant — an agreement, a letter, a photograph, a screenshot.",
        ],
      },
      {
        id: "officer",
        heading: "The Grievance Officer",
        body: [
          "Complaints are received by the group's Grievance Officer, who is responsible for acknowledging them, having them investigated, and replying to you.",
          "⚠️ The officer's name is to be appointed and published here before this site goes live, as required under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Until then, correspondence addressed to the Grievance Officer at the address above reaches the office.",
        ],
      },
      {
        id: "timeline",
        heading: "What happens, and when",
        list: [
          "Acknowledgement within 48 hours of receipt, with a reference number.",
          "An initial substantive response within 15 days, or an explanation of what is still being checked and by when.",
          "Resolution within 30 days of receipt wherever the matter is within the group's control.",
          "If a matter needs longer — a site investigation, or a third party's input — you are told why, and given a date.",
        ],
      },
      {
        id: "escalation",
        heading: "If you are not satisfied",
        body: [
          "Ask for the matter to be escalated within the group, in writing, and it will be reviewed by someone who was not involved in the original response.",
          "You may also take a project complaint to the Maharashtra Real Estate Regulatory Authority at maharera.maharashtra.gov.in, or to any other forum available to you under law. Using this procedure does not affect that right, and does not extend any limitation period that applies to it.",
        ],
      },
      {
        id: "records",
        heading: "Records",
        body: [
          "Complaints and their correspondence are retained for as long as the law requires and for as long as the matter or the project it concerns remains open. You may ask what is held about you, and ask for it to be corrected.",
        ],
      },
    ],
    closing:
      "A complaint made properly and answered properly is cheaper for everybody than one that is not — which is the only reason this page is as specific as it is.",
    cta: { label: "Write to the office", href: "/contact" },
  },
};
