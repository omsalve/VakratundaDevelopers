import type { Metadata } from "next";
import DisclaimerNotices from "@/components/pages/disclaimer/DisclaimerNotices";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Disclaimer — THE NOTICES.
 *
 * ⚠️ Drafted but NOT approved by counsel, and it references RERA registration
 * numbers that the project pages must actually carry — see the notice at the
 * head of lib/pages/legal.ts before this goes live. The redesign changes the
 * arrangement, not the drafting.
 *
 * Its identity is that it has NO ORDER. A disclaimer's clauses are not steps:
 * "renders are indicative", "areas are carpet areas", "dates are estimates"
 * each stand alone and matter to a different reader. So they are a field of
 * separate ruled notices in two columns, entered at any point, with no
 * progress rule and no index — there is nothing here to be part-way through.
 * The markup says the same thing: a <ul>, where /terms and
 * /grievance-redressal both use an <ol>.
 *
 * That is the third distinct shape drawn off the identical `ProseDoc` content.
 * Nothing in lib/pages/types.ts changed to allow it.
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
    <PageShell
      page="disclaimer"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <DisclaimerNotices hero={page.hero} doc={page.doc} />
    </PageShell>
  );
}
