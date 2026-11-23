import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleBatches, sampleRequests } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues, seedValues } from "../../test/sample-fixtures";
import { SampleRequestService } from "./sample-request.service";
import { SampleTransferService } from "./sample-transfer.service";

let db: SampleDatabase;
let close: () => Promise<void>;

beforeEach(async () => {
  const handle = await makeTestDb();
  db = handle.db;
  close = () => handle.pg.close();
  await db.update(sampleBatches).set({ paymentMethod: "bank_transfer" }).where(eq(sampleBatches.id, "b01"));
});

afterEach(async () => {
  await close();
});

const HOLD_MINUTES = 1440;

async function claimed(email: string, now: Date = NOW, options: { isTest?: boolean } = {}) {
  const result = await SampleRequestService.claim(db, "b01", sampleValues({ email }), now, options);
  if (result.kind !== "claimed") throw new Error(`expected claimed, got ${result.kind}`);
  return result.request;
}

async function stored(id: string) {
  const request = await SampleRequestService.findById(db, id);
  if (request === null) throw new Error("request missing");
  return request;
}

/** A request whose hold lapsed unpaid, as the lazy expiry leaves it. */
async function lapsed(email: string) {
  const request = await claimed(email);
  await SampleRequestService.markExpiredIfLapsed(db, request, minutesAfter(HOLD_MINUTES + 1));
  return stored(request.id);
}

describe("SampleTransferService.report", () => {
  test("reporting moves a live hold to awaiting confirmation", async () => {
    const request = await claimed("a@example.com");

    const result = await SampleTransferService.report(db, request.accessToken, NOW);

    expect(result.kind).toBe("reported");
    const after = await stored(request.id);
    expect(after.status).toBe("awaiting_confirmation");
    expect(after.transferReportedAt).toEqual(NOW);
  });

  test("reporting twice keeps the first time", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.report(db, request.accessToken, NOW);

    expect((await SampleTransferService.report(db, request.accessToken, minutesAfter(5))).kind).toBe("reported");
    expect((await stored(request.id)).transferReportedAt).toEqual(NOW);
  });

  test("a report after the hold lapsed expires the request", async () => {
    const request = await claimed("a@example.com");

    expect(await SampleTransferService.report(db, request.accessToken, minutesAfter(HOLD_MINUTES + 1))).toEqual({ kind: "lapsed" });
    expect((await stored(request.id)).status).toBe("expired");
  });

  test("a Midtrans request cannot be reported", async () => {
    await db.update(sampleBatches).set({ paymentMethod: "midtrans" }).where(eq(sampleBatches.id, "b01"));
    const request = await claimed("a@example.com");

    expect(await SampleTransferService.report(db, request.accessToken, NOW)).toEqual({ kind: "not-found" });
    expect((await stored(request.id)).status).toBe("pending_payment");
  });

  test("an unknown token is not found", async () => {
    expect(await SampleTransferService.report(db, "AbCdEfGhIjKlMnOpQrStUvWx", NOW)).toEqual({ kind: "not-found" });
  });

  test("a paid request is not reported again", async () => {
    const request = await claimed("a@example.com");
    await SampleRequestService.markPaid(db, request.id, NOW);

    expect((await SampleTransferService.report(db, request.accessToken, NOW)).kind).toBe("not-pending");
    expect((await stored(request.id)).status).toBe("paid");
  });
});

