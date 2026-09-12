import type { ReactNode } from "react";
import type { Cta, FinalCtaContent, NavLink } from "@/lib/content";
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
  nav,
  close,
  children,
}: {
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
      <main id="main" data-enclose-page>
        {children}
      </main>

      {/* Outside <main>, so it is the page's contentinfo landmark and so the
          shell can close around the content rather than sit inside it. */}
      <EnclosureFooter content={close.content} legal={close.legal} />
    </>
  );
}

export default PageShell;
