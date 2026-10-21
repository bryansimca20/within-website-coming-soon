import { MAIN_SPORT } from "@/app/utils/sample-options";
import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleOtherReveal } from "./SampleOtherReveal";
import { SampleStepHeading } from "./SampleStepHeading";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;
const noop = () => undefined;

/** Step 2: the main sport, and the run club if there is one. */
export function SampleStepSport({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{SAMPLE_COPY.headings.sport}</SampleStepHeading>
      <div>
        <SampleChoiceGroup name="mainSport" legend={training.mainSport} options={choiceOptions(MAIN_SPORT, OPTION_LABEL.mainSport)}
          value={values.mainSport} onChange={(mainSport) => onChange({ mainSport })} error={errors.mainSport} />
        <SampleOtherReveal isOpen={values.mainSport === "other"}>
          <WaitlistField id="mainSportOther" name="mainSportOther" label={training.mainSportOther} value={values.mainSportOther}
            onValueChange={(mainSportOther) => onChange({ mainSportOther })} onValueBlur={noop} error={errors.mainSportOther}
            inputProps={{ maxLength: 100 }} />
        </SampleOtherReveal>
      </div>
      <WaitlistField id="runClub" name="runClub" label={training.runClub} value={values.runClub}
        onValueChange={(runClub) => onChange({ runClub })} onValueBlur={noop} error={errors.runClub}
        inputProps={{ placeholder: training.runClubPlaceholder, autoComplete: "off", maxLength: 200 }} />
    </div>
  );
}
