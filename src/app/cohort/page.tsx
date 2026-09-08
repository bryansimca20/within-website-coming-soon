import type { Metadata } from "next";

import { CohortClose } from "@/components/cohort/CohortClose";
import { CohortHeader } from "@/components/cohort/CohortHeader";
import { StagePanel } from "@/components/cohort/StagePanel";
import { COHORT_MEMBERS } from "@/components/cohort/utils/members";
import { Reveal } from "@/components/coming-soon/Reveal";
import { SectionContainer } from "@/components/coming-soon/Section";

export const metadata: Metadata = {
  title: "The cohort",
};

/**
 * The founding-member stories page: one full-height panel per member on the dark instrument
 * surface, each holding an empty readout where their story will be written. The only page on
 * the site that inverts the theme, and the one built to project.
 */
export default function CohortPage() {
  return (
    <div className="flex flex-1 flex-col bg-wi-black">
      <CohortHeader />
      <main className="flex-1">
        <section className="flex min-h-[calc(100svh-var(--wi-nav-h))] items-center">
          <SectionContainer flush className="py-20">
            <Reveal className="max-w-[820px]">
              <h1 className="m-0 text-[clamp(40px,7vw,96px)] font-medium leading-[0.94] tracking-[-0.045em] text-wi-paper text-balance">
                The founding cohort.
              </h1>
              <p className="mt-8 mb-0 max-w-[46ch] text-[18px] leading-[1.55] text-wi-on-dark-2">
                Eight people who were here before the product was. Eight stories that do not
                exist yet.
              </p>
            </Reveal>
          </SectionContainer>
        </section>

        {COHORT_MEMBERS.map((member) => (
          <StagePanel key={member.index} member={member} />
        ))}
      </main>
      <CohortClose />
    </div>
  );
}
