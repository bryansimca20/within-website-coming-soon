import { describe, expect, test } from "vitest";

import type { SampleBatch, SampleRequest, SampleShipment } from "@/db/schema";

import { buildSampleEmailContext } from "./sample-notifier.service";

describe("buildSampleEmailContext", () => {
  test("splits the stored courier service into courier and service", () => {
    const context = buildSampleEmailContext(
      { firstName: "Fanny", boxNumber: 42, accessToken: "t", courierServiceName: "JNE Reguler" } as SampleRequest,
      { label: "Batch 01" } as SampleBatch,
      { courierCompany: "jne", waybillId: "W1", trackingLink: null } as SampleShipment
    );

    expect(context.courier).toMatchObject({ name: "JNE", service: "Reguler" });
    expect(context.boxWord).toBe("Box 042");
  });
});
