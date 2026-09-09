import type { NavLink } from "./content";

/**
 * The site map.
 *
 * FOURTEEN PAGES DO NOT FIT IN A MASTHEAD, and pretending otherwise is how a
 * developer's site ends up with a mega-menu. So the navigation is split by
 * what it is for: the masthead carries the four routes a visitor arrives
 * looking for (and is still editable in /admin, via `home.nav`), and the
 * footer carries everything, grouped, where a visitor goes when they already
 * know what they want.
 *
 * The groups below are deliberately NOT in Payload. A sitemap that an editor
 * can reorder is a sitemap that can be left with a dead route in it the day a
 * page is renamed; these change when the routes change, in the same commit.
 */

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export const footerGroups: NavGroup[] = [
  {
    label: "The group",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Awards", href: "/awards" },
      { label: "Press Room", href: "/press" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    label: "The work",
    links: [
      { label: "Our Projects", href: "/projects" },
      { label: "Experiences", href: "/experiences" },
      { label: "Hospitality", href: "/hospitality" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    label: "Investing",
    links: [
      { label: "Investor Relations", href: "/investors" },
      { label: "NRI Corner", href: "/nri-corner" },
      { label: "Blogs", href: "/blogs" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Grievance Redressal", href: "/grievance-redressal" },
    ],
  },
];

/**
 * Every route the footer offers, flattened — used to check at a glance that
 * nothing has been added to the app directory without being linked from
 * anywhere. Import it in a test or a script; it costs nothing to keep.
 */
export const allRoutes: string[] = footerGroups.flatMap((group) =>
  group.links.map((link) => link.href),
);
