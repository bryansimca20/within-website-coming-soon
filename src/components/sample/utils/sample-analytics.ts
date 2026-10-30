import { track } from "@vercel/analytics";

/** Sampling interactions. Page views come from `<Analytics />` in the root layout. */
export enum SampleEvent {
  Landed = "sample_landed",
  IntroContinued = "sample_intro_continued",
  StepCompleted = "sample_step_completed",
  SubmitSucceeded = "sample_submit_succeeded",
  SubmitFailed = "sample_submit_failed",
  PaymentOpened = "sample_payment_opened",
  FeedbackSubmitted = "sample_feedback_submitted",
}

/** Reports one interaction. Flat string properties only; Vercel Analytics rejects nesting. */
export function trackSampleEvent(name: SampleEvent, data?: Record<string, string>): void {
  track(name, data);
}
