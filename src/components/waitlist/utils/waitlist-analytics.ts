import { track } from "@vercel/analytics";

/** The interactions the handoff asks to measure. Page views come from `<Analytics />` in the root layout. */
export enum WaitlistEvent {
  FeatureOpened = "waitlist_feature_opened",
  CtaClicked = "waitlist_cta_clicked",
  SubmitSucceeded = "waitlist_submit_succeeded",
  SubmitFailed = "waitlist_submit_failed",
}

/** Flat event properties; Vercel Analytics rejects nested values. */
type WaitlistEventData = Record<string, string>;

/** Reports one interaction to Vercel Analytics. The one place to change if the provider does. */
export function trackWaitlistEvent(name: WaitlistEvent, data?: WaitlistEventData): void {
  track(name, data);
}