describe("SampleTransferService.confirm", () => {
  test("confirming a reported transfer pays it", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.report(db, request.accessToken, NOW);

    const result = await SampleTransferService.confirm(db, request.id, minutesAfter(30));

    expect(result.kind).toBe("paid");
    const after = await stored(request.id);
    expect(after.status).toBe("paid");
    expect(after.paidAt).toEqual(minutesAfter(30));
  });

  test("confirming a hold that was never reported pays it", async () => {
    const request = await claimed("a@example.com");

    expect((await SampleTransferService.confirm(db, request.id, NOW)).kind).toBe("paid");
    expect((await stored(request.id)).status).toBe("paid");
  });

  test("confirming twice is a repeat", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.confirm(db, request.id, NOW);

    expect(await SampleTransferService.confirm(db, request.id, minutesAfter(5))).toEqual({ kind: "repeat" });
    expect((await stored(request.id)).paidAt).toEqual(NOW);
  });

  test("a late transfer is paid while the batch has room", async () => {
    const request = await lapsed("a@example.com");

    expect((await SampleTransferService.confirm(db, request.id, minutesAfter(HOLD_MINUTES + 60))).kind).toBe("paid");
    expect((await stored(request.id)).status).toBe("paid");
  });

  test("a late transfer in a full batch is a refund", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    const late = await lapsed("a@example.com");
    const other = await claimed("b@example.com", minutesAfter(HOLD_MINUTES + 2));
    await SampleRequestService.markPaid(db, other.id, minutesAfter(HOLD_MINUTES + 3));

    const result = await SampleTransferService.confirm(db, late.id, minutesAfter(HOLD_MINUTES + 60));

    expect(result.kind).toBe("refund");
    const after = await stored(late.id);
    expect(after.status).toBe("expired");
    expect(after.adminNote).toContain("REFUND DUE");
    expect(after.adminNote).toContain(late.paymentCode ?? "missing code");
  });

  test("a refund is noted once however often it is confirmed", async () => {
    const request = await claimed("a@example.com");
    await SampleRequestService.setStatus(db, request.id, "cancelled");

    await SampleTransferService.confirm(db, request.id, NOW);
    await SampleTransferService.confirm(db, request.id, minutesAfter(1));

    expect((await stored(request.id)).adminNote?.match(/REFUND DUE/g)).toHaveLength(1);
  });

  test("a late transfer replaces the same sampler's newer hold", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    const old = await lapsed("a@example.com");
    const newer = await claimed("a@example.com", minutesAfter(HOLD_MINUTES + 2));

    expect((await SampleTransferService.confirm(db, old.id, minutesAfter(HOLD_MINUTES + 60))).kind).toBe("paid");
    expect((await stored(newer.id)).status).toBe("expired");
    expect(await SampleRequestService.countClaimed(db, "b01", minutesAfter(HOLD_MINUTES + 60))).toBe(1);
  });

  test("confirming a rejected request is a refund", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.reject(db, request.id, "");

    expect((await SampleTransferService.confirm(db, request.id, NOW)).kind).toBe("refund");
    expect((await stored(request.id)).status).toBe("cancelled");
  });

  test("confirming in a closed batch still pays", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.report(db, request.accessToken, NOW);
    await db.update(sampleBatches).set({ phase: "closed" }).where(eq(sampleBatches.id, "b01"));

    expect((await SampleTransferService.confirm(db, request.id, minutesAfter(30))).kind).toBe("paid");
  });

  test("confirming an old code releases the same sampler's reported request", async () => {
    const old = await lapsed("a@example.com");
    const newer = await claimed("a@example.com", minutesAfter(HOLD_MINUTES + 2));
    await SampleTransferService.report(db, newer.accessToken, minutesAfter(HOLD_MINUTES + 3));

    expect((await SampleTransferService.confirm(db, old.id, minutesAfter(HOLD_MINUTES + 60))).kind).toBe("paid");
    expect((await stored(newer.id)).status).toBe("expired");
    expect(await SampleRequestService.countClaimed(db, "b01", minutesAfter(HOLD_MINUTES + 60))).toBe(1);
  });

  test("an old code still pays when the sampler's own reported request holds the last box", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    const old = await lapsed("a@example.com");
    const newer = await claimed("a@example.com", minutesAfter(HOLD_MINUTES + 2));
    await SampleTransferService.report(db, newer.accessToken, minutesAfter(HOLD_MINUTES + 3));

    expect((await SampleTransferService.confirm(db, old.id, minutesAfter(HOLD_MINUTES + 60))).kind).toBe("paid");
  });

  test("a refund on a live request frees its box", async () => {
    const reported = await claimed("a@example.com");
    await SampleTransferService.report(db, reported.accessToken, NOW);
    const seeded = await SampleRequestService.seed(db, seedValues({ email: "a@example.com" }), minutesAfter(5));
    if (seeded.kind !== "seeded") throw new Error(seeded.kind);

    expect((await SampleTransferService.confirm(db, reported.id, minutesAfter(10))).kind).toBe("refund");
    const after = await stored(reported.id);
    expect(after.status).toBe("expired");
    expect(after.adminNote).toContain(`REFUND DUE: ${reported.paymentCode ?? "missing code"}`);
    expect(await SampleRequestService.countClaimed(db, "b01", minutesAfter(10))).toBe(0);
  });

  test("a sampler who already owns a box is not asked to pay again", async () => {
    const reported = await claimed("a@example.com");
    await SampleTransferService.report(db, reported.accessToken, NOW);
    await SampleRequestService.seed(db, seedValues({ email: "a@example.com" }), minutesAfter(5));

    expect((await SampleRequestService.claim(db, "b01", sampleValues({ email: "a@example.com" }), minutesAfter(10))).kind).toBe("already-requested");
  });

  test("a late transfer is paid once a lapsed hold that nobody expired is counted out", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    const late = await lapsed("a@example.com");
    await claimed("b@example.com", minutesAfter(HOLD_MINUTES + 2));

    expect((await SampleTransferService.confirm(db, late.id, minutesAfter(2 * HOLD_MINUTES + 10))).kind).toBe("paid");
  });

  test("a reported transfer is paid even after the founder lowers capacity below the boxes held", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 2 });
    const first = await claimed("a@example.com");
    const second = await claimed("b@example.com");
    await SampleTransferService.report(db, first.accessToken, NOW);
    await SampleTransferService.report(db, second.accessToken, NOW);
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });

    expect((await SampleTransferService.confirm(db, first.id, minutesAfter(30))).kind).toBe("paid");
  });

  test("another sampler's live hold in the last box makes a late transfer a refund", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    const late = await lapsed("a@example.com");
    await claimed("b@example.com", minutesAfter(HOLD_MINUTES + 2));

    const result = await SampleTransferService.confirm(db, late.id, minutesAfter(HOLD_MINUTES + 60));

    expect(result.kind).toBe("refund");
    expect((await stored(late.id)).status).toBe("expired");
  });

  test("a late transfer from a sampler paid under another code is noted for a refund", async () => {
    const old = await lapsed("a@example.com");
    const newer = await claimed("a@example.com", minutesAfter(HOLD_MINUTES + 2));
    await SampleTransferService.confirm(db, newer.id, minutesAfter(HOLD_MINUTES + 3));

    expect((await SampleTransferService.confirm(db, old.id, minutesAfter(HOLD_MINUTES + 60))).kind).toBe("refund");
    expect((await stored(old.id)).adminNote).toContain(`REFUND DUE: ${old.paymentCode ?? "missing code"}`);
  });

  test("a Midtrans request is refused", async () => {
    await db.update(sampleBatches).set({ paymentMethod: "midtrans" }).where(eq(sampleBatches.id, "b01"));
    const request = await claimed("a@example.com");

    expect(await SampleTransferService.confirm(db, request.id, NOW)).toEqual({ kind: "refused", message: "Only bank-transfer requests are confirmed here." });
    expect((await stored(request.id)).status).toBe("pending_payment");
  });
});

