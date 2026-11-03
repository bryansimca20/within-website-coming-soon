import type { ISampleRequestInput, SampleRequestField } from "@/app/utils/sample-request-input";

/** Per-field errors the form shows under each field. */
export type SampleFieldErrors = Partial<Record<SampleRequestField, string>>;

/** What every step component receives from the form that owns the values. */
export interface ISampleStepProps {
  values: ISampleRequestInput;
  errors: SampleFieldErrors;
  onChange: (patch: Partial<ISampleRequestInput>) => void;
}
