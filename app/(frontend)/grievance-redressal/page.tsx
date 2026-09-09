import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getSiteContent } from "@/lib/getSiteContent";
import { grievancePage as page } from "@/lib/pages";

/**
 * Grievance Redressal.
 *
 * ⚠️ THIS PAGE CANNOT GO LIVE AS DRAFTED. The Information Technology
 * (Intermediary Guidelines and Digital Media Ethics Code) Rules require the
 * Grievance Officer to be named, with contact details published. Clause 3 of
 * the document marks the appointment as outstanding rather than inventing a
 * name — see the notice at the head of lib/pages/legal.ts.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Grievance Redressal",
  description:
    "How to raise a complaint with Vakratunda Group about a project, a society redevelopment or this website — who receives it, and the timeline for a response.",
  alternates: { canonical: "/grievance-redressal" },
};

export default async function GrievanceRoute() {
  const content = await getSiteContent();

  return (
    <LegalPage
      content={page}
      nav={content.nav}
      finalCta={content.finalCta}
      legal={content.legal}
    />
  );
}
