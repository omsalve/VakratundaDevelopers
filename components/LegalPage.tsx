import type { Cta, NavLink } from "@/lib/content";
import type { LegalPageContent } from "@/lib/pages";
import FinalCTA from "./FinalCTA";
import PageHero from "./PageHero";
import PageSection from "./PageSection";
import PageShell from "./PageShell";
import ProseDoc from "./ProseDoc";

/**
 * Terms, the disclaimer and the grievance procedure are the same page three
 * times: a hero, a document on cream, and the close. Stating that once means
 * the three routes are content and metadata only, and that a change to how a
 * legal document reads happens in one file rather than in three that have
 * quietly drifted apart.
 *
 * THE DOCUMENT IS ON CREAM. It is the only mode on this site that is purely
 * for reading, and a long clause set on the navy ground is a long clause set
 * on the wrong ground — the cream is what the landing page already uses when
 * it wants something examined rather than felt.
 */

export function LegalPage({
  content,
  nav,
  finalCta,
  legal,
}: {
  content: LegalPageContent;
  nav: { links: NavLink[]; cta: Cta };
  finalCta: React.ComponentProps<typeof FinalCTA>["content"];
  legal: string;
}) {
  return (
    <PageShell nav={nav}>
      <PageHero content={content.hero} />

      <PageSection ground="cream" size="lg">
        <ProseDoc doc={content.doc} />
      </PageSection>

      <FinalCTA content={finalCta} legal={legal} />
    </PageShell>
  );
}

export default LegalPage;
