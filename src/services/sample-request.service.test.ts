import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleBatches, sampleRequests } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues, seedValues } from "../../test/sample-fixtures";
import { SampleBatchService } from "./sample-batch.service";
import { SampleRequestService } from "./sample-request.service";

let db: SampleDatabase;
let close: () => Promise<void>;

beforeEach(async () => {
  const handle = await makeTestDb();
  db = handle.db;
  close = () => handle.pg.close();
});

afterEach(async () => {
  await close();
});

async function claimed(email: string, now: Date = NOW) {
  const result = await SampleRequestService.claim(db, "b01", sampleValues({ email }), now);
  if (result.kind !== "claimed") {
    throw new Error(`expected claimed, got ${result.kind}`);
  }
  return result.request;
}

describe("SampleRequestService.claim", () => {
  test("the first claim gets box 1, a pending hold and a 24 hour window", async () => {
    const request = await claimed("a@example.com");

    expect(request.boxNumber).toBe(1);
    expect(request.status).toBe("pending_payment");
    expect(request.expiresAt).toEqual(minutesAfter(1440));
    expect(request.accessToken).toMatch(/^[A-Za-z0-9]{24}$/);
    expect(request.ref).toBe("fanny");
    expect(request.consentedAt).toEqual(NOW);
  });

  test("the consent time is kept only when they asked for the launch email", async () => {
    const yes = await SampleRequestService.claim(db, "b01", sampleValues({ email: "yes@example.com", wantsLaunchEmail: true }), NOW);
    const no = await SampleRequestService.claim(db, "b01", sampleValues({ email: "no@example.com", wantsLaunchEmail: false }), NOW);
    if (yes.kind !== "claimed" || no.kind !== "claimed") throw new Error("not claimed");

    expect(yes.request.consentedAt).toEqual(NOW);
    expect(no.request.consentedAt).toBeNull();
  });

  test("box numbers count up", async () => {
    await claimed("a@example.com");
    const second = await claimed("b@example.com");

    expect(second.boxNumber).toBe(2);
  });

  test("a full batch refuses the next claim", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 2 });
    await claimed("a@example.com");
    await claimed("b@example.com");

    expect(await SampleRequestService.claim(db, "b01", sampleValues({ email: "c@example.com" }), NOW)).toEqual({
      kind: "full",
    });
  });

  test("a lapsed hold frees its slot and its number is never reused", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 2 });
    await claimed("a@example.com");
    const lapsed = await claimed("b@example.com");
    await db
      .update(sampleRequests)
      .set({ expiresAt: minutesAfter(-1) })
      .where(eq(sampleRequests.id, lapsed.id));

    expect(await SampleRequestService.countClaimed(db, "b01", NOW)).toBe(1);
    const third = await claimed("c@example.com");
    expect(third.boxNumber).toBe(3);

    const [expired] = await db.select().from(sampleRequests).where(eq(sampleRequests.id, lapsed.id));
    expect(expired.status).toBe("expired");
  });

  test("a second request from an email with an unpaid hold replaces the hold", async () => {
    const first = await claimed("a@example.com");
    const second = await claimed("a@example.com", minutesAfter(5));

    expect(second.id).not.toBe(first.id);
    expect(second.boxNumber).toBe(2);
    const [old] = await db.select().from(sampleRequests).where(eq(sampleRequests.id, first.id));
    expect(old.status).toBe("expired");
  });

  test("a second request from an email with a paid box is refused with that box", async () => {
    const first = await claimed("a@example.com");
    await SampleRequestService.markPaid(db, first.id, NOW);

    const result = await SampleRequestService.claim(db, "b01", sampleValues({ email: "A@Example.com" }), NOW);

    expect(result.kind).toBe("already-requested");
    if (result.kind !== "already-requested") return;
    expect(result.request.id).toBe(first.id);
    expect(await db.select().from(sampleRequests)).toHaveLength(1);
  });

  test("a closed batch refuses every claim", async () => {
    await SampleRequestService.updateBatch(db, "b01", { phase: "closed" });

    expect(await SampleRequestService.claim(db, "b01", sampleValues(), NOW)).toEqual({ kind: "closed" });
    expect(await SampleRequestService.getOpenBatch(db)).toBeNull();
  });
});

