import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleWebhookEvents, type SampleRequest } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues } from "../../test/sample-fixtures";
import { BiteshipService, type IBiteshipOrder } from "./biteship.service";
import { MidtransService } from "./midtrans.service";
import { SampleNotifier } from "./sample-notifier.service";
import { SamplePaymentService } from "./sample-payment.service";
import { SampleRequestService } from "./sample-request.service";
import { SampleShipmentService } from "./sample-shipment.service";
import { WebhookHandlers } from "./webhook-handlers.service";

const SERVER_KEY = "SB-Mid-server-TEST";

let db: SampleDatabase;
let close: () => Promise<void>;
let request: SampleRequest;

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
  request = result.request;
  vi.spyOn(MidtransService, "createSnapTransaction").mockResolvedValue({ token: "t", redirectUrl: "https://r" });
  vi.spyOn(SampleNotifier, "sendPaid").mockResolvedValue(true);
  vi.spyOn(SampleNotifier, "sendShipped").mockResolvedValue(true);
  vi.spyOn(SampleNotifier, "sendDelivered").mockResolvedValue(true);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await close();
});

function signed(orderId: string, status = "settlement") {
  const base = { order_id: orderId, status_code: "200", gross_amount: "10000.00", transaction_status: status };
  return {
    ...base,
    signature_key: MidtransService.computeSignature(base.order_id, base.status_code, base.gross_amount, SERVER_KEY),
  };
}

async function openAttempt() {
  const batch = await SampleRequestService.getOpenBatch(db);
  if (batch === null) throw new Error("no batch");
  const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, "https://f");
  if (attempt === null) throw new Error("no attempt");
  return attempt;
}

describe("WebhookHandlers.handleMidtrans", () => {
  test("a bad signature is stored with an error and changes nothing", async () => {
    const attempt = await openAttempt();

    const result = await WebhookHandlers.handleMidtrans(db, { ...signed(attempt.midtransOrderId), signature_key: "bad" }, SERVER_KEY, NOW);

    expect(result.status).toBe(200);
    const [event] = await db.select().from(sampleWebhookEvents);
    expect(event.error).toBe("invalid signature");
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("pending_payment");
  });

  test("a settlement pays and sends the paid email once across replays", async () => {
    const attempt = await openAttempt();

    await WebhookHandlers.handleMidtrans(db, signed(attempt.midtransOrderId), SERVER_KEY, minutesAfter(1));
    await WebhookHandlers.handleMidtrans(db, signed(attempt.midtransOrderId), SERVER_KEY, minutesAfter(2));

    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("paid");
    expect(SampleNotifier.sendPaid).toHaveBeenCalledTimes(1);
    expect(await db.select().from(sampleWebhookEvents)).toHaveLength(2);
  });

  test("an unparseable body is stored and answered 200", async () => {
    expect((await WebhookHandlers.handleMidtrans(db, { nope: true }, SERVER_KEY, NOW)).status).toBe(200);
    expect(await db.select().from(sampleWebhookEvents)).toHaveLength(1);
  });
});

describe("WebhookHandlers.handleBiteship", () => {
  function order(status: string): IBiteshipOrder {
    return { id: "order-1", status, trackingId: "t", waybillId: "JNE1", trackingLink: "https://t", price: 10000, history: [] };
  }

  async function shipped() {
    await SampleRequestService.markPaid(db, request.id, NOW);
    vi.spyOn(BiteshipService, "createOrder").mockResolvedValue(order("confirmed"));
    await SampleShipmentService.bookRun(db, { requestIds: [request.id], deliveryType: "now", deliveryDate: null, deliveryTime: null }, NOW);
  }

  test("an unknown order id is stored and answered 200", async () => {
    const fetchOrder = vi.fn();

    const result = await WebhookHandlers.handleBiteship(db, { event: "order.status", order_id: "nope", status: "picked" }, NOW, fetchOrder);

    expect(result.status).toBe(200);
    expect(fetchOrder).not.toHaveBeenCalled();
    expect(await db.select().from(sampleWebhookEvents)).toHaveLength(1);
  });

  test("picked sends the shipped email once across replays", async () => {
    await shipped();
    const fetchOrder = vi.fn().mockResolvedValue(order("picked"));
    const body = { event: "order.status", order_id: "order-1", status: "picked" };

    await WebhookHandlers.handleBiteship(db, body, minutesAfter(10), fetchOrder);
    await WebhookHandlers.handleBiteship(db, body, minutesAfter(11), fetchOrder);

    expect(SampleNotifier.sendShipped).toHaveBeenCalledTimes(1);
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("shipped");
  });

  test("delivered sends the delivered email", async () => {
    await shipped();
    const fetchOrder = vi.fn().mockResolvedValue(order("delivered"));

    await WebhookHandlers.handleBiteship(db, { event: "order.status", order_id: "order-1", status: "delivered" }, minutesAfter(10), fetchOrder);

    expect(SampleNotifier.sendDelivered).toHaveBeenCalledTimes(1);
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("delivered");
  });
});
