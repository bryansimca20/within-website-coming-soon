import { cn } from "@/lib/utils";

import { SAMPLE_COPY } from "./utils/sample-copy";

interface SampleStepIndicatorProps {
  step: 1 | 2 | 3;
}

/** Three ink bars and the current step's name. Done and current bars fill; later ones stay muted. */
export function SampleStepIndicator({ step }: SampleStepIndicatorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden>
        {SAMPLE_COPY.steps.map((label, index) => (
          <span key={label} className={cn("h-1", index < step ? "bg-brand-ink" : "bg-brand-mist")} />
        ))}
      </div>
      <p className="m-0 flex justify-between text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted">
        <span>{SAMPLE_COPY.steps[step - 1].toUpperCase()}</span>
        <span>{SAMPLE_COPY.stepCounter(step)}</span>
      </p>
    </div>
  );
}
