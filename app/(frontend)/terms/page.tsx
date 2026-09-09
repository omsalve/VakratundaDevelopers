import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getSiteContent } from "@/lib/getSiteContent";
import { termsPage as page } from "@/lib/pages";

/**
 * Terms & Conditions. The document is drafted but NOT approved by counsel —
 * see the notice at the head of lib/pages/legal.ts before this goes live.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms on which the Vakratunda Group website is made available, including use, content, intellectual property and governing law.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default async function TermsRoute() {
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
