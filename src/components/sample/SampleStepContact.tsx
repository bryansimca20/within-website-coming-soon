import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleCheckbox } from "./SampleCheckbox";
import { SampleStepHeading } from "./SampleStepHeading";
import { SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { delivery } = SAMPLE_COPY;
const noop = () => undefined;

/** Step 1: name, email (with why it matters), Instagram, and the two promises. No phone here. */
export function SampleStepContact({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <SampleStepHeading>{SAMPLE_COPY.headings.contact}</SampleStepHeading>
      <WaitlistField id="fullName" name="fullName" label={delivery.fullName} value={values.fullName}
        onValueChange={(fullName) => onChange({ fullName })} onValueBlur={noop} error={errors.fullName}
        inputProps={{ autoComplete: "name", autoCapitalize: "words", maxLength: 100, placeholder: delivery.fullNamePlaceholder }} />
      <div>
        <WaitlistField id="email" name="email" label={delivery.email} value={values.email}
          onValueChange={(email) => onChange({ email })} onValueBlur={noop} error={errors.email}
          inputProps={{ type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false, placeholder: delivery.emailPlaceholder }} />
        <p className="mt-1.5 mb-0 text-[13px] leading-[18px] text-brand-muted">{delivery.emailHint}</p>
      </div>
      <WaitlistField id="instagramHandle" name="instagramHandle" label={delivery.instagram} value={values.instagramHandle}
        onValueChange={(handle) => onChange({ instagramHandle: handle.replace(/^@+/, "") })} onValueBlur={noop}
        prefix="@" error={errors.instagramHandle}
        inputProps={{ autoComplete: "off", autoCapitalize: "none", spellCheck: false, placeholder: delivery.instagramPlaceholder }} />

      <div className="mt-4 flex flex-col gap-1">
        <SampleCheckbox name="consent" checked={values.consent === "on"} onChange={(checked) => onChange({ consent: checked ? "on" : "" })} error={errors.consent}>
          {delivery.consent}
        </SampleCheckbox>
        <SampleCheckbox name="willShare" checked={values.willShare === "on"} onChange={(checked) => onChange({ willShare: checked ? "on" : "" })}
          description={delivery.willShareNote}>
          {delivery.willShare}
        </SampleCheckbox>
      </div>
    </div>
  );
}
