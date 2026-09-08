import type { Metadata } from "next";

import { CohortClose } from "@/components/cohort/CohortClose";
import { CohortHeader } from "@/components/cohort/CohortHeader";
import { DossierSpread } from "@/components/cohort/DossierSpread";
import { COHORT_MEMBERS } from "@/components/cohort/utils/members";
import { Footer } from "@/components/coming-soon/Footer";
import { Reveal } from "@/components/coming-soon/Reveal";
import { SectionContainer } from "@/components/coming-soon/Section";

export const metadata: Metadata = {
  title: "The cohort · Dossier",
};

/** Prototype B: one unset magazine spread per founding member, alternating down the page. */
export default function CohortDossierPage() {
  return (
    <div className="flex flex-1 flex-col bg-wi-paper">
      <CohortHeader label="Dossier" />
      <main className="flex-1">
        <SectionContainer flush className="pt-16 pb-4 md:pt-28 md:pb-8">
          <Reveal className="max-w-[760px]">
            <h1 className="m-0 text-[clamp(36px,5.6vw,72px)] font-medium leading-[0.98] tracking-[-0.04em] text-wi-black text-balance">
              Eight pages, still blank.
            </h1>
            <p className="mt-7 mb-0 max-w-[46ch] text-[17px] leading-[1.55] text-wi-ink-500">
              A page held for each founding member. The name is set. The headline and the words
              underneath it are not, because we have not run them yet.
            </p>
          </Reveal>
        </SectionContainer>

        <SectionContainer flush className="pb-16 md:pb-24">
          {COHORT_MEMBERS.map((member) => (
            <DossierSpread key={member.index} member={member} />
          ))}
        </SectionContainer>
      </main>
      <CohortClose />
      <Footer />
    </div>
  );
}
