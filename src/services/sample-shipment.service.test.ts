import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { SampleDatabase } from "@/db/database";
import type { SampleRequest, SampleShipment } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues } from "../../test/sample-fixtures";
import { BiteshipService, type IBiteshipOrder } from "./biteship.service";
import { SampleRequestService } from "./sample-request.service";
import { SampleShipmentService } from "./sample-shipment.service";

let db: SampleDatabase;
let close: () => Promise<void>;
let paid: SampleRequest;
let createOrder: ReturnType<typeof vi.spyOn>;

function order(patch: Partial<IBiteshipOrder> = {}): IBiteshipOrder {
  return {
    id: "order-1",
    status: "confirmed",
    trackingId: "trk-1",
    waybillId: "JNE123",
    trackingLink: "https://track/JNE123",
    price: 10000,
    history: [{ status: "confirmed", note: "Order confirmed", updatedAt: "2026-10-27T10:00:00+07:00" }],
    ...patch,
  };
}

beforeEach(async () => {
  process.env.SAMPLE_ORIGIN_CONTACT_NAME = "WITHIN";
  process.env.SAMPLE_ORIGIN_CONTACT_PHONE = "+628111111111";
  process.env.SAMPLE_ORIGIN_ADDRESS = "BSD office";
  process.env.SAMPLE_ORIGIN_AREA_ID = "origin-area";
  process.env.SAMPLE_ORIGIN_POSTAL_CODE = "15345";
  const handle = await makeTestDb();
  db = handle.db;
  close = () => handle.pg.close();
  const result = await SampleRequestService.claim(db, "b01", sampleValues(), NOW);
  if (result.kind !== "claimed") throw new Error(result.kind);
  const row = await SampleRequestService.markPaid(db, result.request.id, NOW);
  if (row === null) throw new Error("not paid");
  paid = row;
  createOrder = vi.spyOn(BiteshipService, "createOrder").mockResolvedValue(order());
});

afterEach(async () => {
  vi.restoreAllMocks();
  await close();
});

async function bookOne(): Promise<SampleShipment> {
  await SampleShipmentService.bookRun(
    db,
    { requestIds: [paid.id], deliveryType: "now", deliveryDate: null, deliveryTime: null },
    NOW
  );
  const shipment = await SampleShipmentService.latestForRequest(db, paid.id);
  if (shipment === null) throw new Error("no shipment");
  return shipment;
}

describe("SampleShipmentService.referenceId", () => {
  test("appends the attempt to the box label", () => {
    expect(SampleShipmentService.referenceId("B01-042", 1)).toBe("B01-042-1");
  });
});

describe("SampleShipmentService.bookRun", () => {
  test("books a paid request as attempt 1 and stores the courier fields", async () => {
    const results = await SampleShipmentService.bookRun(
      db,
      { requestIds: [paid.id], deliveryType: "now", deliveryDate: null, deliveryTime: null },
      NOW
    );

    expect(results).toEqual([{ requestId: paid.id, boxLabel: "B01-001", ok: true, waybillId: "JNE123", error: null }]);
    const shipment = await SampleShipmentService.latestForRequest(db, paid.id);
    expect(shipment).toMatchObject({
      attempt: 1,
      referenceId: "B01-001-1",
      biteshipOrderId: "order-1",
      waybillId: "JNE123",
      trackingLink: "https://track/JNE123",
      status: "confirmed",
      courierCompany: "jne",
      courierType: "reg",
      deliveryType: "now",
      price: 10000,
    });
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceId: "B01-001-1",
        courierCompany: "jne",
        destination: expect.objectContaining({ areaId: paid.areaId, email: paid.email }),
        origin: expect.objectContaining({ areaId: "origin-area" }),
      })
    );
  });

  test("refuses a request that is not paid and books nothing for it", async () => {
    const pending = await SampleRequestService.claim(db, "b01", sampleValues({ email: "b@example.com" }), NOW);
    if (pending.kind !== "claimed") throw new Error(pending.kind);

    const [result] = await SampleShipmentService.bookRun(
      db,
      { requestIds: [pending.request.id], deliveryType: "now", deliveryDate: null, deliveryTime: null },
      NOW
    );

    expect(result).toMatchObject({ ok: false, waybillId: null });
    expect(result.error).not.toBeNull();
    expect(createOrder).not.toHaveBeenCalled();
    expect(await SampleShipmentService.latestForRequest(db, pending.request.id)).toBeNull();
  });

  test("reports a Biteship failure for that row only", async () => {
    createOrder.mockResolvedValue(null);

    const [result] = await SampleShipmentService.bookRun(
      db,
      { requestIds: [paid.id], deliveryType: "now", deliveryDate: null, deliveryTime: null },
      NOW
    );

    expect(result.ok).toBe(false);
    expect(await SampleShipmentService.latestForRequest(db, paid.id)).toBeNull();
  });

  test("a live shipment is not booked twice", async () => {
    await bookOne();
    createOrder.mockClear();

    const [result] = await SampleShipmentService.bookRun(
      db,
      { requestIds: [paid.id], deliveryType: "now", deliveryDate: null, deliveryTime: null },
      minutesAfter(60)
    );

    expect(result).toMatchObject({ ok: false, waybillId: null });
    expect(createOrder).not.toHaveBeenCalled();
    expect(await SampleShipmentService.listAttempts(db, paid.id)).toHaveLength(1);
  });

  test("a save failure stays on that row and the run carries on", async () => {
    await bookOne();
    const other = await SampleRequestService.claim(db, "b01", sampleValues({ email: "b@example.com" }), NOW);
    if (other.kind !== "claimed") throw new Error(other.kind);
    await SampleRequestService.markPaid(db, other.request.id, NOW);
    const third = await SampleRequestService.claim(db, "b01", sampleValues({ email: "c@example.com" }), NOW);
    if (third.kind !== "claimed") throw new Error(third.kind);
    await SampleRequestService.markPaid(db, third.request.id, NOW);
    createOrder.mockResolvedValueOnce(order()).mockResolvedValueOnce(order({ id: "order-3" }));

    const results = await SampleShipmentService.bookRun(
      db,
      { requestIds: [other.request.id, third.request.id], deliveryType: "now", deliveryDate: null, deliveryTime: null },
      NOW
    );

    expect(results.map((result) => result.ok)).toEqual([false, true]);
  });

  test("a shipment that failed before pickup can be booked again as attempt 2", async () => {
    await bookOne();
    const failed = await SampleShipmentService.latestForRequest(db, paid.id);
    if (failed === null) throw new Error("no shipment");
    await SampleShipmentService.applyOrderSnapshot(db, failed, order({ status: "courier_not_found" }), minutesAfter(30));
    createOrder.mockResolvedValue(order({ id: "order-2", waybillId: "JNE456" }));

    await SampleShipmentService.bookRun(
      db,
      { requestIds: [paid.id], deliveryType: "scheduled", deliveryDate: "2026-10-28", deliveryTime: "10:00" },
      minutesAfter(60)
    );

    const latest = await SampleShipmentService.latestForRequest(db, paid.id);
    expect(latest).toMatchObject({ attempt: 2, referenceId: "B01-001-2", biteshipOrderId: "order-2", deliveryType: "scheduled" });
    expect(latest?.scheduledFor).toEqual(new Date("2026-10-28T03:00:00.000Z"));
    expect(await SampleShipmentService.listAttempts(db, paid.id)).toHaveLength(2);
  });
});

