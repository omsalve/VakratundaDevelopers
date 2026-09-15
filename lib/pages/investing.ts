/**
 * NRI Corner and Investor Relations.
 *
 * TWO RULES RUN THROUGH BOTH PAGES.
 *
 * No number that would date. Nothing here states a tax rate, a threshold, a
 * limit or a return — not because they are hard to look up, but because a
 * marketing page that states one becomes wrong on a budget day and nobody
 * notices for a year. Both pages describe process and standing, and point at
 * the authority or the adviser for anything that has a number attached.
 *
 * No financial claim the group has not already published. The figures on the
 * investor page are the ones in lib/content.ts and nothing else: fifty years,
 * 2.1 million sq. ft., 2,500+ families, 100% accuracy in project completion.
 * There is no revenue, no IRR, no sales velocity, and no document list with a
 * dead link in it — every document row is a statement of record with its state
 * beside it, so nothing invites a click that goes nowhere.
 */

import type { InvestorsPageContent, NriPageContent } from "./types";

export const nriPage: NriPageContent = {
  seo: {
    title: "NRI Corner",
    description:
      "Buying property in Mumbai as a non-resident: the four stages of the process, what genuinely needs you present, and how the group works with buyers abroad.",
  },

  hero: {
    label: "NRI Corner",
    heading: { before: "Buying from ", swash: "abroad", after: ", without guesswork" },
    standfirst:
      "What the process actually looks like from another time zone — the parts that need you in the room, the parts that do not, and who answers when you write.",
    meta: ["Non-resident buyers", "Mumbai · MMR", "Since 1973"],
  },

  steps: {
    label: "How it goes",
    heading: { before: "Four ", swash: "stages", after: ", in order" },
    standfirst:
      "The sequence is the same as it is for a resident buyer. What changes is how each stage is executed when you are eight thousand kilometres away.",
    items: [
      {
        id: "step-1",
        eyebrow: "01",
        title: "Shortlist, remotely",
        body: "Floor plates, specification and the approved plan for a specific unit, sent as documents rather than as a brochure. A walkthrough on a call, from site, at a time that works in your timezone rather than in ours.",
      },
      {
        id: "step-2",
        eyebrow: "02",
        title: "Diligence, through your own advocate",
        body: "Title, the chain behind it, and the project's registration on the authority's own public register — checked by a lawyer you appoint, not one we introduce. We supply documents to whoever you name.",
      },
      {
        id: "step-3",
        eyebrow: "03",
        title: "Authority to sign",
        body: "Most non-resident buyers execute a specific, revocable power of attorney naming the property and the acts permitted, attested at the Indian mission where they live. Your advocate drafts it; we work to it.",
      },
      {
        id: "step-4",
        eyebrow: "04",
        title: "Payment, registration, handover",
        body: "Consideration through normal banking channels, with every remittance advice kept — that trail is what supports repatriation later. Registration and handover are then scheduled around one trip, or none.",
      },
    ],
  },

  faqs: {
    label: "Questions",
    heading: { before: "The four things people actually ", swash: "ask" },
    standfirst:
      "Answered as process, because the numbers attached to each of these change and are specific to your own circumstances.",
    items: [
      {
        id: "faq-visit",
        question: "Do I have to travel to India to buy?",
        answer: [
          "Not necessarily. Selection, diligence, negotiation and payment are documentary and are routinely completed from abroad. What is genuinely difficult remotely is anything requiring your physical presence or a biometric — and that is normally handled by a specific power of attorney executed where you live and attested at the Indian mission there.",
          "Most non-resident buyers we work with make either one trip or none. If you would rather be present for registration, we schedule around your travel instead of the other way round.",
        ],
      },
      {
        id: "faq-poa",
        question: "How should the power of attorney be drafted?",
        answer: [
          "By your own advocate, and specifically. A document that names the property and lists the acts permitted is safer than a general power over your affairs, and it should be revocable in writing on terms you have read.",
          "It is executed in the country you live in, attested at the Indian mission there, and then stamped and — where the act requires it — registered in India. We work to whatever your advocate produces; we do not supply the instrument.",
        ],
      },
      {
        id: "faq-money",
        question: "How is the money moved, and can it come back out?",
        answer: [
          "Consideration is paid through normal banking channels from the accounts a non-resident is permitted to operate, and the bank's own advices for each remittance are what later support repatriation of sale proceeds. Keep every one of them; reconstructing the trail years afterwards is unpleasant and sometimes impossible.",
          "The rules on repatriation depend on your residency status, the type of property and how long you have held it, and they are revised from time to time. Take advice from a chartered accountant on your own facts rather than on a general description — including this one.",
        ],
      },
      {
        id: "faq-after",
        question: "Who looks after the flat once it is handed over?",
        answer: [
          "The society does, once it is formed, and that is the honest answer. What the group can do is make the handover itself work from a distance: documentation sent in full, the defect liability period explained in writing, and a named person at the office who answers about the building rather than about the sale.",
          "If the flat is to be let, that is between you and an agent you appoint. We do not manage lettings, and a developer who offers to is usually selling something else.",
        ],
      },
    ],
  },

  disclaimer:
    "This page describes process only. It is not tax, legal or investment advice, no figure or threshold is stated on it for that reason, and nothing here should be relied on without advice on your own circumstances.",
  cta: { label: "Write to the office", href: "/contact" },
};

