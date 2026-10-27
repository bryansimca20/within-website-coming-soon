"use client";

import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useState, useTransition } from "react";

import { checkFeedbackEmailAction } from "@/app/actions/check-feedback-email.action";
import { submitFeedbackAction } from "@/app/actions/submit-feedback.action";
import { FeedbackEligibility } from "@/app/utils/feedback-eligibility";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import {
  EMPTY_SAMPLE_FEEDBACK_INPUT,
  FEEDBACK_QUESTION_ORDER,
  type ISampleFeedbackInput,
  type SampleFeedbackField,
  validateFeedbackStep,
} from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
import { normalizeEmail } from "@/app/utils/subscriber-input";
import { WaitlistField } from "@/components/waitlist/WaitlistField";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SampleFeedbackQuestion } from "./SampleFeedbackQuestion";
import { SampleFeedbackThanks } from "./SampleFeedbackThanks";
import { SampleStepIndicator } from "./SampleStepIndicator";
import { SampleEvent, trackSampleEvent } from "./utils/sample-analytics";
import { SAMPLE_COPY } from "./utils/sample-copy";
import { SAMPLE_ALERT_FADE, SAMPLE_STEP_SLIDE } from "./utils/sample-motion";
import type { SampleDirection } from "./utils/use-sample-step-history";

const { feedback: copy } = SAMPLE_COPY;
const LAST = FEEDBACK_QUESTION_ORDER.length - 1;
const BUTTON_CLASS =
  "flex h-14 w-full cursor-pointer items-center justify-between bg-brand-ink px-5 text-base font-semibold text-brand-mist transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none";

/** What the email screen says when an email can't continue. */
const EMAIL_MESSAGE: Record<FeedbackEligibility, string> = {
  [FeedbackEligibility.Ok]: "",
  [FeedbackEligibility.NotFound]: copy.emailNotFound,
  [FeedbackEligibility.NotShipped]: copy.emailNotShipped,
  [FeedbackEligibility.AlreadyGiven]: copy.emailAlreadyGiven,
};

type FieldError = { field: SampleFeedbackField; message: string } | null;

interface SampleFeedbackFormProps {
  /** The personal link's token, already matched to a request on the server. Null starts at the email screen. */
  code: string | null;
  firstName: string | null;
}

/** The check-in: an email first unless the link already says who this is, then six questions, styled like the request. */
export function SampleFeedbackForm({ code, firstName }: SampleFeedbackFormProps) {
  const [values, setValues] = useState<ISampleFeedbackInput>({ ...EMPTY_SAMPLE_FEEDBACK_INPUT, code: code ?? "" });
  const [index, setIndex] = useState(code === null ? -1 : 0);
  const [direction, setDirection] = useState<SampleDirection>(1);
  const [error, setError] = useState<FieldError>(null);
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => String(Date.now()));
  const [greetName, setGreetName] = useState(firstName);

  if (isDone) return <SampleFeedbackThanks firstName={greetName} />;

  const field: SampleFeedbackField = index === -1 ? "email" : FEEDBACK_QUESTION_ORDER[index];

  function change(patch: Partial<ISampleFeedbackInput>) {
    setValues((previous) => ({ ...previous, ...patch }));
    setError(null);
  }

  function go(next: number) {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
    setError(null);
    window.scrollTo({ top: 0 });
  }

  /** The current screen's own check, before moving on; an "Other" text error names its own field. */
  function currentError(): FieldError {
    if (field === "email") return normalizeEmail(values.email) === null ? { field, message: copy.emailNotFound } : null;
    return validateFeedbackStep(field, values);
  }

  function checkEmail() {
    startTransition(async () => {
      try {
        const check = await checkFeedbackEmailAction(values.email);
        if (check.eligibility !== FeedbackEligibility.Ok) return setError({ field: "email", message: EMAIL_MESSAGE[check.eligibility] });
        setGreetName(check.firstName);
        go(0);
      } catch {
        setError({ field: "email", message: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await submitFeedbackAction(formData);
        if (result.outcome === FeedbackOutcome.Success) {
          trackSampleEvent(SampleEvent.FeedbackSubmitted, { intent: values.wouldReachAgain });
          return setIsDone(true);
        }
        if (result.field === "email" && code === null) go(-1);
        setError({ field: (result.field ?? field) as SampleFeedbackField, message: result.message });
      } catch {
        setError({ field, message: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = currentError();
    if (problem !== null) return setError(problem);
    if (field === "email") return checkEmail();
    if (index < LAST) return go(index + 1);
    const formData = new FormData(event.currentTarget);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    submit(formData);
  }

  const honeypot = (
    <>
      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />
    </>
  );

  if (field === "email") {
    return (
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        <div className="flex flex-col">
          <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em] text-balance">{copy.emailHeadline}</h1>
          <p className="m-0 mt-3 text-[17px] leading-[26px] text-pretty">{copy.emailIntro}</p>
        </div>
        <WaitlistField id="email" name="email" label={copy.emailLabel} value={values.email}
          onValueChange={(email) => change({ email })} onValueBlur={() => undefined} error={error?.message}
          inputProps={{ type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", placeholder: copy.emailPlaceholder }} />
        {honeypot}
        <button type="submit" disabled={isPending} className={BUTTON_CLASS}>
          <span>{isPending ? copy.checking : copy.emailButton}</span>
          <WaitlistArrowGlyph />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <SampleStepIndicator step={index + 1} labels={copy.steps} counter={copy.stepCounter}
        onBack={index > 0 || code === null ? () => go(index - 1) : undefined} />
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div key={index} custom={direction} variants={SAMPLE_STEP_SLIDE} initial="enter" animate="center" exit="exit" className={SAMPLE_ALERT_FADE}>
          <SampleFeedbackQuestion field={field} values={values} onChange={change} error={error?.message} errorField={error?.field} />
        </motion.div>
      </AnimatePresence>
      {honeypot}
      <button type="submit" disabled={isPending} className={BUTTON_CLASS}>
        <span>{index === LAST ? (isPending ? copy.submitting : copy.submit) : SAMPLE_COPY.continue}</span>
        <WaitlistArrowGlyph />
      </button>
    </form>
  );
}
