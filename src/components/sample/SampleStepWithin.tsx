import { splitChoices } from "@/app/utils/sample-request-input";
import { HEARD_FROM, HOPE, WHY_REASON } from "@/app/utils/sample-options";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleMultiChoiceGroup } from "./SampleMultiChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { SampleTextArea } from "./SampleTextArea";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;

/** Step 4: how they heard about WITHIN, why they want to try it, and what they hope it does. */
export function SampleStepWithin({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{SAMPLE_COPY.headings.within}</SampleStepHeading>
      <div>
        <SampleChoiceGroup name="heardFrom" legend={training.heardFrom} options={choiceOptions(HEARD_FROM, OPTION_LABEL.heardFrom)} isStacked
          value={values.heardFrom} onChange={(heardFrom) => onChange({ heardFrom })} error={errors.heardFrom} />
        <SampleOtherReveal isOpen={values.heardFrom === "other"}>
          <SampleTextArea id="heardFromOther" name="heardFromOther" label={training.other} value={values.heardFromOther}
            onValueChange={(heardFromOther) => onChange({ heardFromOther })} error={errors.heardFromOther} textAreaProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
      <div>
        <SampleMultiChoiceGroup name="whyReasons" legend={training.whyReasons} options={choiceOptions(WHY_REASON, OPTION_LABEL.whyReason)} isStacked
          value={values.whyReasons} onChange={(whyReasons) => onChange({ whyReasons })} error={errors.whyReasons} />
        <SampleOtherReveal isOpen={splitChoices(values.whyReasons).includes("other")}>
          <SampleTextArea id="whyOther" name="whyOther" label={training.other} value={values.whyOther}
            onValueChange={(whyOther) => onChange({ whyOther })} error={errors.whyOther} textAreaProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
      <div>
        <SampleMultiChoiceGroup name="hopes" legend={training.hopes} options={choiceOptions(HOPE, OPTION_LABEL.hope)}
          value={values.hopes} onChange={(hopes) => onChange({ hopes })} error={errors.hopes} />
        <SampleOtherReveal isOpen={splitChoices(values.hopes).includes("other")}>
          <SampleTextArea id="hopesOther" name="hopesOther" label={training.other} value={values.hopesOther}
            onValueChange={(hopesOther) => onChange({ hopesOther })} error={errors.hopesOther} textAreaProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
    </div>
  );
}
