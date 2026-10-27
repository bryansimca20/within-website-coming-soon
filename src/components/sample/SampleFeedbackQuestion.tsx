import type { ISampleFeedbackInput, SampleFeedbackField } from "@/app/utils/sample-feedback-input";
import { FEEDBACK_FELT, SESSION_LENGTH, TRAINING_TYPE, WOULD_REACH_AGAIN } from "@/app/utils/sample-options";
import { splitChoices } from "@/app/utils/sample-request-input";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleMultiChoiceGroup } from "./SampleMultiChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { SampleTextArea } from "./SampleTextArea";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";

const { feedback: copy } = SAMPLE_COPY;
const TASTE_OPTIONS = ["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }));

interface SampleFeedbackQuestionProps {
  field: SampleFeedbackField;
  values: ISampleFeedbackInput;
  onChange: (patch: Partial<ISampleFeedbackInput>) => void;
  /** This screen's error, under the answers or under the "Other" text when that is what is missing. */
  error?: string;
  /** Which field the error belongs to, so an "Other" error lands under its text. */
  errorField?: SampleFeedbackField;
}

/** One check-in screen: the question as its heading, then its answers, laid out like the request form. */
export function SampleFeedbackQuestion({ field, values, onChange, error, errorField }: SampleFeedbackQuestionProps) {
  const otherError = errorField === "sessionTypeOther" || errorField === "feltOther" ? error : undefined;
  const groupError = otherError === undefined ? error : undefined;

  if (field === "sessionType") {
    return (
      <div className="flex flex-col gap-7">
        <SampleStepHeading>{copy.questions.sessionType}</SampleStepHeading>
        <div>
          <SampleMultiChoiceGroup name="sessionType" legend={copy.pickAll} options={choiceOptions(TRAINING_TYPE, OPTION_LABEL.trainingType)}
            value={values.sessionType} onChange={(sessionType) => onChange({ sessionType })} error={groupError} />
          <SampleOtherReveal isOpen={splitChoices(values.sessionType).includes("other")}>
            <SampleTextArea id="sessionTypeOther" name="sessionTypeOther" label={copy.questions.sessionTypeOther} value={values.sessionTypeOther}
              onValueChange={(sessionTypeOther) => onChange({ sessionTypeOther })} error={otherError} textAreaProps={{ maxLength: 100 }} />
          </SampleOtherReveal>
        </div>
      </div>
    );
  }
  if (field === "sessionLength") {
    return (
      <div className="flex flex-col gap-7">
        <SampleStepHeading>{copy.questions.sessionLength}</SampleStepHeading>
        <SampleMultiChoiceGroup name="sessionLength" legend={copy.pickAll} options={choiceOptions(SESSION_LENGTH, OPTION_LABEL.sessionLength)}
          value={values.sessionLength} onChange={(sessionLength) => onChange({ sessionLength })} error={error} />
      </div>
    );
  }
  if (field === "tasteRating") {
    return (
      <div className="flex flex-col gap-7">
        <SampleStepHeading>{copy.questions.tasteRating}</SampleStepHeading>
        <div className="flex flex-col gap-2">
          <SampleChoiceGroup name="tasteRating" legend={copy.questions.tasteRating} isLegendHidden options={TASTE_OPTIONS} isScale
            value={values.tasteRating} onChange={(tasteRating) => onChange({ tasteRating })} error={error} />
          <p className="m-0 flex justify-between text-[13px] leading-[18px] text-brand-muted">
            <span>{copy.tasteLow}</span>
            <span>{copy.tasteHigh}</span>
          </p>
        </div>
      </div>
    );
  }
  if (field === "felt") {
    return (
      <div className="flex flex-col gap-7">
        <SampleStepHeading>{copy.questions.felt}</SampleStepHeading>
        <div>
          <SampleMultiChoiceGroup name="felt" legend={copy.pickAll} options={choiceOptions(FEEDBACK_FELT, OPTION_LABEL.felt)}
            value={values.felt} onChange={(felt) => onChange({ felt })} error={groupError} />
          <SampleOtherReveal isOpen={splitChoices(values.felt).includes("other")}>
            <SampleTextArea id="feltOther" name="feltOther" label={copy.questions.feltOther} value={values.feltOther}
              onValueChange={(feltOther) => onChange({ feltOther })} error={otherError} textAreaProps={{ maxLength: 100 }} />
          </SampleOtherReveal>
        </div>
      </div>
    );
  }
  if (field === "wouldReachAgain") {
    return (
      <div className="flex flex-col gap-7">
        <SampleStepHeading>{copy.questions.wouldReachAgain}</SampleStepHeading>
        <SampleChoiceGroup name="wouldReachAgain" legend={copy.questions.wouldReachAgain} isLegendHidden isStacked
          options={choiceOptions(WOULD_REACH_AGAIN, OPTION_LABEL.wouldReachAgain)}
          value={values.wouldReachAgain} onChange={(wouldReachAgain) => onChange({ wouldReachAgain })} error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{copy.questions.comment}</SampleStepHeading>
      <SampleTextArea id="comment" name="comment" label={copy.questions.commentLabel} value={values.comment} allowsLineBreaks
        onValueChange={(comment) => onChange({ comment })} error={error} textAreaProps={{ maxLength: 1000 }} />
    </div>
  );
}
