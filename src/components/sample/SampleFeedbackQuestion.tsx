import {
  FeedbackStep,
  HEADLINE_MAX_LENGTH,
  type ISampleFeedbackInput,
  REVIEW_MAX_LENGTH,
  type SampleFeedbackField,
} from "@/app/utils/sample-feedback-input";
import { FEEDBACK_FELT } from "@/app/utils/sample-options";
import { splitChoices } from "@/app/utils/sample-request-input";
import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleFeedbackStars } from "./SampleFeedbackStars";
import { SampleMultiChoiceGroup } from "./SampleMultiChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { SampleTextArea } from "./SampleTextArea";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";

const { feedback: copy } = SAMPLE_COPY;
const SCORE_OPTIONS = ["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }));

interface SampleFeedbackQuestionProps {
  step: FeedbackStep;
  values: ISampleFeedbackInput;
  onChange: (patch: Partial<ISampleFeedbackInput>) => void;
  /** Greets by name on the first screen when the review knows who this is. */
  firstName: string | null;
  error?: string;
  /** Which field the error belongs to, so it lands under that field. */
  errorField?: SampleFeedbackField;
}

/** A 1 to 5 scale with its two end labels underneath. */
function ScoreScale({ name, legend, low, high, value, onChange, error }: {
  name: "tasteRating" | "effectiveness"; legend: string; low: string; high: string; value: string; onChange: (value: string) => void; error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SampleChoiceGroup name={name} legend={legend} options={SCORE_OPTIONS} isScale value={value} onChange={onChange} error={error} />
      <p className="m-0 flex justify-between text-[13px] leading-[18px] text-brand-muted">
        <span>{low}</span>
        <span>{high}</span>
      </p>
    </div>
  );
}

/** One review screen: stars and the review, the optional headline, the two scores, or how they felt. */
export function SampleFeedbackQuestion({ step, values, onChange, firstName, error, errorField }: SampleFeedbackQuestionProps) {
  const errorFor = (field: SampleFeedbackField) => (errorField === field ? error : undefined);

  if (step === FeedbackStep.Review) {
    return (
      <div className="flex flex-col gap-9">
        <div className="flex flex-col items-center gap-4 text-center">
          <SampleStepHeading>{firstName === null ? copy.ratingQuestion : copy.ratingQuestionNamed(firstName)}</SampleStepHeading>
          <SampleFeedbackStars value={values.rating} onChange={(rating) => onChange({ rating })} error={errorFor("rating")} />
        </div>
        <SampleTextArea id="review" name="review" label={copy.reviewLabel} value={values.review} allowsLineBreaks
          onValueChange={(review) => onChange({ review })} error={errorFor("review")}
          textAreaProps={{ maxLength: REVIEW_MAX_LENGTH, placeholder: copy.reviewPlaceholder, rows: 4 }} />
      </div>
    );
  }
  if (step === FeedbackStep.Headline) {
    return (
      <div className="flex flex-col gap-7">
        <SampleStepHeading>{copy.headlineQuestion}</SampleStepHeading>
        <div className="flex flex-col gap-2 bg-brand-mist p-4">
          <span className="text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted uppercase">{copy.yourReview}</span>
          <p className="m-0 text-[15px] leading-[22px] break-words whitespace-pre-line">{values.review}</p>
        </div>
        <WaitlistField id="headline" name="headline" label={copy.headlineLabel} value={values.headline}
          onValueChange={(headline) => onChange({ headline })} onValueBlur={() => undefined} error={errorFor("headline")}
          inputProps={{ maxLength: HEADLINE_MAX_LENGTH, placeholder: copy.headlinePlaceholder, autoComplete: "off" }} />
      </div>
    );
  }
  if (step === FeedbackStep.Scores) {
    return (
      <div className="flex flex-col gap-8">
        <SampleStepHeading>{copy.scoresHeading}</SampleStepHeading>
        <ScoreScale name="tasteRating" legend={copy.tasteQuestion} low={copy.tasteLow} high={copy.tasteHigh}
          value={values.tasteRating} onChange={(tasteRating) => onChange({ tasteRating })} error={errorFor("tasteRating")} />
        <ScoreScale name="effectiveness" legend={copy.effectivenessQuestion} low={copy.effectivenessLow} high={copy.effectivenessHigh}
          value={values.effectiveness} onChange={(effectiveness) => onChange({ effectiveness })} error={errorFor("effectiveness")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{copy.feltQuestion}</SampleStepHeading>
      <div>
        <SampleMultiChoiceGroup name="felt" legend={copy.pickAll} options={choiceOptions(FEEDBACK_FELT, OPTION_LABEL.felt)}
          value={values.felt} onChange={(felt) => onChange({ felt })} error={errorFor("felt")} />
        <SampleOtherReveal isOpen={splitChoices(values.felt).includes("other")}>
          <SampleTextArea id="feltOther" name="feltOther" label={copy.feltOther} value={values.feltOther}
            onValueChange={(feltOther) => onChange({ feltOther })} error={errorFor("feltOther")} textAreaProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
    </div>
  );
}
