import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { SampleDatabase } from "@/db/database";
import type { SampleBatch, SampleRequest } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues } from "../../test/sample-fixtures";
import { type IMidtransNotification, MidtransService, PaymentSignal } from "./midtrans.service";
import { SamplePaymentService } from "./sample-payment.service";
import { SampleRequestService } from "./sample-request.service";

const FINISH_URL = "https://within.id/sample/r/token";

let db: SampleDatabase;
let close: () => Promise<void>;
let batch: SampleBatch;
let request: SampleRequest;
let createSnap: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  const handle = await makeTestDb();
  db = handle.db;
  close = () => handle.pg.close();
  const open = await SampleRequestService.getOpenBatch(db);
  if (open === null) throw new Error("no batch");
  batch = open;
  const result = await SampleRequestService.claim(db, "b01", sampleValues(), NOW);
  if (result.kind !== "claimed") throw new Error(result.kind);
  request = result.request;
  createSnap = vi
    .spyOn(MidtransService, "createSnapTransaction")
    .mockResolvedValue({ token: "snap-token", redirectUrl: "https://app.sandbox.midtrans.com/snap/v4/x" });
});

afterEach(async () => {
  vi.restoreAllMocks();
  await close();
});

function notification(orderId: string, patch: Partial<IMidtransNotification> = {}): IMidtransNotification {
  return {
    order_id: orderId,
    status_code: "200",
    gross_amount: "10000.00",
    transaction_status: "settlement",
    signature_key: "unchecked-here",
    ...patch,
  };
}

describe("SamplePaymentService.buildOrderId", () => {
  test("prefixes the box label and appends the suffix", () => {
    expect(SamplePaymentService.buildOrderId("b01", 42, "AB12CD")).toBe("WS-B01-042-AB12CD");
  });
});

describe("SamplePaymentService.createAttempt", () => {
  test("stores a pending attempt at the courier fee with the minutes left in the hold", async () => {
    const payment = await SamplePaymentService.createAttempt(db, request, batch, minutesAfter(20), FINISH_URL);

    expect(payment).toMatchObject({ grossAmount: 10000, status: "pending", snapToken: "snap-token" });
    expect(payment?.midtransOrderId).toMatch(/^WS-B01-001-[A-Z0-9]{6}$/);
    expect(createSnap).toHaveBeenCalledWith(
      expect.objectContaining({ expiryMinutes: 1420, grossAmount: 10000, finishUrl: FINISH_URL })
    );
  });

  test("returns null and stores nothing when Midtrans fails", async () => {
    createSnap.mockResolvedValue(null);

    expect(await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL)).toBeNull();
    expect(await SamplePaymentService.latestForRequest(db, request.id)).toBeNull();
  });
});

describe("SamplePaymentService.reopen", () => {
  test("hands back the open attempt while it is still pending", async () => {
    const first = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);

    const result = await SamplePaymentService.reopen(db, request, batch, minutesAfter(10), FINISH_URL);

    expect(result.kind).toBe("token");
    if (result.kind !== "token") return;
    expect(result.payment.id).toBe(first?.id);
    expect(createSnap).toHaveBeenCalledTimes(1);
  });

  test("mints a new attempt once the last one lapsed", async () => {
    const first = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (first === null) throw new Error("no attempt");
    await SamplePaymentService.applyNotification(
      db,
      notification(first.midtransOrderId, { transaction_status: "expire" }),
      minutesAfter(15)
    );

    const result = await SamplePaymentService.reopen(db, request, batch, minutesAfter(20), FINISH_URL);

    expect(result.kind).toBe("token");
    if (result.kind !== "token") return;
    expect(result.payment.midtransOrderId).not.toBe(first.midtransOrderId);
    expect(createSnap).toHaveBeenLastCalledWith(expect.objectContaining({ expiryMinutes: 1420 }));
  });

  test("reports a lapsed hold and writes the request as expired", async () => {
    const result = await SamplePaymentService.reopen(db, request, batch, minutesAfter(1441), FINISH_URL);

    expect(result).toEqual({ kind: "lapsed" });
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("expired");
  });

  test("refuses a request that is no longer pending", async () => {
    await SampleRequestService.markPaid(db, request.id, NOW);
    const paid = await SampleRequestService.findById(db, request.id);
    if (paid === null) throw new Error("missing");

    expect(await SamplePaymentService.reopen(db, paid, batch, NOW, FINISH_URL)).toEqual({ kind: "not-pending" });
  });
});

