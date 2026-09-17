import type { Metadata } from "next";
import TermsAgreement from "@/components/pages/terms/TermsAgreement";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Terms & Conditions — THE AGREEMENT.
 *
 * ⚠️ The document is drafted but NOT approved by counsel — see the notice at
 * the head of lib/pages/legal.ts before this goes live. The redesign changes
 * how it is read, not a word of what it says.
 *
 * Its identity is completeness. The contents are in the opening, across the
 * full width, so the whole agreement is visible before the first clause is
 * read; each clause then holds its heading beside its own body; and a single
 * progress rule under the masthead answers the only question a reader of an
 * agreement actually has. There is no navigation rail, because an agreement is
 * read through rather than searched.
 *
 * WHY IT IS NOT /grievance-redressal, which is the same `ProseDoc` shape: that
 * page is a register somebody arrives at looking for one clause, so it hides
 * its list in a sticky index and keeps a narrow column. This one opens its
 * list out and runs two columns wide. Same content shape, opposite reading
 * behaviour, opposite layout.
 *
 * Content: the `terms-page` global over lib/pages/legal.ts, shape untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("terms", "/terms");
}

export default async function TermsRoute() {
  const { site, page } = await getStandingPage("terms");

  return (
    <PageShell
      page="terms"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <TermsAgreement hero={page.hero} doc={page.doc} />
    </PageShell>
  );
}
