import { describe, expect, test } from "vitest";

import type { SampleBatch, SampleRequest, SampleShipment } from "@/db/schema";

import { buildSampleEmailContext } from "./sample-notifier.service";

describe("buildSampleEmailContext", () => {
  test("passes the courier as the sampler chose it, with its estimate and the shipment's waybill", () => {
    const context = buildSampleEmailContext(
      { firstName: "Fanny", accessToken: "t", courierServiceName: "JNE Reguler", shippingEta: "1 to 2 days" } as SampleRequest,
      { label: "Batch 01" } as SampleBatch,
      { waybillId: "W1", trackingLink: null } as SampleShipment
    );

    expect(context.courier).toEqual({ name: "JNE Reguler", eta: "1 to 2 days", waybillId: "W1", trackingLink: null });
    expect(context.batchLabel).toBe("Batch 01");
    expect(context).not.toHaveProperty("boxWord");
  });

  test("has no courier before a shipment exists", () => {
    const context = buildSampleEmailContext(
      { firstName: "Fanny", accessToken: "t", courierServiceName: "JNE Reguler", shippingEta: "1 to 2 days" } as SampleRequest,
      { label: "Batch 01" } as SampleBatch,
      null
    );

    expect(context.courier).toBeNull();
  });
});
