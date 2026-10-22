import type { ISampleFeedbackInput, SampleFeedbackField } from "@/app/utils/sample-feedback-input";
import { FEEDBACK_FELT, FEEDBACK_SESSION, SESSION_LENGTH, WOULD_REACH_AGAIN } from "@/app/utils/sample-options";
import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { splitChoices } from "@/app/utils/sample-request-input";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleMultiChoiceGroup } from "./SampleMultiChoiceGroup";
import { OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";

const { feedback: copy } = SAMPLE_COPY;

interface SampleFeedbackQuestionProps {
  field: SampleFeedbackField;
  values: ISampleFeedbackInput;
  onChange: (patch: Partial<ISampleFeedbackInput>) => void;
  error?: string;
}

function options<T extends string>(keys: readonly T[], labels: Record<T, string>) {
  return keys.map((value) => ({ value, label: labels[value] }));
}

const TASTE_OPTIONS = ["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }));

/** One check-in question, chosen by field. */
export function SampleFeedbackQuestion({ field, values, onChange, error }: SampleFeedbackQuestionProps) {
  if (field === "sessionType") {
    return <SampleChoiceGroup name="sessionType" legend={copy.questions.sessionType} options={options(FEEDBACK_SESSION, OPTION_LABEL.feedbackSession)} value={values.sessionType} onChange={(sessionType) => onChange({ sessionType })} error={error} />;
  }
  if (field === "sessionLength") {
    return <SampleChoiceGroup name="sessionLength" legend={copy.questions.sessionLength} options={options(SESSION_LENGTH, OPTION_LABEL.sessionLength)} value={values.sessionLength} onChange={(sessionLength) => onChange({ sessionLength })} error={error} />;
  }
  if (field === "tasteRating") {
    return (
      <div className="flex flex-col gap-2">
        <SampleChoiceGroup name="tasteRating" legend={copy.questions.tasteRating} options={TASTE_OPTIONS} value={values.tasteRating} onChange={(tasteRating) => onChange({ tasteRating })} error={error} isScale />
        <p className="m-0 flex justify-between text-[13px] leading-[18px] text-brand-muted">
          <span>{copy.tasteLow}</span>
          <span>{copy.tasteHigh}</span>
        </p>
      </div>
    );
  }
  if (field === "felt") {
    return (
      <div className="flex flex-col gap-4">
        <SampleMultiChoiceGroup name="felt" legend={copy.questions.felt} options={options(FEEDBACK_FELT, OPTION_LABEL.felt)} value={values.felt} onChange={(felt) => onChange({ felt })} error={splitChoices(values.felt).includes("other") && values.feltOther.trim() === "" ? undefined : error} />
        {splitChoices(values.felt).includes("other") && (
          <WaitlistField id="feltOther" name="feltOther" label={copy.questions.feltOther} value={values.feltOther} onValueChange={(feltOther) => onChange({ feltOther })} onValueBlur={() => undefined} error={error} />
        )}
      </div>
    );
  }
  if (field === "wouldReachAgain") {
    return <SampleChoiceGroup name="wouldReachAgain" legend={copy.questions.wouldReachAgain} options={options(WOULD_REACH_AGAIN, OPTION_LABEL.wouldReachAgain)} value={values.wouldReachAgain} onChange={(wouldReachAgain) => onChange({ wouldReachAgain })} error={error} />;
  }

  return (
    <div>
      <label htmlFor="comment" className="mb-2.5 block text-[15px] leading-[22px] font-semibold">{copy.questions.comment}</label>
      <textarea id="comment" name="comment" rows={5} maxLength={1000} value={values.comment} onChange={(event) => onChange({ comment: event.currentTarget.value })}
        className="block w-full resize-none rounded-none border border-brand-ink bg-transparent p-3 text-base leading-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" />
      {error !== undefined && <p role="alert" className="mt-1.5 mb-0 text-[13px] font-semibold text-brand-error">{error}</p>}
    </div>
  );
}
