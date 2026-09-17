import type { ReactNode } from "react";
import clsx from "clsx";
import type { Cta, FinalCtaContent, NavLink } from "@/lib/content";
import { isLitPage, type PageIdentity } from "@/lib/pageIdentity";
import EnclosureFooter from "./EnclosureFooter";
import SiteHeader from "./SiteHeader";
import SmoothScroll from "./SmoothScroll";

/**
 * Everything the landing page sets up around its sections — the Lenis
 * instance, the skip link, the grain overlay, the masthead and the <main>
 * landmark — stated once so the three standing pages cannot drift from it or
 * from each other.
 *
 * A Server Component: it only passes plain props down, so each page stays a
 * server component too and its content is still read from Payload at request
 * time.
 */

export function PageShell({
  page,
  nav,
  close,
  children,
}: {
  /**
   * Which page this is. Stamped onto <main> as `data-page`, where
   * styles/identity.css keys its token block off it — the ground, the depth of
   * the navy, the weight of the line-work. It is the ONLY thing the shell
   * knows about a page's identity; the layout itself belongs to the page.
   */
  page: PageIdentity;
  nav: { links: NavLink[]; cta: Cta };
  /** The close: the quote, the proofs, the action, the address, the legal line. */
  close: { content: FinalCtaContent; legal: string };
  children: ReactNode;
}) {
  return (
    <>
      {/* Set enabled={false} to ship without smooth scrolling. */}
      <SmoothScroll enabled />

      <a className="u-skip-link" href="#main">
        Skip to content
      </a>
      <div className="u-grain" aria-hidden="true" />

      <SiteHeader links={nav.links} cta={nav.cta} />

      {/* `data-enclose-page` is the handle EnclosureFooter closes around.
          While enclosed this element carries a transform and `overflow: clip`,
          which makes it the containing block for any `position: fixed`
          descendant and then clips one — which is why Lightbox portals to
          <body>, and why anything else fixed inside a page must too. */}
      {/* `.p-page` paints the ground identity.css resolved for this page, so a
          lit page is cream from the masthead down and no section inside it has
          to remember to set a background. `.on-cream` rides along on those
          pages for the reason set out in lib/pageIdentity.ts. */}
      <main
        id="main"
        data-enclose-page
        data-page={page}
        className={clsx("p-page", isLitPage(page) && "on-cream")}
      >
        {children}
      </main>

      {/* Outside <main>, so it is the page's contentinfo landmark and so the
          shell can close around the content rather than sit inside it. */}
      <EnclosureFooter content={close.content} legal={close.legal} />
    </>
  );
}

export default PageShell;
