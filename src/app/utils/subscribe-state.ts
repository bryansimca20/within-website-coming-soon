import type { ISubscriberInput } from "./subscriber-input";

/** Lifecycle of one signup attempt, as the form sees it. */
export enum SubscribeStatus {
  Idle = "idle",
  Success = "success",
  Error = "error",
}

/** What the server action hands back to `useActionState`. */
export type SubscribeState =
  | { status: SubscribeStatus.Idle }
  | { status: SubscribeStatus.Success }
  | { status: SubscribeStatus.Error; message: string; field: keyof ISubscriberInput | null };

/** Starting state before the visitor has submitted anything. */
export const INITIAL_SUBSCRIBE_STATE: SubscribeState = { status: SubscribeStatus.Idle };

/** Shown for bot rejections and Shopify failures alike, so neither reveals which occurred. */
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Try again.";
