import { WithinLogo } from "@/components/brand/WithinLogo";

import { Reveal } from "./Reveal";

/** The vision: a centered manifesto, amplified. The statement is the design. */
export function TheIdea() {
  return (
    <section className="border-t border-wi-line bg-wi-paper">
      <div className="mx-auto w-full max-w-[1040px] px-5 py-24 text-center md:px-7 md:py-36">
        <Reveal>
          <WithinLogo kind="logomark" color="black" height={38} className="mx-auto mb-10" alt="" />
          <p className="m-0 text-[clamp(28px,4vw,54px)] font-medium leading-[1.08] tracking-[-0.03em] text-wi-black text-balance">
            Somewhere along the line, hydration got complicated. More sugar, more dye, more claims on
            the label than minerals in the drink. We went the other way: the minerals you lose, at
            the dose you lose them, and nothing to read past.
          </p>
          <p className="mx-auto mt-8 mb-0 max-w-[54ch] text-[16px] leading-[1.6] text-wi-ink-500">
            Made in Indonesia, for the way people train here.
            clear.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
