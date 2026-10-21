import { SESSION_LENGTH, SESSIONS_PER_WEEK, TRAIN_WHERE } from "@/app/utils/sample-options";

import { SampleChoiceGroup } from "./SampleChoiceGroup";
import { SampleStepHeading } from "./SampleStepHeading";
import { choiceOptions, OPTION_LABEL, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { training } = SAMPLE_COPY;

/** Step 3: how often, how long and where the visitor trains. */
export function SampleStepSessions({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-7">
      <SampleStepHeading>{SAMPLE_COPY.headings.sessions}</SampleStepHeading>
      <SampleChoiceGroup name="sessionsPerWeek" legend={training.sessionsPerWeek} options={choiceOptions(SESSIONS_PER_WEEK, OPTION_LABEL.sessionsPerWeek)}
        value={values.sessionsPerWeek} onChange={(sessionsPerWeek) => onChange({ sessionsPerWeek })} error={errors.sessionsPerWeek} />
      <SampleChoiceGroup name="sessionLength" legend={training.sessionLength} options={choiceOptions(SESSION_LENGTH, OPTION_LABEL.sessionLength)}
        value={values.sessionLength} onChange={(sessionLength) => onChange({ sessionLength })} error={errors.sessionLength} />
      <SampleChoiceGroup name="trainWhere" legend={training.trainWhere} options={choiceOptions(TRAIN_WHERE, OPTION_LABEL.trainWhere)}
        value={values.trainWhere} onChange={(trainWhere) => onChange({ trainWhere })} error={errors.trainWhere} />
    </div>
  );
}
