import { GENERIC_ERROR_MESSAGE } from "./subscribe-state";
import type { FeedbackEligibility } from "./feedback-eligibility";
import type { SampleRequestField } from "./sample-request-input";

export { GENERIC_ERROR_MESSAGE };

/** Outcome of one request submission, as the form sees it. */
export enum SampleRequestOutcome {
  Pay = "pay",
  Full = "full",
  AlreadyRequested = "already-requested",
  Error = "error",
}

/** What the request action hands back to the form. */
export type SampleRequestState =
  | {
      outcome: SampleRequestOutcome.Pay;
      snapToken: string;
      snapRedirectUrl: string;
      statusUrl: string;
      boxLabel: string;
    }
  | { outcome: SampleRequestOutcome.Full }
  | { outcome: SampleRequestOutcome.AlreadyRequested; email: string }
  | { outcome: SampleRequestOutcome.Error; message: string; field: SampleRequestField | null };

/** Outcome of asking the status page to reopen payment. */
export enum ReopenOutcome {
  Pay = "pay",
  Lapsed = "lapsed",
  NotPending = "not-pending",
  Error = "error",
}

/** What the reopen action hands back to the status page. */
export type ReopenPaymentState =
  | { outcome: ReopenOutcome.Pay; snapToken: string; snapRedirectUrl: string }
  | { outcome: ReopenOutcome.Lapsed }
  | { outcome: ReopenOutcome.NotPending }
  | { outcome: ReopenOutcome.Error; message: string };

/** Outcome of one check-in submission. */
export enum FeedbackOutcome {
  Success = "success",
  Error = "error",
}

/** What the QR path's email check hands back: whether to continue, and the name to greet. */
export interface IFeedbackEmailCheck {
  eligibility: FeedbackEligibility;
  firstName: string | null;
}

/** What the feedback action hands back to the form. */
export type FeedbackState =
  | { outcome: FeedbackOutcome.Success }
  | { outcome: FeedbackOutcome.Error; message: string; field: string | null };
