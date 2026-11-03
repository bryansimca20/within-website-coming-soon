"use client";

import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useState, useTransition } from "react";

import { addToFeedbackAction } from "@/app/actions/add-to-feedback.action";
import { checkFeedbackEmailAction } from "@/app/actions/check-feedback-email.action";
import { submitFeedbackAction } from "@/app/actions/submit-feedback.action";
import { FeedbackEligibility } from "@/app/utils/feedback-eligibility";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import {
  EMPTY_SAMPLE_FEEDBACK_INPUT,
  FEEDBACK_STEP_ORDER,
  FeedbackStep,
  type ISampleFeedbackInput,
  type SampleFeedbackField,
  validateFeedbackStep,
} from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, type FeedbackState, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
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
const LAST = FEEDBACK_STEP_ORDER.length - 1;
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
  /** The star tapped in the reminder email, if any. */
  initialRating: number | null;
}

/**
 * The review: an email first unless the link already says who this is, then four screens. The first saves the
 * rating and review; each later one adds to that row, so leaving early still leaves a review.
 */
export function SampleFeedbackForm({ code, firstName, initialRating }: SampleFeedbackFormProps) {
  const [values, setValues] = useState<ISampleFeedbackInput>({
    ...EMPTY_SAMPLE_FEEDBACK_INPUT,
    code: code ?? "",
    rating: initialRating === null ? "" : String(initialRating),
  });
  const [index, setIndex] = useState(code === null ? -1 : 0);
  const [direction, setDirection] = useState<SampleDirection>(1);
  const [error, setError] = useState<FieldError>(null);
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => String(Date.now()));

  if (isDone) return <SampleFeedbackThanks firstName={firstName} />;

  const step = index === -1 ? null : FEEDBACK_STEP_ORDER[index];

  function change(patch: Partial<ISampleFeedbackInput>) {
    setValues((previous) => ({ ...previous, ...patch }));
    setError(null);
  }

  function go(next: number) {
    if (next > LAST) return setIsDone(true);
    setDirection(next > index ? 1 : -1);
    setIndex(next);
    setError(null);
    window.scrollTo({ top: 0 });
  }

  function checkEmail() {
    startTransition(async () => {
      try {
        const check = await checkFeedbackEmailAction(values.email);
        if (check.eligibility !== FeedbackEligibility.Ok) return setError({ field: "email", message: EMAIL_MESSAGE[check.eligibility] });
        go(0);
      } catch {
        setError({ field: "email", message: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  /** Saves this screen, then moves on. A stale row on a later screen just finishes: the review is already in. */
  function save(current: FeedbackStep, formData: FormData) {
    startTransition(async () => {
      try {
        const result: FeedbackState =
          current === FeedbackStep.Review ? await submitFeedbackAction(formData) : await addToFeedbackAction(current, formData);
        if (result.outcome === FeedbackOutcome.Success) {
          setValues((previous) => ({ ...previous, feedbackId: result.feedbackId }));
          if (current === FeedbackStep.Review) trackSampleEvent(SampleEvent.FeedbackSubmitted, { rating: values.rating });
          return go(index + 1);
        }
        if (result.field === "feedbackId") return setIsDone(true);
        if (result.field === "email" && code === null) go(-1);
        setError({ field: (result.field ?? "rating") as SampleFeedbackField, message: result.message });
      } catch {
        setError({ field: current === FeedbackStep.Review ? "rating" : "feedbackId", message: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === null) {
      return normalizeEmail(values.email) === null ? setError({ field: "email", message: copy.emailNotFound }) : checkEmail();
    }
    const problem = validateFeedbackStep(step, values);
    if (problem !== null) return setError({ field: problem.field, message: problem.message });
    const formData = new FormData(event.currentTarget);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    save(step, formData);
  }

  function skipHeadline() {
    change({ headline: "" });
    go(index + 1);
  }

  const honeypot = (
    <>
      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />
    </>
  );
  const submitButton = (label: string) => (
    <button type="submit" disabled={isPending} className={BUTTON_CLASS}>
      <span>{label}</span>
      <WaitlistArrowGlyph />
    </button>
  );

  if (step === null) {
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
        {submitButton(isPending ? copy.checking : copy.emailButton)}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <SampleStepIndicator step={index + 1} labels={copy.steps} counter={copy.stepCounter}
        onBack={index > 0 || code === null ? () => go(index - 1) : undefined} />
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div key={index} custom={direction} variants={SAMPLE_STEP_SLIDE} initial="enter" animate="center" exit="exit" className={SAMPLE_ALERT_FADE}>
          <SampleFeedbackQuestion step={step} values={values} onChange={change} firstName={firstName} error={error?.message} errorField={error?.field} />
        </motion.div>
      </AnimatePresence>
      {honeypot}
      <div className="flex flex-col gap-2">
        {submitButton(isPending ? copy.saving : index === LAST ? copy.finish : SAMPLE_COPY.continue)}
        {error?.field === "feedbackId" && <p role="alert" className="m-0 text-[13px] leading-[18px] font-semibold text-brand-error">{error.message}</p>}
        {step === FeedbackStep.Headline && (
          <button type="button" onClick={skipHeadline} disabled={isPending}
            className="min-h-11 cursor-pointer text-[15px] font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
            {copy.skip}
          </button>
        )}
        {step === FeedbackStep.Review && <p className="m-0 mt-1 text-center text-xs leading-[17px] text-pretty text-brand-muted">{copy.shareNote}</p>}
      </div>
    </form>
  );
}
