import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Grievance Redressal.
 *
 * ⚠️ THIS PAGE CANNOT GO LIVE AS DRAFTED. The Information Technology
 * (Intermediary Guidelines and Digital Media Ethics Code) Rules require the
 * Grievance Officer to be named, with contact details published. Clause 3 of
 * the document marks the appointment as outstanding rather than inventing a
 * name — see the notice at the head of lib/pages/legal.ts.
 *
 * Content: the `grievance-page` global over lib/pages/legal.ts.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("grievance", "/grievance-redressal");
}

export default async function GrievanceRoute() {
  const { site, page } = await getStandingPage("grievance");

  return (
    <LegalPage
      content={page}
      nav={site.nav}
      finalCta={site.finalCta}
      legal={site.legal}
    />
  );
}
