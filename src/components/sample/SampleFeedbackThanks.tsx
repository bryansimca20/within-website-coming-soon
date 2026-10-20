import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import { WaitlistInstagramGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SAMPLE_COPY } from "./utils/sample-copy";

/** The end of the check-in: thanks, the reward, and Instagram for the launch. */
export function SampleFeedbackThanks() {
  return (
    <div className="flex flex-col gap-5" role="status">
      <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em]">{SAMPLE_COPY.feedback.thanksHeadline}</h1>
      <p className="m-0 text-[17px] leading-[26px]">{SAMPLE_COPY.feedback.thanksBody}</p>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="flex h-14 items-center justify-center gap-2.5 bg-brand-ink text-base font-semibold text-brand-mist no-underline">
        <WaitlistInstagramGlyph className="size-5" />
        <span>Follow {INSTAGRAM_HANDLE}</span>
      </a>
    </div>
  );
}
