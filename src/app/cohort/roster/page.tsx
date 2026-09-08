import type { Metadata } from "next";

import { CohortClose } from "@/components/cohort/CohortClose";
import { CohortHeader } from "@/components/cohort/CohortHeader";
import { RosterPlate } from "@/components/cohort/RosterPlate";
import { COHORT_MEMBERS } from "@/components/cohort/utils/members";
import { Footer } from "@/components/coming-soon/Footer";
import { Reveal } from "@/components/coming-soon/Reveal";
import { SectionContainer } from "@/components/coming-soon/Section";

export const metadata: Metadata = {
  title: "The cohort · Roster",
};

/** Prototype A: the eight founding members as one clinical roster of specimen plates. */
export default function CohortRosterPage() {
  return (
    <div className="flex flex-1 flex-col bg-wi-paper">
      <CohortHeader label="Roster" />
      <main className="flex-1">
        <SectionContainer flush className="pt-16 pb-14 md:pt-24 md:pb-16">
          <Reveal className="max-w-[760px]">
            <h1 className="m-0 text-[clamp(34px,5.2vw,64px)] font-medium leading-[1] tracking-[-0.04em] text-wi-black text-balance">
              Eight founding members.
            </h1>
            <p className="mt-7 mb-0 max-w-[48ch] text-[17px] leading-[1.55] text-wi-ink-500">
              Chosen by name, one at a time, before there was anything to buy. Their stories are
              not written yet. That is what the empty space is for.
            </p>
          </Reveal>
        </SectionContainer>

        <SectionContainer flush className="pb-24 md:pb-32">
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {COHORT_MEMBERS.map((member, i) => (
              <Reveal key={member.index} delay={i * 50}>
                <RosterPlate member={member} />
              </Reveal>
            ))}
          </div>
        </SectionContainer>
      </main>
      <CohortClose />
      <Footer />
    </div>
  );
}
