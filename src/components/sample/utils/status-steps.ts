import type { SampleRequest, SampleShipment } from "@/db/schema";
import { BITESHIP_STATUS_LABEL, phaseForBiteshipStatus, ShipmentPhase } from "@/services/biteship.service";

import { SAMPLE_COPY } from "./sample-copy";

/** One step of the status page timeline. */
export interface IStatusStep {
  key: "requested" | "paid" | "shipped" | "delivered";
  label: string;
  at: Date | null;
  detail: string | null;
}

/** Requested, paid, shipped, delivered: each dated once reached; the shipped step carries the courier. */
export function buildStatusSteps(request: SampleRequest, shipment: SampleShipment | null): IStatusStep[] {
  const labels = SAMPLE_COPY.status.steps;
  let shippedDetail: string | null = null;

  if (shipment !== null) {
    const phase = phaseForBiteshipStatus(shipment.status);
    if (phase === ShipmentPhase.Booked || phase === ShipmentPhase.Attention) {
      shippedDetail = BITESHIP_STATUS_LABEL[shipment.status] ?? shipment.status;
    } else {
      shippedDetail =
        shipment.waybillId === null ? request.courierServiceName : `${request.courierServiceName}, waybill ${shipment.waybillId}`;
    }
  }

  return [
    { key: "requested", label: labels.requested, at: request.createdAt, detail: null },
    { key: "paid", label: labels.paid, at: request.paidAt, detail: null },
    { key: "shipped", label: labels.shipped, at: request.shippedAt, detail: shippedDetail },
    { key: "delivered", label: labels.delivered, at: request.deliveredAt, detail: null },
  ];
}
