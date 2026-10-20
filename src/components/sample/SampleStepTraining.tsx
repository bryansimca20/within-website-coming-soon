import {
  HYDRATION_GOAL,
  MAIN_SPORT,
  SESSION_LENGTH,
  SESSIONS_PER_WEEK,
  TRAIN_WHERE,
} from "@/app/utils/sample-options";
import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;

function options<T extends string>(keys: readonly T[], labels: Record<T, string>) {
  return keys.map((value) => ({ value, label: labels[value] }));
}

/** Step 1: who the sampler is as an athlete. Six short questions, one optional. */
export function SampleStepTraining({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-7">
      <SampleChoiceGroup
        name="mainSport"
        legend={training.mainSport}
        options={options(MAIN_SPORT, OPTION_LABEL.mainSport)}
        value={values.mainSport}
        onChange={(mainSport) => onChange({ mainSport })}
        error={errors.mainSport}
      />
      {values.mainSport === "other" && (
        <WaitlistField
          id="mainSportOther"
          name="mainSportOther"
          label={training.mainSportOther}
          value={values.mainSportOther}
          onValueChange={(mainSportOther) => onChange({ mainSportOther })}
          onValueBlur={() => undefined}
          error={errors.mainSportOther}
        />
      )}
      <SampleChoiceGroup
        name="sessionsPerWeek"
        legend={training.sessionsPerWeek}
        options={options(SESSIONS_PER_WEEK, OPTION_LABEL.sessionsPerWeek)}
        value={values.sessionsPerWeek}
        onChange={(sessionsPerWeek) => onChange({ sessionsPerWeek })}
        error={errors.sessionsPerWeek}
      />
      <SampleChoiceGroup
        name="sessionLength"
        legend={training.sessionLength}
        options={options(SESSION_LENGTH, OPTION_LABEL.sessionLength)}
        value={values.sessionLength}
        onChange={(sessionLength) => onChange({ sessionLength })}
        error={errors.sessionLength}
      />
      <SampleChoiceGroup
        name="trainWhere"
        legend={training.trainWhere}
        options={options(TRAIN_WHERE, OPTION_LABEL.trainWhere)}
        value={values.trainWhere}
        onChange={(trainWhere) => onChange({ trainWhere })}
        error={errors.trainWhere}
      />
      <SampleChoiceGroup
        name="hydrationGoal"
        legend={training.hydrationGoal}
        options={options(HYDRATION_GOAL, OPTION_LABEL.hydrationGoal)}
        value={values.hydrationGoal}
        onChange={(hydrationGoal) => onChange({ hydrationGoal })}
        error={errors.hydrationGoal}
      />
      {values.hydrationGoal === "other" && (
        <WaitlistField
          id="hydrationGoalOther"
          name="hydrationGoalOther"
          label={training.hydrationGoalOther}
          value={values.hydrationGoalOther}
          onValueChange={(hydrationGoalOther) => onChange({ hydrationGoalOther })}
          onValueBlur={() => undefined}
          error={errors.hydrationGoalOther}
        />
      )}
      <WaitlistField
        id="runClub"
        name="runClub"
        label={training.runClub}
        value={values.runClub}
        onValueChange={(runClub) => onChange({ runClub })}
        onValueBlur={() => undefined}
        error={errors.runClub}
        inputProps={{ placeholder: training.runClubPlaceholder, autoComplete: "off" }}
      />
    </div>
  );
}