export const investorsPage: InvestorsPageContent = {
  seo: {
    title: "Investor Relations",
    description:
      "Vakratunda Group's delivery record, governance and joint venture standing — 2.1 million sq. ft. delivered since 1973, triple ISO certified, MCHI-CREDAI member.",
  },

  hero: {
    label: "Investor Relations",
    heading: { before: "Fifty years of ", swash: "delivering", after: " what was drawn" },
    standfirst:
      "The group is privately held. What follows is the record a landowner, a joint venture partner or a lender asks for before the first meeting.",
    meta: ["Privately held", "Established 1973", "MCHI-CREDAI"],
  },

  statsLabel: "The record",

  stats: [
    {
      id: "years",
      value: "50",
      suffix: "+",
      unit: "years",
      note: "Building continuously in Mumbai since 1973, now in its second generation.",
    },
    {
      id: "area",
      value: "2.1",
      unit: "M sq. ft.",
      note: "Delivered across residential, commercial and redevelopment work.",
    },
    {
      id: "families",
      value: "2500",
      suffix: "+",
      unit: "families",
      note: "Moved into buildings the group has completed and handed over.",
    },
    {
      id: "completion",
      value: "100",
      suffix: "%",
      note: "Accuracy in project completion across the joint venture portfolio.",
    },
  ],

  governance: {
    label: "Standing",
    heading: { before: "What the ", swash: "record", after: " rests on" },
    standfirst:
      "Four things that can be checked by somebody who has never met the group.",
    items: [
      {
        id: "jv",
        eyebrow: "Partners",
        title: "Joint ventures that hold",
        body: "Godrej Properties and Shapoorji Pallonji Real Estate. Both are listed-group counterparties that ran their own diligence before signing, and both have projects delivered rather than announced.",
      },
      {
        id: "iso",
        eyebrow: "Certification",
        title: "Triple ISO certified",
        body: "9001:2015 quality, 14001:2015 environment, 45001:2018 health & safety — audited annually by a third party rather than asserted.",
      },
      {
        id: "mchi",
        eyebrow: "Membership",
        title: "MCHI-CREDAI member",
        body: "The industry body for developers in the Mumbai Metropolitan Region, and the conduct code that comes with membership in it.",
      },
      {
        id: "structure",
        eyebrow: "Structure",
        title: "Second-generation, privately held",
        body: "No external equity and no listed obligations, which is why the group can hold a plot until the scheme is right — and why the material below is provided on request rather than published.",
      },
    ],
  },

  documents: {
    label: "Documentation",
    heading: { before: "Available on ", swash: "request" },
    standfirst:
      "The group is private and does not publish accounts. This is what is supplied under NDA to a counterparty in a live conversation, usually within a week of asking.",
    entries: [
      {
        id: "doc-profile",
        meta: "Profile",
        title: "Company profile and delivery record",
        note: "Every completed project, with its locality, asset class, area and date of occupation certificate.",
        state: "On request",
      },
      {
        id: "doc-financials",
        meta: "Financials",
        title: "Audited financial statements",
        note: "Supplied under non-disclosure to counterparties in a live transaction.",
        state: "Under NDA",
      },
      {
        id: "doc-jv",
        meta: "Structure",
        title: "Joint venture structures and terms",
        note: "The shape of the partnerships with Godrej Properties and Shapoorji Pallonji Real Estate.",
        state: "Under NDA",
      },
      {
        id: "doc-iso",
        meta: "Certificates",
        title: "ISO certificates and scope statements",
        note: "Current certificates for 9001:2015, 14001:2015 and 45001:2018, with their audited scopes.",
        state: "On request",
      },
      {
        id: "doc-landowner",
        meta: "Landowners",
        title: "Joint development terms for landowners",
        note: "What the group offers a landowner or a society bringing a plot into a development agreement.",
        state: "On request",
      },
    ],
    note: "No projection, valuation or return is published on this site. Anything of that kind reaches you through a named person, under an agreement, and with the assumptions attached to it.",
  },

  coda: "Everything above is supplied by a named person, in a conversation, with the assumptions attached to it.",
  cta: { label: "Open a conversation", href: "/contact" },
};
