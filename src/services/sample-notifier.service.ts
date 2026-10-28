import "server-only";

import type { SampleBatch, SampleRequest, SampleShipment } from "@/db/schema";
import { SITE_URL } from "@/lib/site";

import { EmailService } from "./email.service";
import { type ISampleEmailContext, renderSampleEmail, SampleEmailKind } from "./sample-email-templates";

/** The URLs and words a template needs, from the stored rows. */
export function buildSampleEmailContext(
  request: SampleRequest,
  batch: SampleBatch,
  shipment: SampleShipment | null
): ISampleEmailContext {
  return {
    firstName: request.firstName,
    batchLabel: batch.label,
    statusUrl: `${SITE_URL}/sample/r/${request.accessToken}`,
    feedbackUrl: `${SITE_URL}/sample/feedback?code=${request.accessToken}`,
    courier:
      shipment === null
        ? null
        : {
            name: request.courierServiceName,
            eta: request.shippingEta,
            waybillId: shipment.waybillId,
            trackingLink: shipment.trackingLink,
          },
  };
}

/** Sends the five sampler emails. Each returns whether Resend accepted it. */
export class SampleNotifier {
  private static async send(
    kind: SampleEmailKind,
    request: SampleRequest,
    batch: SampleBatch,
    shipment: SampleShipment | null
  ): Promise<boolean> {
    const rendered = renderSampleEmail(kind, buildSampleEmailContext(request, batch, shipment));

    return EmailService.send({ to: request.email, ...rendered });
  }

  static sendPaid(request: SampleRequest, batch: SampleBatch): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Paid, request, batch, null);
  }

  static sendShipped(request: SampleRequest, batch: SampleBatch, shipment: SampleShipment): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Shipped, request, batch, shipment);
  }

  static sendDelivered(request: SampleRequest, batch: SampleBatch, shipment: SampleShipment): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.Delivered, request, batch, shipment);
  }

  static sendFeedbackReceived(request: SampleRequest, batch: SampleBatch): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.FeedbackReceived, request, batch, null);
  }

  static sendFeedbackReminder(request: SampleRequest, batch: SampleBatch): Promise<boolean> {
    return SampleNotifier.send(SampleEmailKind.FeedbackReminder, request, batch, null);
  }

  /** Sends by kind, for the admin's resend buttons. */
  static sendKind(
    kind: SampleEmailKind,
    request: SampleRequest,
    batch: SampleBatch,
    shipment: SampleShipment | null
  ): Promise<boolean> {
    return SampleNotifier.send(kind, request, batch, shipment);
  }
}
