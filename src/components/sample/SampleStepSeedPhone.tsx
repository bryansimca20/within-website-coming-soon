"use client";

import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleStepHeading } from "./SampleStepHeading";
import { SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { delivery } = SAMPLE_COPY;
const noop = () => undefined;

/** Step 5 of the in-person form: the WhatsApp number, nothing else. */
export function SampleStepSeedPhone({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <SampleStepHeading>{SAMPLE_COPY.headings.shipping}</SampleStepHeading>
      <div>
        <WaitlistField id="whatsapp" name="whatsapp" label={delivery.whatsapp} value={values.whatsapp}
          onValueChange={(whatsapp) => onChange({ whatsapp })} onValueBlur={noop} error={errors.whatsapp}
          inputProps={{ type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: delivery.whatsappPlaceholder }} />
        <p className="mt-1.5 mb-0 text-[13px] leading-[18px] text-brand-muted">{delivery.whatsappHint}</p>
      </div>
    </div>
  );
}
