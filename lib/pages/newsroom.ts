/**
 * Press Room, Awards and Blogs.
 *
 * ⚠️ THE COVERAGE AND THE AWARDS BELOW ARE PLACEHOLDERS. Read this before
 * launch.
 *
 * A press cutting and an award are claims about what a third party did. The
 * brief supplied neither, so every entry in `pressPage.coverage` and
 * `awardsPage.awards` is a SHAPE, not a record: the mastheads and the awarding
 * bodies are invented, and no real publication or institution is named,
 * precisely so that nothing here can be read as a false attribution while it
 * waits to be replaced. Swap the arrays for the real cuttings and citations —
 * one edit each, same fields — and delete this notice.
 *
 * Two things are deliberate in how they render until then:
 *   - No entry carries an `href`. Nothing on either page invites a click that
 *     goes nowhere, and a cutting that exists only in print says so.
 *   - The awards page leads on the CERTIFICATIONS, which are real and are
 *     already in lib/content.ts (triple ISO, MCHI-CREDAI). If the awards array
 *     were emptied tomorrow, the page would still stand up.
 *
 * The three articles are AUTHORED and are general explanation, not advice.
 * They state process, not numbers: no rate, threshold or timeline that would
 * date or that a reader could act on unadvised appears in any of them.
 */

import type {
  AwardsPageContent,
  BlogPageContent,
  BlogPost,
  PressPageContent,
} from "./types";

export const pressPage: PressPageContent = {
  seo: {
    title: "Press Room",
    description:
      "Stories of Vakratunda Group's projects and partnerships, Vihaa International School among them — and direct contacts for media enquiries.",
  },

  hero: {
    label: "Press Room",
    heading: { before: "Our legacy, as it was ", swash: "printed" },
    standfirst:
      "Stories of our work, and the quickest way for a journalist to reach someone who knows the story first-hand.",
    meta: ["Media relations", "Mumbai · MMR", "MCHI-CREDAI"],
  },

  coverage: {
    label: "Coverage",
    heading: { before: "What has been ", swash: "written" },
    standfirst:
      "Selected stories of our projects and partnerships, Vihaa International School among them.",
    // ⚠️ PLACEHOLDER — see the notice at the head of this file.
    entries: [
      {
        id: "coverage-1",
        meta: "March 2025",
        title: "Fifty years of redevelopment on the western line",
        note: "Mumbai Realty Review — a survey of society redevelopment in the suburbs, with the group's Andheri and Santacruz work among the examples.",
        state: "Print",
      },
      {
        id: "coverage-2",
        meta: "November 2024",
        title: "Township delivery in the extended MMR",
        note: "The Property Standard — on the twenty-acre Badlapur development built with Godrej Properties.",
        state: "Print",
      },
      {
        id: "coverage-3",
        meta: "August 2024",
        title: "What a joint venture actually buys a landowner",
        note: "Metro Build Weekly — a feature on development partnerships in the MMR.",
        state: "Print",
      },
      {
        id: "coverage-4",
        meta: "February 2024",
        title: "Why a developer takes a stake in a school",
        note: "Western Suburbs Herald — on Vihaa International School in Badlapur.",
        state: "Print",
      },
    ],
    note: "Cuttings are kept at our Bandra East office and can be shared on request.",
  },

  enquiries: {
    heading: { before: "Talk to someone who can ", swash: "answer" },
    standfirst:
      "We handle media enquiries ourselves, not through an agency — so every reply comes from someone who has lived the project.",
    entries: [
      {
        id: "media",
        meta: "Media",
        title: "Press and interview requests",
        note: "Project details, imagery, and interviews with our leadership.",
        href: "mailto:info@vakratundagroup.com?subject=Press%20enquiry",
        action: "Write",
      },
      {
        id: "assets",
        meta: "Assets",
        title: "Photography and project fact sheets",
        note: "High-resolution imagery and the current specification for any named project.",
        href: "mailto:info@vakratundagroup.com?subject=Press%20asset%20request",
        action: "Request",
      },
      {
        id: "sustainability",
        meta: "Sustainability",
        title: "Sustainability practice",
        note: "The four practices woven into every site we build.",
        href: "/sustainability",
        action: "Read",
      },
    ],
  },
};

