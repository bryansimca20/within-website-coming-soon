"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState, useTransition } from "react";

import { ATTRIBUTION_FIELDS, type IAttribution, mergeAttribution, readAttributionFromSearch } from "@/app/utils/attribution";
import { requestSampleAction } from "@/app/actions/request-sample.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import {
  EMPTY_SAMPLE_REQUEST_INPUT,
  type ISampleRequestInput,
  SAMPLE_STEP_FIELDS,
  validateSampleStep,
} from "@/app/utils/sample-request-input";
import { GENERIC_ERROR_MESSAGE, SampleRequestOutcome } from "@/app/utils/sample-state";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SampleNotice } from "./SampleNotice";
import { SampleStepDelivery } from "./SampleStepDelivery";
import { SampleStepIndicator } from "./SampleStepIndicator";
import { SampleStepShipping } from "./SampleStepShipping";
import { SampleStepTraining } from "./SampleStepTraining";
import { readStoredAttribution, storeAttribution } from "./utils/attribution-storage";
import { SampleEvent, trackSampleEvent } from "./utils/sample-analytics";
import { formatPayButton, SAMPLE_COPY } from "./utils/sample-copy";
import type { SampleFieldErrors } from "./utils/sample-form-types";
import { openSnap } from "./utils/snap";

type Step = 1 | 2 | 3;
type Ending = { kind: "full" } | { kind: "already"; email: string } | null;

const ATTRIBUTION_KEYS = Object.keys(ATTRIBUTION_FIELDS) as Array<keyof IAttribution>;

/** The URL's attribution, with an earlier visit's filling the gaps. Read fresh, so the URL always wins. */
function currentAttribution(): IAttribution {
  return mergeAttribution(readAttributionFromSearch(window.location.search), readStoredAttribution());
}

/** The three-step request. Holds every value, validates each step before moving on, then pays. */
export function SampleRequestForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<ISampleRequestInput>(EMPTY_SAMPLE_REQUEST_INPUT);
  const [errors, setErrors] = useState<SampleFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [ending, setEnding] = useState<Ending>(null);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => String(Date.now()));

  useEffect(() => {
    const attribution = currentAttribution();
    storeAttribution(attribution);
    trackSampleEvent(SampleEvent.Landed, { ref: attribution.ref ?? "", utm_source: attribution.utmSource ?? "" });
  }, []);

  const change = useCallback((patch: Partial<ISampleRequestInput>) => {
    setValues((previous) => ({ ...previous, ...patch }));
    setServerError(null);
    setErrors((previous) => {
      const next = { ...previous };
      for (const key of Object.keys(patch) as Array<keyof ISampleRequestInput>) delete next[key];
      return next;
    });
  }, []);

  function goTo(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function validateStep(): boolean {
    const stepErrors = validateSampleStep(step, values);
    setErrors(stepErrors);
    const firstField = SAMPLE_STEP_FIELDS[step].find((field) => stepErrors[field] !== undefined);
    if (firstField !== undefined) {
      document.getElementById(firstField)?.focus();
      document.getElementsByName(firstField)[0]?.scrollIntoView({ block: "center" });
      return false;
    }
    trackSampleEvent(SampleEvent.StepCompleted, { step: String(step) });
    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep()) return;
    if (step < 3) {
      goTo((step + 1) as Step);
      return;
    }

    const formData = new FormData(event.currentTarget);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    const attribution = currentAttribution();
    for (const key of ATTRIBUTION_KEYS) formData.set(key, attribution[key] ?? "");

    startTransition(async () => {
      try {
        const result = await requestSampleAction(formData);
        if (result.outcome === SampleRequestOutcome.Pay) {
          trackSampleEvent(SampleEvent.SubmitSucceeded, { ref: attribution.ref ?? "", courier: values.courierCompany });
          trackSampleEvent(SampleEvent.PaymentOpened);
          if (!openSnap(result.snapToken, () => router.push(result.statusUrl))) router.push(result.statusUrl);
          return;
        }
        if (result.outcome === SampleRequestOutcome.Full) {
          setEnding({ kind: "full" });
          return;
        }
        if (result.outcome === SampleRequestOutcome.AlreadyRequested) {
          setEnding({ kind: "already", email: result.email });
          return;
        }
        trackSampleEvent(SampleEvent.SubmitFailed, { reason: result.field ?? "server" });
        if (result.field === null) {
          setServerError(result.message);
          return;
        }
        setErrors({ [result.field]: result.message });
        const owner = ([1, 2, 3] as Step[]).find((candidate) => SAMPLE_STEP_FIELDS[candidate].includes(result.field ?? "email"));
        if (owner !== undefined) goTo(owner);
      } catch {
        setServerError(GENERIC_ERROR_MESSAGE);
        trackSampleEvent(SampleEvent.SubmitFailed, { reason: "server" });
      }
    });
  }

  if (ending !== null) {
    return ending.kind === "full" ? <SampleNotice kind="full" /> : <SampleNotice kind="already" email={ending.email} />;
  }

  const fee = Number(values.shippingFee);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <SampleStepIndicator step={step} />
      {step === 1 && <SampleStepTraining values={values} errors={errors} onChange={change} />}
      {step === 2 && <SampleStepDelivery values={values} errors={errors} onChange={change} />}
      {step === 3 && <SampleStepShipping values={values} errors={errors} onChange={change} onBack={() => goTo(2)} />}

      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />

      {serverError !== null && <p role="alert" className="m-0 text-[13px] leading-[18px] font-semibold">{serverError}</p>}

      <div className="flex items-center gap-3">
        {step > 1 && (
          <button type="button" onClick={() => goTo((step - 1) as Step)} className="h-14 cursor-pointer border border-brand-ink px-5 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
            {SAMPLE_COPY.back}
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || (step === 3 && !(fee > 0))}
          className={step === 3
            ? "flex h-14 flex-1 cursor-pointer items-center justify-between bg-flavor-orange px-5 text-base font-semibold text-brand-ink transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none"
            : "flex h-14 flex-1 cursor-pointer items-center justify-between bg-brand-ink px-5 text-base font-semibold text-brand-mist transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none"}
        >
          <span>{step < 3 ? SAMPLE_COPY.continue : isPending ? SAMPLE_COPY.opening : formatPayButton(fee > 0 ? fee : 0)}</span>
          <WaitlistArrowGlyph />
        </button>
      </div>
    </form>
  );
}