describe("SampleRequestService.markPaid", () => {
  test("returns the row once, then null", async () => {
    const request = await claimed("a@example.com");

    const first = await SampleRequestService.markPaid(db, request.id, NOW);
    const second = await SampleRequestService.markPaid(db, request.id, minutesAfter(1));

    expect(first?.status).toBe("paid");
    expect(first?.paidAt).toEqual(NOW);
    expect(second).toBeNull();
  });

  test("still pays a request that was lazily expired", async () => {
    const request = await claimed("a@example.com");
    const later = minutesAfter(1441);
    const expired = await SampleRequestService.markExpiredIfLapsed(db, request, later);
    expect(expired.status).toBe("expired");

    const paid = await SampleRequestService.markPaid(db, request.id, later);

    expect(paid?.status).toBe("paid");
  });
});

describe("SampleRequestService lookups", () => {
  test("finds by token and by id, and only active rows by email", async () => {
    const request = await claimed("a@example.com");

    expect((await SampleRequestService.findByToken(db, request.accessToken))?.id).toBe(request.id);
    expect((await SampleRequestService.findById(db, request.id))?.id).toBe(request.id);
    expect(await SampleRequestService.findActiveByEmail(db, "a@example.com")).toBeNull();

    await SampleRequestService.markPaid(db, request.id, NOW);
    expect((await SampleRequestService.findActiveByEmail(db, "a@example.com"))?.id).toBe(request.id);
  });

  test("setStatus and setShopifyOutcome write their columns", async () => {
    const request = await claimed("a@example.com");

    await SampleRequestService.setStatus(db, request.id, "cancelled", { adminNote: "refunded" });
    await SampleRequestService.setShopifyOutcome(db, request.id, "created");
    const row = await SampleRequestService.findById(db, request.id);

    expect(row?.status).toBe("cancelled");
    expect(row?.adminNote).toBe("refunded");
    expect(row?.shopifyOutcome).toBe("created");
  });
});

describe("SampleRequestService labels and time", () => {
  test("formats the box label and word", () => {
    expect(SampleRequestService.boxLabel("b01", 42)).toBe("B01-042");
    expect(SampleRequestService.boxWord(42)).toBe("No. 042");
  });

  test("minutesLeft floors and never goes below zero", async () => {
    const request = await claimed("a@example.com");

    expect(SampleRequestService.minutesLeft(request, minutesAfter(20.5))).toBe(1419);
    expect(SampleRequestService.minutesLeft(request, minutesAfter(2000))).toBe(0);
  });
});

describe("SampleRequestService admin reads", () => {
  test("search matches box label digits, name and email; status filters", async () => {
    const fanny = await claimed("fanny@example.com");
    await SampleRequestService.claim(db, "b01", sampleValues({ email: "marco@example.com", fullName: "Marco Ratunuman", firstName: "Marco" }), NOW);
    await SampleRequestService.markPaid(db, fanny.id, NOW);

    expect((await SampleRequestService.listForAdmin(db, "b01", { query: "001" })).map((row) => row.boxNumber)).toEqual([1]);
    expect((await SampleRequestService.listForAdmin(db, "b01", { query: "marco" })).map((row) => row.boxNumber)).toEqual([2]);
    expect((await SampleRequestService.listForAdmin(db, "b01", { query: "FANNY@" })).map((row) => row.boxNumber)).toEqual([1]);
    expect((await SampleRequestService.listForAdmin(db, "b01", { status: "paid" })).map((row) => row.boxNumber)).toEqual([1]);
    expect((await SampleRequestService.listForAdmin(db, "b01", {})).map((row) => row.boxNumber)).toEqual([2, 1]);
  });

  test("summary counts every status", async () => {
    const fanny = await claimed("fanny@example.com");
    await claimed("marco@example.com");
    await SampleRequestService.markPaid(db, fanny.id, NOW);

    const summary = await SampleRequestService.summary(db, "b01");

    expect(summary).toMatchObject({ pending_payment: 1, paid: 1, shipped: 0, delivered: 0, expired: 0, cancelled: 0 });
  });
});