export const awardsPage: AwardsPageContent = {
  seo: {
    title: "Awards",
    description:
      "Vakratunda Group holds ISO 9001:2015, 14001:2015 and 45001:2018 certification and builds as an MCHI-CREDAI member, alongside recognition for its residential, redevelopment and joint venture work.",
  },

  hero: {
    label: "Awards",
    heading: { before: "Not just badges, but a ", swash: "promise", after: " kept" },
    standfirst:
      "Quality isn't a milestone, it's the mindset behind every brick we lay. We hold three ISO standards and build as a member of MCHI-CREDAI.",
    meta: ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018"],
  },

  awards: {
    label: "Recognition",
    heading: { before: "Awards and ", swash: "citations" },
    standfirst:
      "Recognition for our residential, redevelopment and community work.",
    // ⚠️ PLACEHOLDER — see the notice at the head of this file.
    entries: [
      {
        id: "award-1",
        meta: "2025",
        title: "Redevelopment Project of the Year",
        note: "MMR Developer Forum — for a society redevelopment in the western suburbs.",
        state: "Citation",
      },
      {
        id: "award-2",
        meta: "2024",
        title: "Excellence in Township Development",
        note: "Western India Realty Awards — for the Badlapur township.",
        state: "Citation",
      },
      {
        id: "award-3",
        meta: "2023",
        title: "Education Project of the Year",
        note: "Mumbai Build Excellence — for Vihaa International School.",
        state: "Citation",
      },
    ],
    note: "Citations are kept at our Bandra East office and can be verified on request.",
  },

  certifications: {
    label: "Certification",
    heading: { before: "The part that is ", swash: "audited" },
    standfirst:
      "Four standings we hold continuously — ethically, safely and responsibly, and each one checked from outside.",
    items: [
      {
        id: "iso-9001",
        eyebrow: "ISO 9001:2015",
        title: "Quality management",
        body: "Standardised processes that turn a drawing into a building, documented and audited — the discipline behind our 100% record in project completion.",
      },
      {
        id: "iso-14001",
        eyebrow: "ISO 14001:2015",
        title: "Environmental management",
        body: "Sustainable practices on every site, minimising environmental impact and aligned with the IGBC and LEED guidelines we design to.",
      },
      {
        id: "iso-45001",
        eyebrow: "ISO 45001:2018",
        title: "Occupational health & safety",
        body: "Protecting people is non-negotiable — for every worker, visitor and staff member on our sites.",
      },
      {
        id: "mchi",
        eyebrow: "MCHI-CREDAI",
        title: "A member in good standing",
        body: "The industry body for developers in the Mumbai Metropolitan Region, and the code of conduct that comes with membership.",
      },
    ],
  },

  coda: "An award celebrates a good year. A certificate is earned again every year — and that is the promise we would rather keep.",
};

export const blogPage: BlogPageContent = {
  seo: {
    title: "Blogs",
    description:
      "Stories and guidance from Vakratunda on society redevelopment, reading a RERA registration, and finding a home in India from abroad.",
  },

  hero: {
    label: "Blogs",
    heading: { before: "Notes from the ", swash: "drawing", after: " board" },
    standfirst:
      "Answers to what families ask us most — redevelopment, regulation and buying from abroad — shared with the same transparency we build with.",
    meta: ["Redevelopment", "Regulation", "NRI buyers"],
  },

  listing: {
    label: "Writing",
    heading: { before: "Everything ", swash: "published", after: " so far" },
    standfirst:
      "Three pieces, each answering a question families bring to us most weeks.",
  },

  note: "These notes are general explanation of process, written by our own team. They are not legal, tax or investment advice, and they are not a substitute for taking advice on your own circumstances.",

  article: {
    contentsLabel: "In this note",
    updatedLabel: "Published",
    byline: ["Vakratunda Group", "Notes"],
    backCta: { label: "Read the other notes", href: "/blogs" },
  },
};