describe("SamplePaymentService.applyNotification", () => {
  test("a settlement pays the request once, then reads as an update", async () => {
    const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (attempt === null) throw new Error("no attempt");

    const first = await SamplePaymentService.applyNotification(
      db,
      notification(attempt.midtransOrderId, { payment_type: "qris", transaction_id: "tx-1" }),
      minutesAfter(5)
    );
    const second = await SamplePaymentService.applyNotification(
      db,
      notification(attempt.midtransOrderId),
      minutesAfter(6)
    );

    expect(first.kind).toBe("paid");
    if (first.kind !== "paid") return;
    expect(first.request.status).toBe("paid");
    expect(first.request.paidAt).toEqual(minutesAfter(5));
    expect(second).toEqual({ kind: "updated" });
    const stored = await SamplePaymentService.latestForRequest(db, request.id);
    expect(stored).toMatchObject({ status: "settlement", paymentType: "qris", transactionId: "tx-1" });
    expect(stored?.settledAt).toEqual(minutesAfter(5));
  });

  test("an expiry ends the attempt and leaves the hold open", async () => {
    const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (attempt === null) throw new Error("no attempt");

    const result = await SamplePaymentService.applyNotification(
      db,
      notification(attempt.midtransOrderId, { transaction_status: "expire" }),
      minutesAfter(15)
    );

    expect(result).toEqual({ kind: "updated" });
    expect((await SamplePaymentService.latestForRequest(db, request.id))?.status).toBe("expire");
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("pending_payment");
  });

  test("a late pending never moves a paid request or a settled attempt backwards", async () => {
    const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (attempt === null) throw new Error("no attempt");
    await SamplePaymentService.applyNotification(db, notification(attempt.midtransOrderId), minutesAfter(5));

    const result = await SamplePaymentService.applyNotification(
      db,
      notification(attempt.midtransOrderId, { transaction_status: "pending" }),
      minutesAfter(6)
    );

    expect(result).toEqual({ kind: "ignored" });
    expect((await SamplePaymentService.latestForRequest(db, request.id))?.status).toBe("settlement");
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("paid");
  });

  test("an unknown order id is reported as unknown", async () => {
    expect(await SamplePaymentService.applyNotification(db, notification("WS-B01-999-ZZZZZZ"), NOW)).toEqual({
      kind: "unknown",
    });
  });

  test("a settlement on a lazily expired request still pays it", async () => {
    const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (attempt === null) throw new Error("no attempt");
    await SampleRequestService.markExpiredIfLapsed(db, request, minutesAfter(1441));

    const result = await SamplePaymentService.applyNotification(
      db,
      notification(attempt.midtransOrderId),
      minutesAfter(1442)
    );

    expect(result.kind).toBe("paid");
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("paid");
  });
});

