// Single source of truth for landing-page copy and image references.
// Shaped to map 1:1 onto a future Payload `home` global so components
// can be rewired to fetch from Payload without changing their props.

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export type NavActionIcon = "enquire" | "chat" | "search";

export interface NavAction {
  label: string;
  href: string;
  icon: NavActionIcon;
}

export interface NavContent {
  wordmark: string;
  links: NavLink[];
  actions: NavAction[];
}

export interface HeroContent {
  tagline: string;
  poster: ImageAsset;
  // TODO(Cloudinary): swap for the Cloudinary-hosted hero video URL.
  videoSrc: string;
}

export interface FeatureRowContent {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  image: ImageAsset;
}

export interface PurposePanel {
  image: ImageAsset;
  label: string;
  href: string;
}

export interface PurposeContent {
  eyebrow: string;
  heading: string;
  body: string;
  panels: PurposePanel[];
}

export interface PresenceProject {
  name: string;
  location: string;
  image: ImageAsset;
}

export interface PresenceContent {
  eyebrow: string;
  heading: string;
  projects: PresenceProject[];
  ctaLabel: string;
  ctaHref: string;
}

export type SocialPlatform = "instagram" | "youtube" | "linkedin";

export interface FooterSocial {
  icon: SocialPlatform;
  href: string;
  label: string;
}

export interface FooterColumn {
  links: { label: string; href: string }[];
}

export interface FooterContent {
  columns: FooterColumn[];
  wordmark: string;
  socials: FooterSocial[];
  copyright: string;
}

export interface HomeContent {
  nav: NavContent;
  hero: HeroContent;
  promise: FeatureRowContent;
  purpose: PurposeContent;
  presence: PresenceContent;
  services: FeatureRowContent;
  footer: FooterContent;
}

export const homeContent: HomeContent = {
  nav: {
    wordmark: "VAKRATUNDA",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects", hasDropdown: true },
      { label: "Experiences", href: "/experiences" },
    ],
    actions: [
      { label: "Enquire", href: "/enquire", icon: "enquire" },
      { label: "Chat", href: "/chat", icon: "chat" },
      { label: "Search", href: "/search", icon: "search" },
    ],
  },
  hero: {
    tagline: "Vakratunda Developers — Premium Real Estate",
    poster: {
      src: "/images/hero-poster.svg",
      alt: "Sun-lit double-height living room overlooking the sea",
    },
    videoSrc: "/videos/hero.mp4",
  },
  promise: {
    eyebrow: "OUR PROMISE",
    heading: "Creating the city's finest addresses",
    body: "Vakratunda Developers is committed to delivering thoughtfully designed, premium properties that shape the urban lifestyle of tomorrow.",
    ctaLabel: "Know More",
    ctaHref: "/about",
    image: {
      src: "/images/promise.svg",
      alt: "Facade of a Vakratunda landmark residence at dusk",
    },
  },
  purpose: {
    eyebrow: "OUR PURPOSE",
    heading: "Do good. Build well.",
    body: "We are committed to elevating the living experience while emphasising the importance of creating a positive impact on the environment and society.",
    panels: [
      {
        image: {
          src: "/images/purpose-story.svg",
          alt: "Tree-lined avenue leading to a Vakratunda tower",
        },
        label: "Our Story",
        href: "/about",
      },
      {
        image: {
          src: "/images/purpose-impact.svg",
          alt: "Resident relaxing in a landscaped courtyard",
        },
        label: "Our Impact",
        href: "/impact",
      },
    ],
  },
  presence: {
    eyebrow: "OUR PRESENCE",
    heading: "Iconic Developments",
    projects: [
      {
        name: "Vakratunda Heights",
        location: "Mumbai",
        image: { src: "/images/presence-1.svg", alt: "Vakratunda Heights tower" },
      },
      {
        name: "Vakratunda Greens",
        location: "Pune",
        image: { src: "/images/presence-2.svg", alt: "Vakratunda Greens residence" },
      },
      {
        name: "Vakratunda Bay",
        location: "Mumbai",
        image: { src: "/images/presence-3.svg", alt: "Vakratunda Bay sea-facing tower" },
      },
      {
        name: "Vakratunda Square",
        location: "Pune",
        image: { src: "/images/presence-4.svg", alt: "Vakratunda Square mixed-use development" },
      },
    ],
    ctaLabel: "View All",
    ctaHref: "/projects",
  },
  services: {
    eyebrow: "OUR SIGNATURE SERVICES",
    heading: "Elevating the everyday",
    body: "Our in-house hospitality professionals curate experiences with care and intention, anticipating needs before they are expressed and going the extra mile to ensure every moment feels personal and intuitive.",
    ctaLabel: "Know More",
    ctaHref: "/experiences",
    image: {
      src: "/images/services.svg",
      alt: "Private dining experience curated by Vakratunda hospitality staff",
    },
  },
  footer: {
    columns: [
      {
        links: [
          { label: "Our Story", href: "/about" },
          { label: "Our Impact", href: "/impact" },
          { label: "Our Developments", href: "/projects" },
          { label: "Experiences", href: "/experiences" },
        ],
      },
      {
        links: [
          { label: "Investor Relations", href: "/investors" },
          { label: "Careers", href: "/careers" },
          { label: "Contact Us", href: "/contact" },
          { label: "Terms & Conditions", href: "/terms" },
        ],
      },
    ],
    wordmark: "VAKRATUNDA",
    socials: [
      { icon: "instagram", href: "https://instagram.com", label: "Vakratunda Developers on Instagram" },
      { icon: "youtube", href: "https://youtube.com", label: "Vakratunda Developers on YouTube" },
      { icon: "linkedin", href: "https://linkedin.com", label: "Vakratunda Developers on LinkedIn" },
    ],
    copyright: "© Vakratunda Developers 2026. All rights reserved.",
  },
};