/**
 * The shipped articles. They render on /blogs and /blogs/[slug] while the
 * `posts` collection has nothing published, and never alongside it.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "how-society-redevelopment-actually-works",
    date: "12 August 2025",
    category: "Redevelopment",
    readingTime: "6 min read",
    title: "How society redevelopment actually works",
    swashTitle: {
      before: "How society redevelopment ",
      swash: "actually",
      after: " works",
    },
    excerpt:
      "The journey a housing society takes from its first general body meeting to the day its members come home — and the four points where it usually stalls.",
    image: {
      src: "/images/projects/dilbahar.jpg",
      alt:
        "A completed redevelopment on a suburban plot, the new building standing on the footprint of the society that resolved to rebuild it.",
      width: 1600,
      height: 2000,
    },
    body: [
      {
        id: "why",
        heading: "Why a society redevelops at all",
        body: [
          "Most of the buildings being redeveloped in Mumbai today were built in an era of different structural codes, different services and, crucially, a different idea of how much space a family needs. They are not usually dangerous. They are usually expensive to keep standing, hard to insure, and impossible to upgrade one flat at a time.",
          "Redevelopment turns that problem into a new beginning: the plot's unused development potential pays for a new building, and existing members get a larger home in it without writing a cheque. Everything difficult about the process follows from the fact that this is true, but takes years.",
        ],
      },
      {
        id: "sequence",
        heading: "The sequence, in order",
        list: [
          "The society resolves to explore redevelopment at a general body meeting, and appoints a project management consultant to advise it.",
          "Members' entitlements — the carpet area each existing flat is owed in the new building — are established before any developer is shortlisted.",
          "Developers are invited to offer against that brief, and the society selects one at a special general body meeting with the majority its bye-laws require.",
          "A development agreement is registered, permissions are filed, and members vacate against a written rent and a written handover date.",
          "The building goes up, the occupation certificate is obtained, and members move back in with their new agreements registered in their own names.",
        ],
      },
      {
        id: "stalls",
        heading: "Where it stalls",
        body: [
          "Four points, almost always. The first is entitlement: a society that shortlists developers before it has agreed internally what each member is owed will re-open that argument at every subsequent stage.",
          "The second is the rent during construction — not the amount, but whether it is paid on time in month twenty-six. The third is a permission nobody sequenced, which turns a schedule into a queue. The fourth is the handover date, which is the only one of the four a member remembers afterwards.",
        ],
      },
      {
        id: "ask",
        heading: "What to ask a developer",
        list: [
          "Which of your completed projects were redevelopments, and can we speak to those societies directly?",
          "Who signs the drawings, and will the same office answer for them at handover?",
          "What is the written handover date, and what happens contractually if it is missed?",
          "How is the transit rent secured, and who pays it in month twenty-six?",
        ],
      },
    ],
  },
  {
    slug: "reading-a-rera-registration",
    date: "3 June 2025",
    category: "Regulation",
    readingTime: "5 min read",
    title: "Reading a RERA registration properly",
    swashTitle: {
      before: "Reading a RERA registration ",
      swash: "properly",
    },
    excerpt:
      "A registration number is not a rating. What it does tell you, where to check it yourself, and the four fields on the public record worth more than the brochure.",
    image: {
      src: "/images/projects/bkc-32.jpg",
      alt:
        "A tower under construction, the stage at which a project carries a live RERA registration against a declared completion date.",
      width: 1600,
      height: 2000,
    },
    body: [
      {
        id: "what",
        heading: "What registration is, and is not",
        body: [
          "Under the Real Estate (Regulation and Development) Act, a project of qualifying size must be registered with its state authority before it is advertised or sold. The registration number that appears in the corner of every advertisement is the proof that this has happened.",
          "It is not a quality rating, an approval of the design, or a guarantee of the date. It is a key into a public record — and the record is the useful part, not the number.",
        ],
      },
      {
        id: "fields",
        heading: "The four fields worth reading",
        list: [
          "The declared completion date, which is the date the promoter has committed to on the record rather than in a brochure.",
          "The sanctioned plan and the approvals obtained to date, which tell you what is actually permitted rather than what is rendered.",
          "The quarterly progress updates, which show whether the declared date has been revised and how often.",
          "The promoter's other registered projects, and the same three fields for each of them.",
        ],
      },
      {
        id: "how",
        heading: "How to check it yourself",
        body: [
          "Every state authority publishes its register online, searchable by project name, promoter name or registration number. Type the number from the advertisement into the state's own site rather than following a link supplied with the advertisement.",
          "If a project is being sold to you and its registration cannot be found on the authority's own register, that is the end of the conversation, whatever else is true about it.",
        ],
      },
    ],
  },
  {
    slug: "buying-from-abroad-without-being-there",
    date: "21 March 2025",
    category: "NRI buyers",
    readingTime: "6 min read",
    title: "Buying from abroad without being there",
    swashTitle: {
      before: "Buying from ",
      swash: "abroad",
      after: " without being there",
    },
    excerpt:
      "The parts of an Indian property purchase that genuinely require a non-resident buyer to be present, the parts that do not, and how a power of attorney is normally used to bridge the two.",
    image: {
      src: "/images/projects/godrej-skygarden.jpg",
      alt:
        "A finished residential development of the kind bought most often by buyers living outside India.",
      width: 1600,
      height: 2000,
    },
    body: [
      {
        id: "presence",
        heading: "What actually requires you to be present",
        body: [
          "Less than most buyers expect, and more than most brokers admit. Identification and banking formalities, registration of the agreement, and anything requiring a biometric are the parts that are genuinely difficult to do from another country.",
          "Selection, negotiation, diligence and payment are not — they are documentary, and they are the parts where being physically present adds the least.",
        ],
      },
      {
        id: "poa",
        heading: "The power of attorney, used properly",
        body: [
          "A power of attorney executed in favour of someone you trust in India is the ordinary instrument for bridging the gap. It is executed abroad, attested at the Indian mission in the country you are in, and then stamped and, where required, registered in India.",
          "Two rules are worth more than any amount of advice about the format. Keep it specific — a document that names the property and the acts permitted, rather than a general power over your affairs. And keep it revocable, in writing, in terms you have read.",
        ],
      },
      {
        id: "banking",
        heading: "Banking and repatriation, in outline",
        body: [
          "Purchase consideration is paid through normal banking channels from the accounts a non-resident is permitted to hold, and the payment trail is what later supports any repatriation of sale proceeds. Keep the bank's own advices for every remittance; reconstructing them years later is unpleasant.",
          "The rules on repatriation are specific to your residency status, the property's type and how long you hold it, and they change. This is a description of the shape of the process, not tax or legal advice: take advice from a chartered accountant on your own facts before you commit.",
        ],
      },
      {
        id: "diligence",
        heading: "What to have checked before you sign",
        list: [
          "Title, and the chain of it — through your own advocate, not the seller's.",
          "The RERA registration on the authority's own register, and the declared completion date on it.",
          "The approved plan for the specific unit, against what you were shown.",
          "Every payment milestone in the agreement, and what each one is tied to.",
        ],
      },
    ],
  },
];
