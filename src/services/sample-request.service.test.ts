import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleRequests } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues } from "../../test/sample-fixtures";
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
    expect(await SampleRequestService.findActiveByEmail(db, "b01", "a@example.com")).toBeNull();

    await SampleRequestService.markPaid(db, request.id, NOW);
    expect((await SampleRequestService.findActiveByEmail(db, "b01", "a@example.com"))?.id).toBe(request.id);
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

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "upcoming" });
  });

  test("an open batch with room is open, with its live count", async () => {
    await claimed("a@example.com");

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "open", claimed: 1, capacity: 100 });
  });

  test("an open batch that is full shows closed", async () => {
    await SampleRequestService.updateBatch(db, "b01", { capacity: 1 });
    await claimed("a@example.com");

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "closed" });
  });

  test("a closed batch shows closed, even before any request", async () => {
    await SampleRequestService.updateBatch(db, "b01", { phase: "closed" });

    expect(await SampleRequestService.pageState(db, NOW)).toEqual({ kind: "closed" });
  });

  test("only an open batch takes requests", async () => {
    for (const phase of ["upcoming", "closed"] as const) {
      await SampleRequestService.updateBatch(db, "b01", { phase });
      expect(await SampleRequestService.claim(db, "b01", sampleValues(), NOW)).toEqual({ kind: "closed" });
      expect(await SampleRequestService.getOpenBatch(db)).toBeNull();
    }
  });
});
