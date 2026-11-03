"use client";

import { type ReactNode, useEffect, useRef } from "react";

interface SampleStepHeadingProps {
  children: ReactNode;
}

/** The one question or title at the top of each form step. Takes focus when the step appears, so keyboard and screen reader users land on it. */
export function SampleStepHeading({ children }: SampleStepHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <h2
      ref={headingRef}
      tabIndex={-1}
      className="m-0 text-[26px] leading-[30px] font-normal tracking-[-0.02em] text-balance outline-none desk:text-[32px] desk:leading-9"
    >
      {children}
    </h2>
  );
}
