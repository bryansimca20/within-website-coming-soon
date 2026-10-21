"use client";

import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleAreaSearch } from "./SampleAreaSearch";
import { SampleCourierOptions } from "./SampleCourierOptions";
import { SampleStepHeading } from "./SampleStepHeading";
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
      <div>
        <div className={errors.addressLine === undefined ? "border-b border-brand-muted pt-2 pb-1.5" : "border-b-2 border-brand-error pt-2 pb-[5px]"}>
          <label htmlFor="addressLine" className="text-[13px] leading-[18px] text-brand-muted">
            {delivery.addressLine}
          </label>
          <textarea
            id="addressLine"
            name="addressLine"
            rows={2}
            value={values.addressLine}
            onChange={(event) => onChange({ addressLine: event.currentTarget.value })}
            autoComplete="street-address"
            placeholder={delivery.addressPlaceholder}
            aria-invalid={errors.addressLine !== undefined}
            className="m-0 block w-full resize-none appearance-none rounded-none border-0 bg-transparent px-0 py-1 text-base leading-6 outline-none placeholder:text-brand-muted"
          />
        </div>
        {errors.addressLine !== undefined && (
          <p role="alert" className="mt-1.5 mb-0 text-[13px] leading-[18px] font-semibold text-brand-error">{errors.addressLine}</p>
        )}
      </div>
      <div>
        <WaitlistField id="whatsapp" name="whatsapp" label={delivery.whatsapp} value={values.whatsapp}
          onValueChange={(whatsapp) => onChange({ whatsapp })} onValueBlur={noop} error={errors.whatsapp}
          inputProps={{ type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: delivery.whatsappPlaceholder }} />
        <p className="mt-1.5 mb-0 text-[13px] leading-[18px] text-brand-muted">{delivery.whatsappHint}</p>
      </div>
      <WaitlistField id="deliveryNote" name="deliveryNote" label={delivery.deliveryNote} value={values.deliveryNote}
        onValueChange={(deliveryNote) => onChange({ deliveryNote })} onValueBlur={noop} error={errors.deliveryNote}
        inputProps={{ autoComplete: "off", placeholder: delivery.deliveryNotePlaceholder }} />

      <div className="mt-4">
        <SampleCourierOptions values={values} errors={errors} onChange={onChange} />
      </div>
    </div>
  );
}
