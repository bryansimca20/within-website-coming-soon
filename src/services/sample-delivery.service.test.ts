import { describe, expect, test } from "vitest";

import type { SampleRequest, SampleShipment } from "@/db/schema";

import { NOW } from "../../test/sample-fixtures";
import { buildDeliveryBoard, DeliveryState } from "./sample-delivery.service";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

function entry(id: string, requestStatus: string, shipmentStatus: string | null, history: Array<{ note: string; updatedAt: string }> = []) {
  const request = { id, batchId: "b02", boxNumber: 7, status: requestStatus, fullName: "Putri Anggraini", courierServiceName: "JNE REG" } as SampleRequest;
  const shipment =
    shipmentStatus === null
      ? null
      : ({ status: shipmentStatus, history: history.map((item) => ({ status: shipmentStatus, ...item })), updatedAt: NOW, waybillId: "CGK1", trackingLink: null } as unknown as SampleShipment);

  return { request, shipment };
}

describe("buildDeliveryBoard", () => {
  test("counts moving, stuck, failed and delivered per batch", () => {
    const board = buildDeliveryBoard(
      [
        entry("moving", "shipped", "in_transit", [{ note: "Left Jakarta hub", updatedAt: daysAgo(1) }]),
        entry("stuck", "shipped", "in_transit", [{ note: "Arrived at Medan sorting center", updatedAt: daysAgo(6) }]),
        entry("failed", "shipped", "returned", [{ note: "Recipient not at address", updatedAt: daysAgo(2) }]),
        entry("done", "delivered", "delivered"),
      ],
      NOW
    );

    expect(board.byBatch.b02).toEqual({ inTransit: 2, stuck: 1, failed: 1, delivered: 1 });
  });

  test("lists failed before stuck, with the courier's latest note", () => {
    const board = buildDeliveryBoard(
      [
        entry("stuck", "shipped", "picked", [{ note: "Picked up", updatedAt: daysAgo(9) }]),
        entry("failed", "shipped", "rejected", [
          { note: "Booked", updatedAt: daysAgo(3) },
          { note: "", updatedAt: daysAgo(1) },
          { note: "Address incomplete", updatedAt: daysAgo(2) },
        ]),
      ],
      NOW
    );

    expect(board.issues.map((issue) => [issue.requestId, issue.state, issue.statusLabel, issue.courierNote])).toEqual([
      ["failed", DeliveryState.Failed, "Rejected by courier", "Address incomplete"],
      ["stuck", DeliveryState.Stuck, "No movement in 9 days", "Picked up"],
    ]);
    expect(board.issues[0]?.boxLabel).toBe("B02-007");
  });

  test("a booked box waiting for pickup is never stuck, and bad history dates are ignored", () => {
    const board = buildDeliveryBoard([entry("booked", "shipped", "confirmed", [{ note: "x", updatedAt: daysAgo(10) }]), entry("odd", "shipped", "in_transit", [{ note: "y", updatedAt: "not a date" }])], NOW);

    expect(board.issues).toEqual([]);
    expect(board.byBatch.b02).toMatchObject({ inTransit: 2, stuck: 0 });
  });
});
