"use client";

import { SampleStepIndicator } from "./SampleStepIndicator";
import { SAMPLE_COPY } from "./utils/sample-copy";

const { transfer } = SAMPLE_COPY;

interface SampleTransferStepsProps {
  /** 1 while paying, 2 while sending the proof. */
  step: 1 | 2;
}

/**
 * The bank-transfer status page's two-step bar. A client component so the step counter function stays on the
 * client: the status page is a server component and cannot hand a function to the indicator.
 */
export function SampleTransferSteps({ step }: SampleTransferStepsProps) {
  return <SampleStepIndicator step={step} labels={transfer.steps} counter={transfer.stepCounter} />;
}
