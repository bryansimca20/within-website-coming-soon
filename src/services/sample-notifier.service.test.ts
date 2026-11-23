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

  test("buildSampleEmailContext gives a bank-transfer request its transfer block", () => {
    const bankTransfer = buildSampleEmailContext(
      { firstName: "Fanny", accessToken: "t", paymentCode: "K7P2QX", shippingFee: 10000, expiresAt: new Date("2026-10-28T03:00:00.000Z") } as SampleRequest,
      { label: "Batch 01" } as SampleBatch,
      null
    );
    const midtrans = buildSampleEmailContext(
      { firstName: "Fanny", accessToken: "t", paymentCode: null, shippingFee: 10000, expiresAt: new Date("2026-10-28T03:00:00.000Z") } as SampleRequest,
      { label: "Batch 01" } as SampleBatch,
      null
    );

    expect(bankTransfer.transfer).toEqual({ code: "K7P2QX", amount: "Rp 10.000", deadline: "28 Oct, 10:00", isReported: false });
    expect(midtrans.transfer).toBeNull();
  });

  test("buildSampleEmailContext marks a transfer the sampler already reported", () => {
    const reported = buildSampleEmailContext(
      { firstName: "Fanny", accessToken: "t", status: "awaiting_confirmation", paymentCode: "K7P2QX", shippingFee: 10000, expiresAt: new Date("2026-10-28T03:00:00.000Z") } as SampleRequest,
      { label: "Batch 01" } as SampleBatch,
      null
    );

    expect(reported.transfer?.isReported).toBe(true);
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
