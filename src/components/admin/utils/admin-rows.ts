import { resolveSource } from "@/app/utils/attribution";
import { groupIntent } from "@/app/utils/intent";
import type { WouldReachAgain } from "@/app/utils/sample-options";
import type { SampleFeedbackRow, SampleRequest, SampleShipment } from "@/db/schema";
import { phaseForBiteshipStatus, ShipmentPhase } from "@/services/biteship.service";
import { SampleRequestService } from "@/services/sample-request.service";

/** One plain, serializable admin table row. */
export interface IAdminRow {
  id: string;
  boxLabel: string;
  name: string;
  email: string;
  city: string;
  courier: string;
  fee: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  shipmentStatus: string | null;
  waybillId: string | null;
  needsAttention: boolean;
  intent: string | null;
  source: string;
  /** Paid with no live shipment, or shipped with a shipment that came back: a founder can book it. */
  isBookable: boolean;
}

/** Flattens a request, its latest shipment and its feedback into one row. */
export function toAdminRow(request: SampleRequest, shipment: SampleShipment | null, feedback: SampleFeedbackRow | null): IAdminRow {
  const phase = shipment === null ? null : phaseForBiteshipStatus(shipment.status);
  const needsAttention = phase === ShipmentPhase.Attention;

  return {
    id: request.id,
    boxLabel: SampleRequestService.boxLabel(request.batchId, request.boxNumber),
    name: request.fullName,
    email: request.email,
    city: request.city,
    courier: request.courierServiceName,
    fee: request.shippingFee,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    paidAt: request.paidAt?.toISOString() ?? null,
    shipmentStatus: shipment?.status ?? null,
    waybillId: shipment?.waybillId ?? null,
    needsAttention,
    intent: feedback?.wouldReachAgain == null ? null : groupIntent(feedback.wouldReachAgain as WouldReachAgain),
    source: resolveSource({
      ref: request.ref,
      utmSource: request.utmSource,
      utmMedium: request.utmMedium,
      utmCampaign: request.utmCampaign,
      utmContent: request.utmContent,
      utmTerm: request.utmTerm,
    }),
    isBookable: (request.status === "paid" && shipment === null) || (request.status === "shipped" && needsAttention),
  };
}
