import type { ISubscriberInput } from "./subscriber-input";

/** Outcome of one signup attempt, as the form sees it. */
export enum SubscribeStatus {
  Success = "success",
  Error = "error",
}

/** What the server action hands back to the waitlist form. */
export type SubscribeState =
  | { status: SubscribeStatus.Success }
  | { status: SubscribeStatus.Error; message: string; field: keyof ISubscriberInput | null };

/** Shown for bot rejections and Shopify failures alike, so neither reveals which occurred. */
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Try again.";
