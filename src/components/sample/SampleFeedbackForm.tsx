"use client";

import { type FormEvent, useState, useTransition } from "react";

import { submitFeedbackAction } from "@/app/actions/submit-feedback.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import {
  EMPTY_SAMPLE_FEEDBACK_INPUT,
  FEEDBACK_QUESTION_ORDER,
  type ISampleFeedbackInput,
  parseSampleFeedbackInput,
} from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
import { normalizeEmail } from "@/app/utils/subscriber-input";
import { WaitlistField } from "@/components/waitlist/WaitlistField";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SampleFeedbackProgress } from "./SampleFeedbackProgress";
import { SampleFeedbackQuestion } from "./SampleFeedbackQuestion";
import { SampleFeedbackThanks } from "./SampleFeedbackThanks";
import { SampleEvent, trackSampleEvent } from "./utils/sample-analytics";
import { SAMPLE_COPY } from "./utils/sample-copy";

const { feedback: copy } = SAMPLE_COPY;
const TOTAL = FEEDBACK_QUESTION_ORDER.length;

interface SampleFeedbackFormProps {
  /** The personal link's token, already matched to a request on the server. Null skips nothing. */
  code: string | null;
  firstName: string | null;
}

/** The check-in: an email first unless the link already says who this is, then six questions one at a time. */
export function SampleFeedbackForm({ code, firstName }: SampleFeedbackFormProps) {
  const [values, setValues] = useState<ISampleFeedbackInput>({ ...EMPTY_SAMPLE_FEEDBACK_INPUT, code: code ?? "" });
  const [index, setIndex] = useState(code === null ? -1 : 0);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => String(Date.now()));

  if (isDone) return <SampleFeedbackThanks />;

  const field = index === -1 ? "email" : FEEDBACK_QUESTION_ORDER[index];
  const isLast = index === TOTAL - 1;

  function change(patch: Partial<ISampleFeedbackInput>) {
    setValues((previous) => ({ ...previous, ...patch }));
    setError(null);
  }

  /** The current screen's own check, before moving on. */
  function currentError(): string | null {
    if (field === "email") return normalizeEmail(values.email) === null ? "Add the email you requested your box with." : null;
    if (field === "comment") return null;
    const parsed = parseSampleFeedbackInput({ ...values, comment: "" });
    if (!parsed.ok && (parsed.field === field || (field === "felt" && parsed.field === "feltOther"))) return parsed.message;
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = currentError();
    if (message !== null) {
      setError(message);
      return;
    }
    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    const formData = new FormData(event.currentTarget);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    startTransition(async () => {
      try {
        const result = await submitFeedbackAction(formData);
        if (result.outcome === FeedbackOutcome.Success) {
          trackSampleEvent(SampleEvent.FeedbackSubmitted, { intent: values.wouldReachAgain });
          setIsDone(true);
          return;
        }
        setError(result.message);
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted">{copy.label}</p>
        <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em]">
          {firstName === null ? copy.headline : copy.headlineNamed(firstName)}
        </h1>
      </div>
      {index >= 0 && <SampleFeedbackProgress step={index + 1} total={TOTAL} />}

      {field === "email" ? (
        <WaitlistField id="email" name="email" label={copy.emailLabel} value={values.email}
          onValueChange={(email) => change({ email })} onValueBlur={() => undefined} error={error ?? undefined}
          inputProps={{ type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", placeholder: copy.emailPlaceholder }} />
      ) : (
        <SampleFeedbackQuestion field={field} values={values} onChange={change} error={error ?? undefined} />
      )}

      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />

      <div className="flex items-center gap-3">
        {index > (code === null ? -1 : 0) && (
          <button type="button" onClick={() => setIndex(index - 1)} className="h-14 cursor-pointer border border-brand-ink px-5 text-base font-semibold">
            {SAMPLE_COPY.back}
          </button>
        )}
        <button type="submit" disabled={isPending}
          className="flex h-14 flex-1 cursor-pointer items-center justify-between bg-brand-ink px-5 text-base font-semibold text-brand-mist transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none">
          <span>{isLast ? (isPending ? copy.submitting : copy.submit) : SAMPLE_COPY.continue}</span>
          <WaitlistArrowGlyph />
        </button>
      </div>
    </form>
  );
}
