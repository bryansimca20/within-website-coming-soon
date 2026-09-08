import { WithinLogo } from "@/components/brand/WithinLogo";
import { Reveal } from "@/components/coming-soon/Reveal";
import { SectionContainer } from "@/components/coming-soon/Section";

/**
 * The closing panel every cohort layout ends on: the one dark room, carrying the founding
 * member promise spoken at the kickoff dinner.
 */
export function CohortClose() {
  return (
    <section className="bg-wi-black">
      <SectionContainer flush className="py-24 md:py-32">
        <Reveal className="max-w-[760px]">
          <h2 className="m-0 text-[clamp(36px,5.4vw,64px)] font-medium leading-[0.98] tracking-[-0.04em] text-wi-paper text-balance">
            This is only the beginning.
          </h2>
          <p className="mt-7 mb-0 max-w-[48ch] text-[17px] leading-[1.55] text-wi-on-dark-2">
            Once we launch, you will be remembered as our founding member. Writing these eight
            stories is part of what the cohort is for.
          </p>
        </Reveal>
        <Reveal delay={140} className="mt-14 max-w-[760px] border-t border-wi-on-dark-line pt-8">
          <p className="m-0 text-[clamp(22px,2.8vw,32px)] font-medium leading-[1.15] tracking-[-0.03em] text-wi-paper text-balance">
            Let&apos;s write the story together. Let&apos;s start WITHIN.
          </p>
        </Reveal>
        <Reveal delay={220} className="mt-16">
          <WithinLogo kind="logotype" color="white" height={17} alt="" />
        </Reveal>
      </SectionContainer>
    </section>
  );
}
