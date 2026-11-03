import { describe, expect, test } from "vitest";

import type { SampleRequest, SampleShipment } from "@/db/schema";

import { buildStatusSteps } from "./status-steps";

const CREATED = new Date("2026-10-27T03:00:00Z");
const PAID = new Date("2026-10-27T03:10:00Z");
const SHIPPED = new Date("2026-10-28T03:00:00Z");
const DELIVERED = new Date("2026-10-29T03:00:00Z");

function request(patch: Partial<SampleRequest>): SampleRequest {
  return { status: "pending_payment", createdAt: CREATED, paidAt: null, shippedAt: null, deliveredAt: null, courierServiceName: "JNE Reguler", ...patch } as SampleRequest;
}

function shipment(patch: Partial<SampleShipment>): SampleShipment {
  return { status: "allocated", waybillId: null, trackingLink: null, ...patch } as SampleShipment;
}

describe("buildStatusSteps", () => {
  test("a pending request has only its request date", () => {
    const steps = buildStatusSteps(request({}), null);

    expect(steps.map((step) => step.key)).toEqual(["requested", "paid", "shipped", "delivered"]);
    expect(steps.map((step) => step.at)).toEqual([CREATED, null, null, null]);
  });

  test("a paid request fills the paid date", () => {
    expect(buildStatusSteps(request({ status: "paid", paidAt: PAID }), null)[1].at).toEqual(PAID);
  });

  test("a booked courier shows its label before pickup", () => {
    const steps = buildStatusSteps(request({ status: "paid", paidAt: PAID }), shipment({ status: "allocated" }));

    expect(steps[2].at).toBeNull();
    expect(steps[2].detail).toBe("Courier assigned");
  });

  test("a picked parcel shows courier and waybill", () => {
    const steps = buildStatusSteps(
      request({ status: "shipped", paidAt: PAID, shippedAt: SHIPPED }),
      shipment({ status: "picked", waybillId: "JNE123" })
    );

    expect(steps[2].at).toEqual(SHIPPED);
    expect(steps[2].detail).toBe("JNE Reguler, waybill JNE123");
  });

  test("a delivered request fills all four", () => {
    const steps = buildStatusSteps(
      request({ status: "delivered", paidAt: PAID, shippedAt: SHIPPED, deliveredAt: DELIVERED }),
      shipment({ status: "delivered", waybillId: "JNE123" })
    );

    expect(steps.map((step) => step.at)).toEqual([CREATED, PAID, SHIPPED, DELIVERED]);
  });
});