describe("SampleShipmentService.applyOrderSnapshot", () => {
  test("picked ships the request and asks for the shipped email once", async () => {
    const shipment = await bookOne();

    const first = await SampleShipmentService.applyOrderSnapshot(db, shipment, order({ status: "picked" }), minutesAfter(30));
    await SampleShipmentService.claimEmail(db, shipment.id, "shipped", minutesAfter(30));
    const second = await SampleShipmentService.applyOrderSnapshot(
      db,
      first.shipment,
      order({ status: "in_transit", history: [{ status: "in_transit", note: "", updatedAt: "" }] }),
      minutesAfter(60)
    );

    expect(first.dueEmail).toBe("shipped");
    expect(first.shipment.status).toBe("picked");
    expect(second.dueEmail).toBeNull();
    expect(second.shipment.history).toEqual([{ status: "in_transit", note: "", updatedAt: "" }]);
    const request = await SampleRequestService.findById(db, paid.id);
    expect(request?.status).toBe("shipped");
    expect(request?.shippedAt).toEqual(minutesAfter(30));
  });

  test("delivered completes the request and asks for the delivered email", async () => {
    const shipment = await bookOne();
    const shipped = await SampleShipmentService.applyOrderSnapshot(db, shipment, order({ status: "picked" }), minutesAfter(30));
    await SampleShipmentService.claimEmail(db, shipment.id, "shipped", minutesAfter(30));

    const result = await SampleShipmentService.applyOrderSnapshot(
      db,
      shipped.shipment,
      order({ status: "delivered" }),
      minutesAfter(2000)
    );

    expect(result.dueEmail).toBe("delivered");
    const request = await SampleRequestService.findById(db, paid.id);
    expect(request?.status).toBe("delivered");
    expect(request?.deliveredAt).toEqual(minutesAfter(2000));
  });

  test("a return leaves the request shipped and sends nothing", async () => {
    const shipment = await bookOne();
    const shipped = await SampleShipmentService.applyOrderSnapshot(db, shipment, order({ status: "picked" }), minutesAfter(30));
    await SampleShipmentService.claimEmail(db, shipment.id, "shipped", minutesAfter(30));

    const result = await SampleShipmentService.applyOrderSnapshot(
      db,
      shipped.shipment,
      order({ status: "returned" }),
      minutesAfter(3000)
    );

    expect(result.dueEmail).toBeNull();
    expect(result.shipment.status).toBe("returned");
    expect((await SampleRequestService.findById(db, paid.id))?.status).toBe("shipped");
  });

  test("a delivered snapshot before any shipped email asks for delivered", async () => {
    const shipment = await bookOne();

    const result = await SampleShipmentService.applyOrderSnapshot(db, shipment, order({ status: "delivered" }), minutesAfter(30));

    expect(result.dueEmail).toBe("delivered");
    expect((await SampleRequestService.findById(db, paid.id))?.shippedAt).toEqual(minutesAfter(30));
  });

  test("finds a shipment by its Biteship order id", async () => {
    const shipment = await bookOne();

    expect((await SampleShipmentService.findByBiteshipOrderId(db, "order-1"))?.id).toBe(shipment.id);
    expect(await SampleShipmentService.findByBiteshipOrderId(db, "nope")).toBeNull();
  });
});

describe("SampleShipmentService.claimEmail", () => {
  test("only the first of two concurrent claims wins, and a release lets it be claimed again", async () => {
    const shipment = await bookOne();

    const [first, second] = await Promise.all([
      SampleShipmentService.claimEmail(db, shipment.id, "shipped", minutesAfter(1)),
      SampleShipmentService.claimEmail(db, shipment.id, "shipped", minutesAfter(1)),
    ]);
    expect([first, second].filter(Boolean)).toHaveLength(1);

    await SampleShipmentService.releaseEmail(db, shipment.id, "shipped");
    expect(await SampleShipmentService.claimEmail(db, shipment.id, "shipped", minutesAfter(2))).toBe(true);
  });
});
