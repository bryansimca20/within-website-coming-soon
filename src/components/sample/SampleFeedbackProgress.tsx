import { SAMPLE_COPY } from "./utils/sample-copy";

interface SampleFeedbackProgressProps {
  step: number;
  total: number;
}

/** A thin ink bar and "3 of 6", so people know it is short. */
export function SampleFeedbackProgress({ step, total }: SampleFeedbackProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 bg-brand-mist" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
        <div className="h-full bg-brand-ink transition-[width] duration-300 ease-brand motion-reduce:transition-none" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <span className="text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted tabular-nums">{SAMPLE_COPY.feedback.progress(step, total)}</span>
    </div>
  );
}
