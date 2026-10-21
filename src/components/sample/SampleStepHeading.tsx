import type { ReactNode } from "react";

interface SampleStepHeadingProps {
  children: ReactNode;
}

/** The one question or title at the top of each form step. */
export function SampleStepHeading({ children }: SampleStepHeadingProps) {
  return (
    <h2 className="m-0 text-[26px] leading-[30px] font-normal tracking-[-0.02em] text-balance desk:text-[32px] desk:leading-9">{children}</h2>
  );
}
