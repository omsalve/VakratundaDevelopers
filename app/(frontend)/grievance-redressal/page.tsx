import type { Metadata } from "next";
import GrievanceHero from "@/components/pages/grievance/GrievanceHero";
import GrievanceProcedure from "@/components/pages/grievance/GrievanceProcedure";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Grievance Redressal — THE REGISTER.
 *
 * ⚠️ THIS PAGE CANNOT GO LIVE AS DRAFTED. The Information Technology
 * (Intermediary Guidelines and Digital Media Ethics Code) Rules require the
 * Grievance Officer to be named, with contact details published. Clause 3 of
 * the document marks the appointment as outstanding rather than inventing a
 * name — see the notice at the head of lib/pages/legal.ts. The redesign does
 * not change that and does not hide it: the clause still reads as outstanding,
 * and it now has its own numbered entry in the index, where it is harder to
 * miss than it was in a wall of prose.
 *
 * THE IDENTITY IS RESTRAINT. This is the quietest page on the site and that is
 * the design, not a gap in it. It opens on a ruled register of particulars
 * rather than a held screen; it runs a sticky clause index beside a strict
 * reading measure; and the only things that move are the lit mark on the
 * index, a progress rule, and each clause being ruled open. Somebody arrives
 * here to complain, and nothing on the page should be enjoying itself.
 *
 * WHY IT IS NOT /terms OR /disclaimer. All three used to be the same component
 * — `LegalPage` — which is why all three felt like one page. They are three
 * different kinds of document: a procedure with deadlines, an agreement read
 * once through, and a set of separate notices. Each now has the layout its own
 * shape asks for, off the identical `ProseDoc` content shape.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("grievance", "/grievance-redressal");
}

export default async function GrievanceRoute() {
  const { site, page } = await getStandingPage("grievance");

  return (
    <PageShell
      page="grievance"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <GrievanceHero content={page.hero} updated={page.doc.updated} />

      <GrievanceProcedure doc={page.doc} />
    </PageShell>
  );
}
