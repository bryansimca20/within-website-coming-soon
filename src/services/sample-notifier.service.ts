import "server-only";

import type { SampleBatch, SampleRequest, SampleShipment } from "@/db/schema";
import { SITE_URL } from "@/lib/site";

import { EmailService } from "./email.service";
import { SampleRequestService } from "./sample-request.service";
import { type ISampleEmailContext, renderSampleEmail, SampleEmailKind } from "./sample-email-templates";

/** "JNE Reguler" as stored becomes courier "JNE" and service "Reguler", so the email never repeats the courier. */
function splitCourier(courierServiceName: string, fallback: string): { name: string; service: string } {
  const [first, ...rest] = courierServiceName.trim().split(/\s+/);

  return rest.length === 0 ? { name: fallback, service: courierServiceName } : { name: first, service: rest.join(" ") };
}

/** The URLs and words a template needs, from the stored rows. */
export function buildSampleEmailContext(
  request: SampleRequest,
  batch: SampleBatch,
  shipment: SampleShipment | null
): ISampleEmailContext {
  return {
    firstName: request.firstName,
    boxWord: SampleRequestService.boxWord(request.boxNumber),
    batchLabel: batch.label,
    statusUrl: `${SITE_URL}/sample/r/${request.accessToken}`,
    feedbackUrl: `${SITE_URL}/sample/feedback?code=${request.accessToken}`,
    courier:
      shipment === null
        ? null
        : {
            ...splitCourier(request.courierServiceName, shipment.courierCompany.toUpperCase()),
            waybillId: shipment.waybillId,
            trackingLink: shipment.trackingLink,
          },
  };
}

/** Sends the four sampler emails. Each returns whether Resend accepted it. */
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
