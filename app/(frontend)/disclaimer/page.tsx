import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Disclaimer. Drafted but NOT approved by counsel, and it references RERA
 * registration numbers that the project pages must actually carry — see the
 * notice at the head of lib/pages/legal.ts before this goes live.
 *
 * Content: the `disclaimer-page` global over lib/pages/legal.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("disclaimer", "/disclaimer");
}

export default async function DisclaimerRoute() {
  const { site, page } = await getStandingPage("disclaimer");

  return (
    <LegalPage
      content={page}
      nav={site.nav}
      finalCta={site.finalCta}
      legal={site.legal}
    />
  );
}
