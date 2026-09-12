import type { Metadata } from "next";
import CardGrid from "@/components/CardGrid";
import FaqList from "@/components/FaqList";
import PageHero from "@/components/PageHero";
import PageSection from "@/components/PageSection";
import PageShell from "@/components/PageShell";
import SectionCoda from "@/components/SectionCoda";
import { getSiteContent } from "@/lib/getSiteContent";
import { nriPage as page } from "@/lib/pages";

/**
 * NRI Corner.
 *
 * The four stages first, then the four questions people actually ask. That
 * order is deliberate: a visitor who lands here from eight thousand kilometres
 * away wants to know whether this is possible before they want to know how it
 * is taxed, and a page that opens with an FAQ has decided the opposite.
 *
 * THE DISCLAIMER IS PART OF THE PAGE, not a footnote under it. It closes the
 * questions band on the same rule as any other coda, because on a page about
 * money moving between two countries "this is not advice" is a load-bearing
 * sentence rather than small print.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NRI Corner",
  description:
    "Buying property in Mumbai as a non-resident: the four stages of the process, what genuinely needs you present, and how the group works with buyers abroad.",
  alternates: { canonical: "/nri-corner" },
};

export default async function NriCornerPage() {
  const content = await getSiteContent();

  return (
    <PageShell
      nav={content.nav}
      close={{ content: content.finalCta, legal: content.legal }}
    >
      <PageHero content={page.hero} />

      <PageSection
        id="stages"
        label={page.steps.label}
        heading={page.steps.heading}
        standfirst={page.steps.standfirst}
      >
        <div className="u-shell">
          <CardGrid items={page.steps.items} columns={2} />
        </div>
      </PageSection>

      <PageSection
        id="questions"
        ground="cream"
        size="lg"
        label={page.faqs.label}
        heading={page.faqs.heading}
        standfirst={page.faqs.standfirst}
      >
        <div className="u-shell">
          <FaqList items={page.faqs.items} />
          <SectionCoda text={page.disclaimer} cta={page.cta} />
        </div>
      </PageSection>
    </PageShell>
  );
}
