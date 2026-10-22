import { MAIN_SPORT } from "@/app/utils/sample-options";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { SampleTextArea } from "./SampleTextArea";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;

/** Step 2: the main sport, and the run club if there is one. */
export function SampleStepSport({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{SAMPLE_COPY.headings.sport}</SampleStepHeading>
      <div>
        <SampleChoiceGroup name="mainSport" legend={training.mainSport} options={choiceOptions(MAIN_SPORT, OPTION_LABEL.mainSport)}
          value={values.mainSport} onChange={(mainSport) => onChange({ mainSport })} error={errors.mainSport} />
        <SampleOtherReveal isOpen={values.mainSport === "other"}>
          <SampleTextArea id="mainSportOther" name="mainSportOther" label={training.mainSportOther} value={values.mainSportOther}
            onValueChange={(mainSportOther) => onChange({ mainSportOther })} error={errors.mainSportOther}
            textAreaProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
      <SampleTextArea id="runClub" name="runClub" label={training.runClub} value={values.runClub}
        onValueChange={(runClub) => onChange({ runClub })} error={errors.runClub}
        textAreaProps={{ placeholder: training.runClubPlaceholder, autoComplete: "off", maxLength: 200 }} />
    </div>
  );
}
