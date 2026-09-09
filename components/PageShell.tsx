import type { ReactNode } from "react";
import type { Cta, NavLink } from "@/lib/content";
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
  children,
}: {
  nav: { links: NavLink[]; cta: Cta };
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

      <main id="main">{children}</main>
    </>
  );
}

export default PageShell;