describe("SampleTransferService.reject", () => {
  test("rejecting frees the box and keeps earlier notes", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.report(db, request.accessToken, NOW);
    await db.update(sampleRequests).set({ adminNote: "called" }).where(eq(sampleRequests.id, request.id));

    expect(await SampleTransferService.reject(db, request.id, "no money by Friday")).toEqual({ ok: true });
    const after = await stored(request.id);
    expect(after.status).toBe("cancelled");
    expect(after.adminNote).toBe("called\nTransfer not found. no money by Friday");
    expect(await SampleRequestService.countClaimed(db, "b01", NOW)).toBe(0);
  });

  test("a blank note leaves only the reason", async () => {
    const request = await claimed("a@example.com");

    await SampleTransferService.reject(db, request.id, "   ");

    expect((await stored(request.id)).adminNote).toBe("Transfer not found.");
  });

  test("a paid request cannot be rejected", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.confirm(db, request.id, NOW);

    expect(await SampleTransferService.reject(db, request.id, "")).toEqual({ ok: false, message: "Only a holding or to-confirm request can be rejected." });
    expect((await stored(request.id)).status).toBe("paid");
  });

  test("a Midtrans request cannot be rejected", async () => {
    await db.update(sampleBatches).set({ paymentMethod: "midtrans" }).where(eq(sampleBatches.id, "b01"));
    const request = await claimed("a@example.com");

    expect(await SampleTransferService.reject(db, request.id, "")).toEqual({ ok: false, message: "Only bank-transfer requests are rejected here." });
  });
});

describe("SampleTransferService to-confirm list", () => {
  test("to-confirm list is oldest report first", async () => {
    const first = await claimed("a@example.com", minutesAfter(-120));
    const second = await claimed("b@example.com", minutesAfter(-120));
    const founderOrder = await claimed("c@example.com", minutesAfter(-120), { isTest: true });
    await claimed("holding@example.com", minutesAfter(-120));
    await SampleTransferService.report(db, first.accessToken, NOW);
    await SampleTransferService.report(db, second.accessToken, minutesAfter(-60));
    await SampleTransferService.report(db, founderOrder.accessToken, minutesAfter(-30));

    expect((await SampleTransferService.listToConfirm(db, "b01")).map((row) => row.id)).toEqual([second.id, founderOrder.id, first.id]);
  });

  test("a report older than 24 hours is overdue", async () => {
    const request = await claimed("a@example.com");
    await SampleTransferService.report(db, request.accessToken, NOW);
    const reported = await stored(request.id);

    expect(SampleTransferService.isOverdue(reported, minutesAfter(24 * 60))).toBe(false);
    expect(SampleTransferService.isOverdue(reported, minutesAfter(24 * 60 + 1))).toBe(true);
    expect(SampleTransferService.isOverdue(await claimed("b@example.com"), minutesAfter(48 * 60))).toBe(false);
  });
});