describe("SampleRequestService.pageState", () => {
  test("a coming-soon batch shows coming soon, even after it has taken requests", async () => {
    await claimed("a@example.com");
    await SampleRequestService.updateBatch(db, "b01", { phase: "upcoming" });

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "upcoming", batch: { label: "Batch 01", capacity: 100 } });
  });

  test("an open batch with room is open, with its live count", async () => {
    await claimed("a@example.com");

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "open", batch: { label: "Batch 01", capacity: 100 }, claimed: 1 });
  });

  test("an open batch that is full shows closed", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    await claimed("a@example.com");

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "closed", batch: { label: "Batch 01", capacity: 1 } });
  });

  test("a closed batch shows closed, even before any request", async () => {
    await SampleRequestService.updateBatch(db, "b01", { phase: "closed" });

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "closed", batch: { label: "Batch 01", capacity: 100 } });
  });

  test("with no batches at all, there is nothing to show", async () => {
    await db.delete(sampleBatches);

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "none" });
  });

  test("only an open batch takes requests", async () => {
    for (const phase of ["upcoming", "closed"] as const) {
      await SampleRequestService.updateBatch(db, "b01", { phase });
      expect(await SampleRequestService.claim(db, "b01", sampleValues(), NOW)).toEqual({ kind: "closed" });
      expect(await SampleRequestService.getOpenBatch(db)).toBeNull();
    }
  });
});

describe("SampleRequestService.claim across batches", () => {
  async function openBatch02() {
    await SampleRequestService.updateBatch(db, "b01", { phase: "closed" });
    const created = await SampleBatchService.create(db, 150, NOW);
    if (!created.ok) throw new Error(created.message);
    await SampleBatchService.setPhase(db, created.batch.id, "open");
  }

  test("someone who paid in Batch 01 is refused in Batch 02, with their Batch 01 request", async () => {
    const first = await claimed("a@example.com");
    await SampleRequestService.markPaid(db, first.id, NOW);
    await openBatch02();

    const result = await SampleRequestService.claim(db, "b02", sampleValues({ email: "a@example.com" }), NOW);

    expect(result.kind).toBe("already-requested");
    if (result.kind !== "already-requested") return;
    expect(result.request.id).toBe(first.id);
    expect(result.request.batchId).toBe("b01");
    expect((await db.select().from(sampleRequests)).filter((row) => row.batchId === "b02")).toHaveLength(0);
  });

  test("a live unpaid hold in Batch 01 is expired by a claim in Batch 02", async () => {
    const hold = await claimed("a@example.com");
    await openBatch02();

    const result = await SampleRequestService.claim(db, "b02", sampleValues({ email: "a@example.com" }), NOW);

    expect(result.kind).toBe("claimed");
    expect((await SampleRequestService.findById(db, hold.id))?.status).toBe("expired");
  });

  test("an expired hold in Batch 01 does not block Batch 02", async () => {
    const hold = await claimed("a@example.com");
    await SampleRequestService.markExpiredIfLapsed(db, hold, minutesAfter(2000));
    await openBatch02();

    expect((await SampleRequestService.claim(db, "b02", sampleValues({ email: "a@example.com" }), minutesAfter(2001))).kind).toBe("claimed");
  });
});

