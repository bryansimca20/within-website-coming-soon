import { GENERIC_ERROR_MESSAGE } from "./subscribe-state";
import type { FeedbackEligibility } from "./feedback-eligibility";
import type { SampleRequestField } from "./sample-request-input";

export { GENERIC_ERROR_MESSAGE };

/** Outcome of one request submission, as the form sees it. `Transfer` is a bank-transfer box: pay on the status page. */
export enum SampleRequestOutcome {
  Pay = "pay",
  Transfer = "transfer",
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
  | { outcome: SampleRequestOutcome.Transfer; statusUrl: string }
  | { outcome: SampleRequestOutcome.Full }
  | { outcome: SampleRequestOutcome.AlreadyRequested; email: string }
  | { outcome: SampleRequestOutcome.Error; message: string; field: SampleRequestField | null };

/** Outcome of registering one in-person sample. */
export enum SampleSeedOutcome {
  Seeded = "seeded",
  AlreadyRequested = "already-requested",
  Error = "error",
}

/** What the seed action hands back to the seeding form. */
export type SampleSeedState =
  | { outcome: SampleSeedOutcome.Seeded; firstName: string }
  | { outcome: SampleSeedOutcome.AlreadyRequested; email: string }
  | { outcome: SampleSeedOutcome.Error; message: string; field: SampleRequestField | null };

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

/** Outcome of "I've transferred" on a bank-transfer status page. */
export enum ReportTransferOutcome {
  Reported = "reported",
  Lapsed = "lapsed",
  NotPending = "not-pending",
  Error = "error",
}

/** What the report action hands back. Anything but an error re-renders the page, which shows the stored state. */
export type ReportTransferState =
  | { outcome: ReportTransferOutcome.Reported | ReportTransferOutcome.Lapsed | ReportTransferOutcome.NotPending }
  | { outcome: ReportTransferOutcome.Error; message: string };

/** Outcome of one check-in submission. */
export enum FeedbackOutcome {
  Success = "success",
  Error = "error",
}

/** What the QR path's email check hands back: whether to continue, and the name to greet. */
export interface IFeedbackEmailCheck {
  eligibility: FeedbackEligibility;
}

/** What the review actions hand back. `feedbackId` is the saved row the later screens add to. */
export type FeedbackState =
  | { outcome: FeedbackOutcome.Success; feedbackId: string }
  | { outcome: FeedbackOutcome.Error; message: string; field: string | null };
