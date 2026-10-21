"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type FormEvent, type JSX, useCallback, useEffect, useState, useTransition } from "react";

import { ATTRIBUTION_FIELDS, type IAttribution, mergeAttribution, readAttributionFromSearch } from "@/app/utils/attribution";
import { requestSampleAction } from "@/app/actions/request-sample.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import {
  EMPTY_SAMPLE_REQUEST_INPUT,
  type ISampleRequestInput,
  SAMPLE_STEP_FIELDS,
  type SampleStep,
  validateSampleStep,
} from "@/app/utils/sample-request-input";
import { GENERIC_ERROR_MESSAGE, SampleRequestOutcome } from "@/app/utils/sample-state";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";
import { cn } from "@/lib/utils";

import { SampleIntro } from "./SampleIntro";
import { SampleNotice } from "./SampleNotice";
import { SampleStepContact } from "./SampleStepContact";
import { SampleStepGoal } from "./SampleStepGoal";
import { SampleStepIndicator } from "./SampleStepIndicator";
import { SampleStepSessions } from "./SampleStepSessions";
import { SampleStepShipping } from "./SampleStepShipping";
import { SampleStepSport } from "./SampleStepSport";
import { readStoredAttribution, storeAttribution } from "./utils/attribution-storage";
import { SampleEvent, trackSampleEvent } from "./utils/sample-analytics";
import { formatPayButton, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps, SampleFieldErrors } from "./utils/sample-form-types";
import { sampleDevValues } from "./utils/sample-dev-fixtures";
import { openSnap } from "./utils/snap";
import { SAMPLE_ALERT_FADE, SAMPLE_STEP_SLIDE } from "./utils/sample-motion";
import { useSampleStepHistory } from "./utils/use-sample-step-history";

type Ending = { kind: "full" } | { kind: "already"; email: string } | null;

const ATTRIBUTION_KEYS = Object.keys(ATTRIBUTION_FIELDS) as Array<keyof IAttribution>;
const STEPS: SampleStep[] = [1, 2, 3, 4, 5];
const STEP_SCREENS: Record<SampleStep, (props: ISampleStepProps) => JSX.Element> = {
  1: SampleStepContact,
  2: SampleStepSport,
  3: SampleStepSessions,
  4: SampleStepGoal,
  5: SampleStepShipping,
};

/** The URL's attribution, with an earlier visit's filling the gaps. Read fresh, so the URL always wins. */
function currentAttribution(): IAttribution {
  return mergeAttribution(readAttributionFromSearch(window.location.search), readStoredAttribution());
}

/** The intro, then five short steps. Holds every value, validates each step before moving on, then pays. */
export function SampleRequestForm() {
  const router = useRouter();
  const { screen, direction, goForward, goBack, returnTo } = useSampleStepHistory();
  const [values, setValues] = useState<ISampleRequestInput>(() => sampleDevValues() ?? EMPTY_SAMPLE_REQUEST_INPUT);
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

  function validateStep(step: SampleStep): boolean {
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

  function submit(formData: FormData) {
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
        if (result.outcome === SampleRequestOutcome.Full) return setEnding({ kind: "full" });
        if (result.outcome === SampleRequestOutcome.AlreadyRequested) return setEnding({ kind: "already", email: result.email });
        trackSampleEvent(SampleEvent.SubmitFailed, { reason: result.field ?? "server" });
        if (result.field === null) return setServerError(result.message);
        setErrors({ [result.field]: result.message });
        const owner = STEPS.find((candidate) => SAMPLE_STEP_FIELDS[candidate].includes(result.field ?? "email"));
        if (owner !== undefined) returnTo(owner);
      } catch {
        setServerError(GENERIC_ERROR_MESSAGE);
        trackSampleEvent(SampleEvent.SubmitFailed, { reason: "server" });
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (screen === 0 || !validateStep(screen)) return;
    if (screen < 5) return goForward((screen + 1) as SampleStep);
    const formData = new FormData(event.currentTarget);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    submit(formData);
  }

  if (ending !== null) {
    return ending.kind === "full" ? <SampleNotice kind="full" /> : <SampleNotice kind="already" email={ending.email} />;
  }

  if (screen === 0) {
    return (
      <SampleIntro
        onContinue={() => {
          trackSampleEvent(SampleEvent.IntroContinued);
          goForward(1);
        }}
      />
    );
  }

  const fee = Number(values.shippingFee);
  const isLast = screen === 5;
  const StepScreen = STEP_SCREENS[screen];
  const buttonLabel = !isLast ? SAMPLE_COPY.continue : isPending ? SAMPLE_COPY.opening : formatPayButton(fee > 0 ? fee : 0);

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto flex w-full max-w-[560px] flex-col gap-8">
      <SampleStepIndicator step={screen} onBack={goBack} />
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div key={screen} custom={direction} variants={SAMPLE_STEP_SLIDE} initial="enter" animate="center" exit="exit" className={SAMPLE_ALERT_FADE}>
          <StepScreen values={values} errors={errors} onChange={change} />
        </motion.div>
      </AnimatePresence>

      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />

      {serverError !== null && <p role="alert" className="m-0 text-[13px] leading-[18px] font-semibold text-brand-error">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending || (isLast && !(fee > 0))}
        className={cn(
          "flex h-14 w-full cursor-pointer items-center justify-between px-5 text-base font-semibold transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none",
          isLast ? "bg-flavor-orange text-brand-ink" : "bg-brand-ink text-brand-mist"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={buttonLabel}
            initial={{ opacity: 0, filter: "blur(2px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: 0.1 }}
          >
            {buttonLabel}
          </motion.span>
        </AnimatePresence>
        <WaitlistArrowGlyph />
      </button>
    </form>
  );
}
