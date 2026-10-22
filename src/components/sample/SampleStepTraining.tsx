import { splitChoices } from "@/app/utils/sample-request-input";
import { TRAINING_TYPE, type TrainingType } from "@/app/utils/sample-options";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleMultiChoiceGroup } from "./SampleMultiChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { SampleTextArea } from "./SampleTextArea";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;

/** Step 2: every way they train, the one they do most when there are several, and their club or crew. */
export function SampleStepTraining({ values, errors, onChange }: ISampleStepProps) {
  const picked = splitChoices(values.trainingTypes).filter((key): key is TrainingType => (TRAINING_TYPE as readonly string[]).includes(key));

  /** A new pick list; the "most" answer is cleared when it is no longer one of the picks. */
  function changeTypes(next: string) {
    const stillPicked = splitChoices(next).includes(values.trainingPrimary);
    onChange({ trainingTypes: next, ...(stillPicked ? {} : { trainingPrimary: "" }) });
  }

  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{SAMPLE_COPY.headings.training}</SampleStepHeading>
      <div>
        <SampleMultiChoiceGroup name="trainingTypes" legend={training.trainingTypes} options={choiceOptions(TRAINING_TYPE, OPTION_LABEL.trainingType)}
          value={values.trainingTypes} onChange={changeTypes} error={errors.trainingTypes} />
        <SampleOtherReveal isOpen={picked.includes("other")}>
          <SampleTextArea id="trainingOther" name="trainingOther" label={training.other} value={values.trainingOther}
            onValueChange={(trainingOther) => onChange({ trainingOther })} error={errors.trainingOther} textAreaProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
      <SampleOtherReveal isOpen={picked.length > 1}>
        <SampleChoiceGroup name="trainingPrimary" legend={training.trainingPrimary} options={picked.map((key) => ({ value: key, label: OPTION_LABEL.trainingType[key] }))}
          value={values.trainingPrimary} onChange={(trainingPrimary) => onChange({ trainingPrimary })} error={errors.trainingPrimary} />
      </SampleOtherReveal>
      <SampleTextArea id="runClub" name="runClub" label={training.runClub} value={values.runClub}
        onValueChange={(runClub) => onChange({ runClub })} error={errors.runClub}
        textAreaProps={{ placeholder: training.runClubPlaceholder, autoComplete: "off", maxLength: 200 }} />
    </div>
  );
}
