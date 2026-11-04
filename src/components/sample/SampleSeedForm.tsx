"use client";

import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, type JSX, useCallback, useState, useTransition } from "react";

import { seedSampleAction } from "@/app/actions/seed-sample.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import { EMPTY_SAMPLE_REQUEST_INPUT, type ISampleRequestInput, type SampleStep } from "@/app/utils/sample-request-input";
import { SEED_STEP_FIELDS, validateSeedStep } from "@/app/utils/sample-seed-input";
import { GENERIC_ERROR_MESSAGE, SampleSeedOutcome } from "@/app/utils/sample-state";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SampleSeedThanks } from "./SampleSeedThanks";
import { SampleStepContact } from "./SampleStepContact";
import { SampleStepIndicator } from "./SampleStepIndicator";
import { SampleStepSeedPhone } from "./SampleStepSeedPhone";
import { SampleStepSessions } from "./SampleStepSessions";
import { SampleStepTraining } from "./SampleStepTraining";
import { SampleStepWithin } from "./SampleStepWithin";
import { SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps, SampleFieldErrors } from "./utils/sample-form-types";
import { SAMPLE_ALERT_FADE, SAMPLE_STEP_SLIDE } from "./utils/sample-motion";
import { useSampleStepHistory } from "./utils/use-sample-step-history";

const { seed } = SAMPLE_COPY;
const STEPS: SampleStep[] = [1, 2, 3, 4, 5];
const STEP_SCREENS: Record<SampleStep, (props: ISampleStepProps) => JSX.Element> = {
  1: SampleStepContact,
  2: SampleStepTraining,
  3: SampleStepSessions,
  4: SampleStepWithin,
  5: SampleStepSeedPhone,
};

interface SampleSeedFormProps {
  /** Starts a fresh form for the next person. */
  onAgain: () => void;
}

/** The in-person form, remounted from scratch for each next person. */
export function SampleSeedForm() {
  const [round, setRound] = useState(0);

  return <SampleSeedFlow key={round} onAgain={() => setRound((previous) => previous + 1)} />;
}

/** The public form's four survey steps, then WhatsApp. No intro, no payment. */
function SampleSeedFlow({ onAgain }: SampleSeedFormProps) {
  const { screen, direction, goForward, goBack, returnTo } = useSampleStepHistory();
  const [values, setValues] = useState<ISampleRequestInput>(EMPTY_SAMPLE_REQUEST_INPUT);
  const [errors, setErrors] = useState<SampleFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [seededName, setSeededName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => String(Date.now()));
  // The history hook opens on its intro screen (0); this form has none, so that is step 1.
  const step: SampleStep = screen === 0 ? 1 : screen;
  const isLast = step === 5;

  const change = useCallback((patch: Partial<ISampleRequestInput>) => {
    setValues((previous) => ({ ...previous, ...patch }));
    setServerError(null);
    setErrors((previous) => {
      const next = { ...previous };
      for (const key of Object.keys(patch) as Array<keyof ISampleRequestInput>) delete next[key];
      return next;
    });
  }, []);

  function validateStep(): boolean {
    const stepErrors = validateSeedStep(step, values);
    setErrors(stepErrors);
    const firstField = SEED_STEP_FIELDS[step].find((field) => stepErrors[field] !== undefined);
    if (firstField === undefined) return true;
    document.getElementById(firstField)?.focus();
    document.getElementsByName(firstField)[0]?.scrollIntoView({ block: "center" });
    return false;
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await seedSampleAction(formData);
        if (result.outcome === SampleSeedOutcome.Seeded) return setSeededName(result.firstName);
        if (result.outcome === SampleSeedOutcome.AlreadyRequested) {
          setErrors({ email: seed.already });
          return returnTo(1);
        }
        if (result.field === null) return setServerError(result.message);
        setErrors({ [result.field]: result.message });
        const owner = STEPS.find((candidate) => SEED_STEP_FIELDS[candidate].includes(result.field ?? "email"));
        if (owner !== undefined) returnTo(owner);
      } catch {
        setServerError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep()) return;
    if (!isLast) return goForward((step + 1) as SampleStep);
    const formData = new FormData(event.currentTarget);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    submit(formData);
  }

  if (seededName !== null) return <SampleSeedThanks firstName={seededName} onAgain={onAgain} />;

  const StepScreen = STEP_SCREENS[step];
  const buttonLabel = !isLast ? SAMPLE_COPY.continue : isPending ? seed.submitting : seed.submit;

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto flex w-full max-w-[560px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em] text-balance">{seed.title}</h1>
        <p className="m-0 text-[17px] leading-[26px] text-pretty">{seed.intro}</p>
      </div>
      <SampleStepIndicator step={step} labels={seed.steps} counter={SAMPLE_COPY.stepCounter} onBack={step > 1 ? goBack : undefined} />
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div key={step} custom={direction} variants={SAMPLE_STEP_SLIDE} initial="enter" animate="center" exit="exit" className={SAMPLE_ALERT_FADE}>
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
        disabled={isPending}
        className="flex h-14 w-full cursor-pointer items-center justify-between bg-brand-ink px-5 text-base font-semibold text-brand-mist transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none"
      >
        {buttonLabel}
        <WaitlistArrowGlyph />
      </button>
    </form>
  );
}