describe("SamplePaymentService.applyNotification when the request should not be paid", () => {
  test("the same email paying a replaced hold and its new one gets one box and a refund note", async () => {
    const first = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (first === null) throw new Error("no attempt");
    const second = await SampleRequestService.claim(db, "b01", sampleValues(), minutesAfter(1));
    if (second.kind !== "claimed") throw new Error(second.kind);
    const secondAttempt = await SamplePaymentService.createAttempt(db, second.request, batch, minutesAfter(1), FINISH_URL);
    if (secondAttempt === null) throw new Error("no attempt");

    const paid = await SamplePaymentService.applyNotification(db, notification(first.midtransOrderId), minutesAfter(2));
    const late = await SamplePaymentService.applyNotification(db, notification(secondAttempt.midtransOrderId), minutesAfter(3));

    expect(paid.kind).toBe("paid");
    expect(late.kind).toBe("refund");
    const after = await SampleRequestService.findById(db, second.request.id);
    expect(after?.status).toBe("expired");
    expect(after?.adminNote).toContain(`REFUND DUE: ${secondAttempt.midtransOrderId}`);
  });

  test("a payment never brings a cancelled request back", async () => {
    const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (attempt === null) throw new Error("no attempt");
    await SampleRequestService.setStatus(db, request.id, "cancelled", { adminNote: "Founder note" });

    const result = await SamplePaymentService.applyNotification(db, notification(attempt.midtransOrderId), minutesAfter(5));

    expect(result.kind).toBe("refund");
    const after = await SampleRequestService.findById(db, request.id);
    expect(after?.status).toBe("cancelled");
    expect(after?.adminNote).toContain("Founder note");
  });

  test("a stale read cannot expire a request that has been paid", async () => {
    await SampleRequestService.markPaid(db, request.id, NOW);

    const result = await SampleRequestService.markExpiredIfLapsed(db, request, minutesAfter(1441));

    expect(result.status).toBe("paid");
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("paid");
  });

  test("replacing a hold cancels its open Midtrans order", async () => {
    const attempt = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (attempt === null) throw new Error("no attempt");
    const cancel = vi.spyOn(MidtransService, "cancelTransaction").mockResolvedValue(true);
    await SampleRequestService.claim(db, "b01", sampleValues(), minutesAfter(1));

    await SamplePaymentService.cancelSuperseded(db, sampleValues().email, minutesAfter(1));

    expect(cancel).toHaveBeenCalledWith(attempt.midtransOrderId);
    expect((await SamplePaymentService.findByOrderId(db, attempt.midtransOrderId))?.status).toBe("cancel");
  });

  test("a Midtrans failure lets the sampler pay again", () => {
    expect(MidtransService.interpretNotification(notification("x", { transaction_status: "failure" }))).toBe(PaymentSignal.Lapsed);
  });
});

describe("SamplePaymentService.reopen checks Midtrans before reusing a pending attempt", () => {
  test("mints a new attempt when Midtrans says the open one expired but the webhook never came", async () => {
    const first = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (first === null) throw new Error("no attempt");
    vi.spyOn(MidtransService, "fetchStatus").mockResolvedValue(
      notification(first.midtransOrderId, { transaction_status: "expire", status_code: "407" })
    );

    const result = await SamplePaymentService.reopen(db, request, batch, minutesAfter(20), FINISH_URL);

    expect(result.kind).toBe("token");
    if (result.kind !== "token") return;
    expect(result.payment.midtransOrderId).not.toBe(first.midtransOrderId);
  });

  test("reuses the open attempt when Midtrans still reports it pending", async () => {
    const first = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (first === null) throw new Error("no attempt");
    vi.spyOn(MidtransService, "fetchStatus").mockResolvedValue(
      notification(first.midtransOrderId, { transaction_status: "pending", status_code: "201" })
    );

    const result = await SamplePaymentService.reopen(db, request, batch, minutesAfter(5), FINISH_URL);

    expect(result.kind === "token" && result.payment.id).toBe(first.id);
  });
});

describe("SamplePaymentService.reopen when Midtrans already settled", () => {
  test("reports the request as newly paid so the caller sends the paid email", async () => {
    const first = await SamplePaymentService.createAttempt(db, request, batch, NOW, FINISH_URL);
    if (first === null) throw new Error("no attempt");
    vi.spyOn(MidtransService, "fetchStatus").mockResolvedValue(notification(first.midtransOrderId));

    const result = await SamplePaymentService.reopen(db, request, batch, minutesAfter(5), FINISH_URL);

    expect(result.kind).toBe("paid");
    expect((await SampleRequestService.findById(db, request.id))?.status).toBe("paid");
  });
});
