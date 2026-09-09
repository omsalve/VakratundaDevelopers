import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getSiteContent } from "@/lib/getSiteContent";
import { disclaimerPage as page } from "@/lib/pages";

/**
 * Disclaimer. Drafted but NOT approved by counsel, and it references RERA
 * registration numbers that the project pages must actually carry — see the
 * notice at the head of lib/pages/legal.ts before this goes live.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "What the material on the Vakratunda Group website is and is not — RERA registration, indicative renders and plans, areas, timelines and joint ventures.",
  alternates: { canonical: "/disclaimer" },
};

export default async function DisclaimerRoute() {
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
