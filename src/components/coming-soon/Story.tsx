import { WithinLogo } from "@/components/brand/WithinLogo";

import { Eyebrow } from "./Eyebrow";

/** Centered mission statement, anchored by the logomark. */
export function Story() {
  return (
    <section className="bg-wi-paper border-t border-wi-line border-b border-wi-line">
      <div className="max-w-[720px] mx-auto px-7 py-[84px] text-center">
        <div className="flex justify-center mb-[26px] opacity-90">
          <WithinLogo kind="logomark" height={34} alt="" />
        </div>
        <Eyebrow>The idea</Eyebrow>
        <p
          className="mt-5 text-[24px] leading-normal tracking-[-0.01em] text-wi-black text-pretty"
        >
          Recovery has been overcomplicated. Buried under sugar, dyes and claims. We stripped it
          back to what performance actually asks for: the essential minerals, correctly dosed, and
          nothing else.
        </p>
        <p className="mt-5 text-base leading-[1.6] text-wi-ink-500">
          Built for the solo performer and the real Indonesian environment. Made in Indonesia.
          Launching once approvals are complete.
        </p>
      </div>
    </section>
  );
}
