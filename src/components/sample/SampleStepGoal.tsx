import { HYDRATION_GOAL } from "@/app/utils/sample-options";
import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;
const noop = () => undefined;

/** Step 4: what the visitor wants most from hydration. The question is the heading. */
export function SampleStepGoal({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{SAMPLE_COPY.headings.goal}</SampleStepHeading>
      <div>
        <SampleChoiceGroup name="hydrationGoal" legend={training.hydrationGoal} isLegendHidden
          options={choiceOptions(HYDRATION_GOAL, OPTION_LABEL.hydrationGoal)}
          value={values.hydrationGoal} onChange={(hydrationGoal) => onChange({ hydrationGoal })} error={errors.hydrationGoal} />
        <SampleOtherReveal isOpen={values.hydrationGoal === "other"}>
          <WaitlistField id="hydrationGoalOther" name="hydrationGoalOther" label={training.hydrationGoalOther} value={values.hydrationGoalOther}
            onValueChange={(hydrationGoalOther) => onChange({ hydrationGoalOther })} onValueBlur={noop} error={errors.hydrationGoalOther}
          inputProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
    </div>
  );
}
