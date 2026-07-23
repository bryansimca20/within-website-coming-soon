"use server";

import { checkBotId } from "botid/server";

import {
  HONEYPOT_TIMESTAMP_FIELD,
  HONEYPOT_TRAP_FIELD,
  isHoneypotTripped,
} from "@/app/utils/honeypot";
import {
  GENERIC_ERROR_MESSAGE,
  SubscribeStatus,
  type SubscribeState,
} from "@/app/utils/subscribe-state";
import { parseSubscriberInput } from "@/app/utils/subscriber-input";
import { ShopifyCustomerService, SubscribeOutcome } from "@/services/shopify-customer.service";

/** Reads a form field as a string, treating a missing or file value as empty. */
function readField(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

/**
 * Adds one address to the pre-launch list in Shopify.
 * Reachable by direct POST, so it re-validates everything the form already checked.
 */
export async function subscribeAction(
  _previousState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return { status: SubscribeStatus.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }

  const tripped = isHoneypotTripped({
    trap: readField(formData, HONEYPOT_TRAP_FIELD),
    renderedAt: readField(formData, HONEYPOT_TIMESTAMP_FIELD),
    now: Date.now(),
  });
  // Report success to automated submissions so they do not learn they were caught.
  if (tripped) {
    return { status: SubscribeStatus.Success };
  }

  const parsed = parseSubscriberInput({
    fullName: readField(formData, "fullName"),
    email: readField(formData, "email"),
    instagramHandle: readField(formData, "instagramHandle"),
  });
  if (!parsed.ok) {
    return { status: SubscribeStatus.Error, message: parsed.message, field: parsed.field };
  }

  try {
    const outcome = await ShopifyCustomerService.createPrelaunchSubscriber({
      email: parsed.email,
      instagramHandle: parsed.instagramHandle,
      consentedAt: new Date().toISOString(),
    });

    if (outcome === SubscribeOutcome.Failed) {
      return { status: SubscribeStatus.Error, message: GENERIC_ERROR_MESSAGE, field: null };
    }

    // A duplicate address is reported as success; saying otherwise leaks who is registered.
    return { status: SubscribeStatus.Success };
  } catch (error) {
    console.error("[subscribe] unexpected failure", error);

    return { status: SubscribeStatus.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
}
