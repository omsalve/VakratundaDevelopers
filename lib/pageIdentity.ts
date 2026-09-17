/**
 * Which page is which.
 *
 * ONE LIST, READ BY BOTH SIDES. `styles/identity.css` keys its token blocks on
 * the same `data-page` values this file names, and PageShell stamps them from
 * here — so a page cannot be lit in the stylesheet and dark in the shell.
 *
 * The only thing that has to be known in TypeScript rather than in CSS is the
 * GROUND, because a cream page also needs the `.on-cream` class: that is what
 * re-points the semantic text tokens (global.css), and it is a class rather
 * than a token block precisely so components never need a light-mode branch.
 * Everything else about a page's identity — its depth, its rule, its figure
 * wash — is CSS and stays in CSS.
 *
 * Adding a page: name it here, give it a block in identity.css, and build its
 * sections. Nothing else in the codebase has to learn about it.
 */

/** The `data-page` value, and the key each page's own components are filed under. */
export type PageIdentity =
  | "about"
  | "projects"
  | "nri"
  | "sustainability"
  | "grievance"
  | "awards"
  | "careers"
  | "contact"
  | "press"
  | "blog"
  | "investors"
  | "experiences"
  | "hospitality"
  | "terms"
  | "disclaimer";

/**
 * The pages that open on cream rather than navy.
 *
 * Six of fifteen, and the split is by what the page is FOR, not by variety for
 * its own sake: the ones examined in daylight — the work, the environmental
 * record, the reading room — and the three documents of record. The other nine
 * stay on the navy the landing page establishes, so arriving on one of them
 * from the landing page is continuous and arriving on a lit one is an event.
 */
const LIT_PAGES = new Set<PageIdentity>([
  "projects",
  "sustainability",
  "blog",
  "terms",
  "grievance",
  "disclaimer",
]);

export function isLitPage(page: PageIdentity): boolean {
  return LIT_PAGES.has(page);
}
