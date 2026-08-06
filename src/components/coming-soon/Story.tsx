import { WithinLogo } from "@/components/brand/WithinLogo";

import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** Centered mission statement, anchored by the logomark. */
export function Story() {
  return (
    <Section surface="paper" borderTop borderBottom containerClassName="max-w-[720px] text-center">
      <Reveal>
        <div className="flex justify-center mb-[26px] opacity-90">
          <WithinLogo kind="logomark" height={34} alt="" />
        </div>
        <Eyebrow>The idea</Eyebrow>
        <p
          className="mt-5 text-[24px] leading-normal tracking-[-0.01em] text-wi-black text-pretty"
        >
          Somewhere along the line, hydration got complicated. More sugar, more dye, more claims
          on the label than minerals in the drink. We went the other way. The minerals you lose,
          at the dose you lose them, and nothing to read past.
        </p>
        <p className="mt-5 text-base leading-[1.6] text-wi-ink-500">
          Made in Indonesia, for the way people train here. We&apos;ll launch the moment our
          approvals clear.
        </p>
      </Reveal>
    </Section>
  );
}
