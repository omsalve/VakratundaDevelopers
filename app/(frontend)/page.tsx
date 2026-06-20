import { Navbar } from "@/app/app/components_structure/Navbar";
import { Footer } from "@/app/app/components_structure/Footer";
import { HeroVideoDiv } from "@/app/app/components_LP/HeroVideoDiv";
import { PurposeSplit } from "@/app/app/components_LP/PurposeSplit";
import { PresenceGrid } from "@/app/app/components_LP/PresenceGrid";
import { FeatureRow } from "@/app/app/components/FeatureRow";
import { homeContent } from "@/app/app/lib/content";

export default function Home() {
  return (
    <>
      <Navbar content={homeContent.nav} />
      <main className="flex-1">
        <HeroVideoDiv content={homeContent.hero} />
        <FeatureRow {...homeContent.promise} imageSide="left" />
        <PurposeSplit content={homeContent.purpose} />
        <PresenceGrid content={homeContent.presence} />
        <FeatureRow {...homeContent.services} imageSide="left" />
      </main>
      <Footer content={homeContent.footer} />
    </>
  );
}
