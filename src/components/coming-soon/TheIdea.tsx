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
            Hydration doesn&apos;t need a longer list of ingredients. It needs the right ones, in
            the right amounts, made into something you&apos;ll actually want to drink. Nothing
            unnecessary.
          </p>
          <p className="mx-auto mt-8 mb-0 max-w-[54ch] text-[16px] leading-[1.6] text-wi-ink-500">
            The heat takes. WITHIN replenishes. You carry on.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
