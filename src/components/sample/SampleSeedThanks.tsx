"use client";

import { SAMPLE_COPY } from "./utils/sample-copy";

const { seed } = SAMPLE_COPY;

interface SampleSeedThanksProps {
  firstName: string;
  /** Clears the form for the next person. */
  onAgain: () => void;
}

/** The end of one in-person registration, with a way straight into the next. */
export function SampleSeedThanks({ firstName, onAgain }: SampleSeedThanksProps) {
  return (
    <div className="flex flex-col gap-4" role="status">
      <h1 className="m-0 mb-2 text-[32px] leading-9 font-normal tracking-[-0.02em] text-balance">{seed.thanksTitle(firstName)}</h1>
      <p className="m-0 text-[17px] leading-[26px] text-pretty">{seed.thanksBody}</p>
      <button
        type="button"
        onClick={onAgain}
        className="mt-4 flex h-14 w-full cursor-pointer items-center justify-center bg-brand-ink text-base font-semibold text-brand-mist transition-transform duration-150 ease-brand active:scale-[0.97] motion-reduce:transition-none"
      >
        {seed.seedAnother}
      </button>
    </div>
  );
}
