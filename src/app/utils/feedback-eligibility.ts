/** Every status a sample request can be in, as the database enum lists them. */
export type SampleRequestStatusKey = "pending_payment" | "paid" | "shipped" | "delivered" | "expired" | "cancelled";

/** Whether an email may open the check-in, and if not, why. */
export enum FeedbackEligibility {
  Ok = "ok",
  NotFound = "not_found",
  NotShipped = "not_shipped",
  AlreadyGiven = "already_given",
}

/** Shipped counts as well as delivered: someone scanning the card holds the box even when Biteship has not said so yet. */
export function feedbackEligibility(status: SampleRequestStatusKey | null, hasFeedback: boolean): FeedbackEligibility {
  if (status === null) return FeedbackEligibility.NotFound;
  if (hasFeedback) return FeedbackEligibility.AlreadyGiven;
  return status === "shipped" || status === "delivered" ? FeedbackEligibility.Ok : FeedbackEligibility.NotShipped;
}
