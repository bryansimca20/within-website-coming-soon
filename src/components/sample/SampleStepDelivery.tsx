import type { ReactNode } from "react";

import { WaitlistField } from "@/components/waitlist/WaitlistField";

import { SampleAreaSearch } from "./SampleAreaSearch";
import { SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { delivery } = SAMPLE_COPY;
const noop = () => undefined;

interface SampleCheckboxProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}

/** A square ink checkbox with its sentence. */
function SampleCheckbox({ name, checked, onChange, error, children }: SampleCheckboxProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-[22px]">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none border border-brand-ink checked:bg-brand-ink checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5 10.5l3.2 3L15 6.5%22 stroke=%22%23f2f2f2%22 stroke-width=%222%22 fill=%22none%22/></svg>')] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        />
        <span>{children}</span>
      </label>
      {error !== undefined && (
        <p role="alert" className="mt-1.5 mb-0 text-[13px] leading-[18px] font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}

/** Step 2: contact, the area from Biteship, the street address, the two checkboxes. */
export function SampleStepDelivery({ values, errors, onChange }: ISampleStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <WaitlistField id="fullName" name="fullName" label={delivery.fullName} value={values.fullName}
        onValueChange={(fullName) => onChange({ fullName })} onValueBlur={noop} error={errors.fullName}
        inputProps={{ autoComplete: "name", autoCapitalize: "words", placeholder: delivery.fullNamePlaceholder }} />
      <WaitlistField id="email" name="email" label={delivery.email} value={values.email}
        onValueChange={(email) => onChange({ email })} onValueBlur={noop} error={errors.email}
        inputProps={{ type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false, placeholder: delivery.emailPlaceholder }} />
      <WaitlistField id="whatsapp" name="whatsapp" label={delivery.whatsapp} value={values.whatsapp}
        onValueChange={(whatsapp) => onChange({ whatsapp })} onValueBlur={noop} error={errors.whatsapp}
        inputProps={{ type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: delivery.whatsappPlaceholder }} />
      <WaitlistField id="instagramHandle" name="instagramHandle" label={delivery.instagram} value={values.instagramHandle}
        onValueChange={(handle) => onChange({ instagramHandle: handle.replace(/^@+/, "") })} onValueBlur={noop}
        prefix="@" error={errors.instagramHandle}
        inputProps={{ autoComplete: "off", autoCapitalize: "none", spellCheck: false, placeholder: delivery.instagramPlaceholder }} />

      <div className="mt-4">
        <SampleAreaSearch values={values} errors={errors} onChange={onChange} />
      </div>
      <div>
        <div className={errors.addressLine === undefined ? "border-b border-brand-muted pt-2 pb-1.5" : "border-b-2 border-brand-ink pt-2 pb-[5px]"}>
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
          <p role="alert" className="mt-1.5 mb-0 text-[13px] leading-[18px] font-semibold">{errors.addressLine}</p>
        )}
      </div>
      <WaitlistField id="deliveryNote" name="deliveryNote" label={delivery.deliveryNote} value={values.deliveryNote}
        onValueChange={(deliveryNote) => onChange({ deliveryNote })} onValueBlur={noop} error={errors.deliveryNote}
        inputProps={{ autoComplete: "off", placeholder: delivery.deliveryNotePlaceholder }} />

      <div className="mt-4 flex flex-col gap-4">
        <SampleCheckbox name="willShare" checked={values.willShare === "on"} onChange={(checked) => onChange({ willShare: checked ? "on" : "" })}>
          {delivery.willShare}
        </SampleCheckbox>
        <SampleCheckbox name="consent" checked={values.consent === "on"} onChange={(checked) => onChange({ consent: checked ? "on" : "" })} error={errors.consent}>
          {delivery.consent}
        </SampleCheckbox>
      </div>
    </div>
  );
}
