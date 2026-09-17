import type { Metadata } from "next";
import PressMasthead from "@/components/pages/press/PressMasthead";
import PressWire from "@/components/pages/press/PressWire";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Press Room — THE WIRE.
 *
 * A broadsheet: a full-bleed masthead ruled between two hairlines, cuttings in
 * two columns with a rule down the middle, and the press desk held beside the
 * archive rather than under it — a journalist on deadline should not have to
 * scroll past three years of coverage to find who to write to.
 *
 * WHY IT IS NOT /awards. Both are dark pages holding a ledger of dated entries,
 * and under the old template they were the same page twice. The difference is
 * what each reader is scanning for: on /awards it is WHEN, so the year is set
 * at heading scale down the left; here it is WHO PUBLISHED IT, so the item is
 * a dateline, a headline and a source, and the source is set in the display
 * italic where the eye lands after the headline.
 *
 * ⚠️ THE ENTRIES ARE PLACEHOLDERS and carry no `href` — see the notice at the
 * head of lib/pages/newsroom.ts. Every row without a link ends in its `state`
 * as a struck mark, so nothing here reads as a cutting you can go and read.
 *
 * Content: the `press-page` global over lib/pages/newsroom.ts, shape untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("press", "/press");
}

export default async function PressRoomPage() {
  const { site, page } = await getStandingPage("press");

  return (
    <PageShell
      page="press"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <PressMasthead content={page.hero} />

      <PressWire coverage={page.coverage} enquiries={page.enquiries} />
    </PageShell>
  );
}
