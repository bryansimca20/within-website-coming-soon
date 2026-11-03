"use client";

import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleAreaSearch } from "./SampleAreaSearch";
import { SampleCourierOptions } from "./SampleCourierOptions";
import { SampleStepHeading } from "./SampleStepHeading";
import { SampleTextArea } from "./SampleTextArea";
import { SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { delivery } = SAMPLE_COPY;
const noop = () => undefined;

/** Step 5: where the box goes, the courier's phone number, then live courier prices. */
export function SampleStepShipping({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <SampleStepHeading>{SAMPLE_COPY.headings.shipping}</SampleStepHeading>
      <SampleAreaSearch values={values} errors={errors} onChange={onChange} />
      <SampleTextArea id="addressLine" name="addressLine" label={delivery.addressLine} value={values.addressLine}
        onValueChange={(addressLine) => onChange({ addressLine })} error={errors.addressLine} allowsLineBreaks
        textAreaProps={{ autoComplete: "street-address", maxLength: 255, placeholder: delivery.addressPlaceholder }} />
      <div>
        <WaitlistField id="whatsapp" name="whatsapp" label={delivery.whatsapp} value={values.whatsapp}
          onValueChange={(whatsapp) => onChange({ whatsapp })} onValueBlur={noop} error={errors.whatsapp}
          inputProps={{ type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: delivery.whatsappPlaceholder }} />
        <p className="mt-1.5 mb-0 text-[13px] leading-[18px] text-brand-muted">{delivery.whatsappHint}</p>
      </div>
      <SampleTextArea id="deliveryNote" name="deliveryNote" label={delivery.deliveryNote} value={values.deliveryNote}
        onValueChange={(deliveryNote) => onChange({ deliveryNote })} error={errors.deliveryNote}
        textAreaProps={{ autoComplete: "off", maxLength: 200, placeholder: delivery.deliveryNotePlaceholder }} />

      <div className="mt-4">
        <SampleCourierOptions values={values} errors={errors} onChange={onChange} />
      </div>
    </div>
  );
}