describe("test orders", () => {
  async function claimTest(email: string) {
    const result = await SampleRequestService.claim(db, "b01", sampleValues({ email }), NOW, { isTest: true });
    if (result.kind !== "claimed") throw new Error(`expected claimed, got ${result.kind}`);
    return result.request;
  }

  test("does not count test claims against capacity", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    await claimTest("t@example.com");

    expect((await SampleRequestService.claim(db, "b01", sampleValues({ email: "r@example.com" }), NOW)).kind).toBe("claimed");
  });

  test("lets a real request through after a test request for the same email", async () => {
    const test = await claimTest("a@example.com");
    await SampleRequestService.settle(db, test.id, NOW);

    expect((await SampleRequestService.claim(db, "b01", sampleValues({ email: "a@example.com" }), NOW)).kind).toBe("claimed");
  });

  test("refuses a second test request for an email with a paid test request", async () => {
    const test = await claimTest("a@example.com");
    await SampleRequestService.settle(db, test.id, NOW);

    expect((await SampleRequestService.claim(db, "b01", sampleValues({ email: "a@example.com" }), NOW, { isTest: true })).kind).toBe("already-requested");
  });

  test("pays a test order for an email that already owns a real box", async () => {
    const real = await claimed("a@example.com");
    await SampleRequestService.settle(db, real.id, NOW);
    const test = await claimTest("a@example.com");

    expect((await SampleRequestService.settle(db, test.id, NOW)).kind).toBe("paid");
  });

  test("paying a test order leaves a real hold for the same email pending", async () => {
    const real = await claimed("a@example.com");
    const test = await claimTest("a@example.com");
    await SampleRequestService.settle(db, test.id, NOW);

    expect((await SampleRequestService.findById(db, real.id))?.status).toBe("pending_payment");
  });

  test("setTest flips the flag", async () => {
    const request = await claimed("a@example.com");
    await SampleRequestService.setTest(db, request.id, true);

    expect((await SampleRequestService.findById(db, request.id))?.isTest).toBe(true);
  });
});

describe("SampleRequestService.seed", () => {
  test("seeds a delivered in-person request with no batch", async () => {
    const result = await SampleRequestService.seed(db, seedValues(), NOW);

    expect(result.kind).toBe("seeded");
    if (result.kind !== "seeded") return;
    expect(result.request).toMatchObject({ source: "in_person", status: "delivered", batchId: null, boxNumber: null, isTest: false });
    expect(result.request.deliveredAt).toEqual(NOW);
  });

  test("refuses to seed an email that already owns a shipped box", async () => {
    const real = await claimed("a@example.com");
    await SampleRequestService.settle(db, real.id, NOW);

    expect((await SampleRequestService.seed(db, seedValues({ email: "a@example.com" }), NOW)).kind).toBe("already-requested");
  });

  test("refuses a shipped claim for an email that was seeded", async () => {
    await SampleRequestService.seed(db, seedValues({ email: "a@example.com" }), NOW);

    expect((await SampleRequestService.claim(db, "b01", sampleValues({ email: "a@example.com" }), NOW)).kind).toBe("already-requested");
  });

  test("does not count a seeded request in any batch", async () => {
    await SampleRequestService.seed(db, seedValues(), NOW);

    expect(await SampleRequestService.countClaimed(db, "b01", NOW)).toBe(0);
  });
});

describe("SampleRequestService.listSeeded", () => {
  test("returns only non-test in-person rows, newest first", async () => {
    await claimed("shipped@example.com");
    const older = await SampleRequestService.seed(db, seedValues({ email: "old@example.com" }), NOW);
    const newer = await SampleRequestService.seed(db, seedValues({ email: "new@example.com" }), minutesAfter(5));
    const hidden = await SampleRequestService.seed(db, seedValues({ email: "test@example.com" }), minutesAfter(10));
    if (older.kind !== "seeded" || newer.kind !== "seeded" || hidden.kind !== "seeded") throw new Error("not seeded");
    await db.update(sampleRequests).set({ isTest: true }).where(eq(sampleRequests.id, hidden.request.id));

    expect((await SampleRequestService.listSeeded(db)).map((row) => row.id)).toEqual([newer.request.id, older.request.id]);
    expect((await SampleRequestService.listSeeded(db, { includeTest: true })).map((row) => row.id)).toEqual([hidden.request.id, newer.request.id, older.request.id]);
  });
});
