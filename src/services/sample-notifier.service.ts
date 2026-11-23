import "server-only";

import { formatJakarta } from "@/components/sample/utils/jakarta-date";
import { formatRupiah } from "@/components/sample/utils/sample-copy";
import type { SampleBatch, SampleRequest, SampleShipment } from "@/db/schema";
import { SITE_URL } from "@/lib/site";

import { EmailService } from "./email.service";
import { type ISampleEmailContext, renderSampleEmail, SampleEmailKind } from "./sample-email-templates";

/** The URLs and words a template needs, from the stored rows. */
export function buildSampleEmailContext(
  request: SampleRequest,
  batch: SampleBatch | null,
  shipment: SampleShipment | null
): ISampleEmailContext {
  return {
    firstName: request.firstName,
    batchLabel: batch?.label ?? null,
    statusUrl: `${SITE_URL}/sample/r/${request.accessToken}`,
    feedbackUrl: `${SITE_URL}/sample/feedback?code=${request.accessToken}`,
    courier:
      shipment === null
        ? null
        : {
            name: request.courierServiceName ?? "",
            eta: request.shippingEta,
            waybillId: shipment.waybillId,
            trackingLink: shipment.trackingLink,
          },
    // Truthy rather than `!== null`: only a bank-transfer request has a code.
    transfer: request.paymentCode
      ? {
          code: request.paymentCode,
          amount: formatRupiah(request.shippingFee ?? 0),
          deadline: formatJakarta(request.expiresAt),
          isReported: request.status === "awaiting_confirmation",
        }
      : null,
  };
}

/** Sends the four sampler emails. Each returns whether Resend accepted it. */
export class SampleNotifier {
  private static async send(
    kind: SampleEmailKind,
    request: SampleRequest,
    batch: SampleBatch | null,
    shipment: SampleShipment | null
  ): Promise<boolean> {
    const rendered = renderSampleEmail(kind, buildSampleEmailContext(request, batch, shipment));

    return EmailService.send({ to: request.email, ...rendered });
  }

  /** A bank-transfer request's account, amount, code and deadline, with the link back to its payment page. */
  static sendPaymentInstructions(request: SampleRequest, batch: SampleBatch | null): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.PaymentInstructions, request, batch, null);
  }

  static sendPaid(request: SampleRequest, batch: SampleBatch | null): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Paid, request, batch, null);
  }

  static sendShipped(request: SampleRequest, batch: SampleBatch, shipment: SampleShipment): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Shipped, request, batch, shipment);
  }

  static sendDelivered(request: SampleRequest, batch: SampleBatch, shipment: SampleShipment): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Delivered, request, batch, shipment);
  }

  /** The in-person hand-over: no batch, and a button straight to the check-in. */
  static sendSeeded(request: SampleRequest): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Seeded, request, null, null);
  }

  static sendFeedbackReminder(request: SampleRequest, batch: SampleBatch | null): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.FeedbackReminder, request, batch, null);
  }

  /** Sends by kind, for the admin's resend buttons. */
  static sendKind(
    kind: SampleEmailKind,
    request: SampleRequest,
    batch: SampleBatch | null,
    shipment: SampleShipment | null
  ): Promise<boolean> {
    return SampleNotifier.send(kind, request, batch, shipment);
  }
}
