"use server";

import { readFormField } from "@/app/utils/form-field";
import { buildReferralTag, isRosterSlug } from "@/app/utils/attribution";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD, isHoneypotTripped } from "@/app/utils/honeypot";
import { readSampleRequestInput } from "@/app/utils/sample-request-input";
import { parseSampleSeedInput } from "@/app/utils/sample-seed-input";
import { GENERIC_ERROR_MESSAGE, SampleSeedOutcome, type SampleSeedState } from "@/app/utils/sample-state";
import { SAMPLE_COPY } from "@/components/sample/utils/sample-copy";
import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-session";
import { SampleNotifier } from "@/services/sample-notifier.service";
import { SampleRequestService } from "@/services/sample-request.service";
import { SAMPLING_TAG_PREFIX, ShopifyCustomerService } from "@/services/shopify-customer.service";

const GENERIC_ERROR: SampleSeedState = { outcome: SampleSeedOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };

/** Registers someone handed samples in person. Admin-only and reachable by direct POST, so it re-checks the session and every field. */
export async function seedSampleAction(formData: FormData): Promise<SampleSeedState> {
  if (!(await isAdmin())) {
    return { outcome: SampleSeedOutcome.Error, message: SAMPLE_COPY.seed.signedOut, field: null };
  }
  if (
    isHoneypotTripped({
      trap: readFormField(formData, HONEYPOT_TRAP_FIELD),
      renderedAt: readFormField(formData, HONEYPOT_TIMESTAMP_FIELD),
      now: Date.now(),
    })
  ) {
    return GENERIC_ERROR;
  }

  const parsed = parseSampleSeedInput(readSampleRequestInput(formData));
  if (!parsed.ok) {
    return { outcome: SampleSeedOutcome.Error, message: parsed.message, field: parsed.field };
  }

  try {
    const now = new Date();
    const values = parsed.value;
    const result = await SampleRequestService.seed(db, values, now);
    if (result.kind === "already-requested") {
      return { outcome: SampleSeedOutcome.AlreadyRequested, email: values.email };
    }

    await SampleNotifier.sendSeeded(result.request);
    const ref = values.attribution.ref;
    try {
      const outcome = await ShopifyCustomerService.createPrelaunchSubscriber({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        instagramHandle: values.instagramHandle,
        consentedAt: values.wantsLaunchEmail ? now.toISOString() : null,
        extraTags: [`${SAMPLING_TAG_PREFIX}in-person`, ...(ref !== null && isRosterSlug(ref) ? [buildReferralTag(ref)] : [])],
      });
      await SampleRequestService.setShopifyOutcome(db, result.request.id, outcome);
    } catch (error) {
      console.error("[seed-sample] shopify join failed", error);
      await SampleRequestService.setShopifyOutcome(db, result.request.id, "error");
    }

    return { outcome: SampleSeedOutcome.Seeded, firstName: values.firstName };
  } catch (error) {
    console.error("[seed-sample] unexpected failure", error);
    return GENERIC_ERROR;
  }
}
