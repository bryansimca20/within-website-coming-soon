import { cn } from "@/lib/utils";

import { formatJakarta } from "./utils/jakarta-date";
import type { IStatusStep } from "./utils/status-steps";

interface SampleStatusTimelineProps {
  steps: IStatusStep[];
}

/** Four rows down an ink rule. A reached step fills its square and shows its date. */
export function SampleStatusTimeline({ steps }: SampleStatusTimelineProps) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {steps.map((step, index) => {
        const isDone = step.at !== null;
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span aria-hidden className={cn("absolute top-4 left-[7px] h-full w-px", isDone ? "bg-brand-ink" : "bg-brand-mist")} />
            )}
            <span aria-hidden className={cn("relative mt-1 size-[15px] shrink-0 border border-brand-ink", isDone ? "bg-brand-ink" : "bg-white")} />
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-base leading-6", isDone ? "font-semibold" : "text-brand-muted")}>{step.label}</span>
              {step.at !== null && <span className="text-[13px] leading-[18px] text-brand-muted tabular-nums">{formatJakarta(step.at)}</span>}
              {step.detail !== null && <span className="text-[13px] leading-[18px]">{step.detail}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
