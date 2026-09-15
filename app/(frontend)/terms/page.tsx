import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Terms & Conditions. The document is drafted but NOT approved by counsel —
 * see the notice at the head of lib/pages/legal.ts before this goes live.
 *
 * Content: the `terms-page` global over lib/pages/legal.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("terms", "/terms");
}

export default async function TermsRoute() {
  const { site, page } = await getStandingPage("terms");

  return (
    <LegalPage
      content={page}
      nav={site.nav}
      finalCta={site.finalCta}
      legal={site.legal}
    />
  );
}
