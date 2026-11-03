import { createHash } from "node:crypto";

import { describe, expect, test } from "vitest";

import {
  type IMidtransNotification,
  MIDTRANS_ENABLED_PAYMENTS,
  MidtransService,
  PaymentSignal,
} from "./midtrans.service";

const SERVER_KEY = "SB-Mid-server-TEST";

function notification(patch: Partial<IMidtransNotification>): IMidtransNotification {
  const base: IMidtransNotification = {
    order_id: "WS-B01-042-AB12CD",
    status_code: "200",
    gross_amount: "10000.00",
    transaction_status: "settlement",
    signature_key: "",
  };
  const merged = { ...base, ...patch };

  return {
    ...merged,
    signature_key:
      patch.signature_key ??
      MidtransService.computeSignature(merged.order_id, merged.status_code, merged.gross_amount, SERVER_KEY),
  };
}

describe("MidtransService.buildSnapPayload", () => {
  const payload = MidtransService.buildSnapPayload({
    orderId: "WS-B01-042-AB12CD",
    grossAmount: 10000,
    expiryMinutes: 1440,
    itemName: "Shipping: JNE Regular",
    finishUrl: "https://within.id/sample/r/token",
    customer: {
      firstName: "Fanny",
      lastName: "Lie",
      email: "fanny@example.com",
      phone: "+6281234567890",
      address: "Jl. Sudirman 12",
      city: "Jakarta Selatan",
      postalCode: "12250",
    },
  });

  test("carries the order, amount and the three e-wallet methods", () => {
    expect(payload).toMatchObject({
      transaction_details: { order_id: "WS-B01-042-AB12CD", gross_amount: 10000 },
      enabled_payments: MIDTRANS_ENABLED_PAYMENTS,
      expiry: { unit: "minutes", duration: 1440 },
      callbacks: { finish: "https://within.id/sample/r/token" },
    });
    expect(MIDTRANS_ENABLED_PAYMENTS).toEqual(["other_qris", "gopay", "shopeepay"]);
  });

  test("bills one item at the full amount and names the shipping address", () => {
    expect(payload).toMatchObject({
      item_details: [{ price: 10000, quantity: 1, name: "Shipping: JNE Regular" }],
      customer_details: {
        first_name: "Fanny",
        last_name: "Lie",
        email: "fanny@example.com",
        phone: "+6281234567890",
        shipping_address: { postal_code: "12250", city: "Jakarta Selatan", country_code: "IDN" },
      },
    });
  });
});

describe("MidtransService signatures", () => {
  test("computes sha512 over order id, status code, gross amount and server key", () => {
    const expected = createHash("sha512").update("ORDER-1" + "200" + "10000.00" + SERVER_KEY).digest("hex");

    expect(MidtransService.computeSignature("ORDER-1", "200", "10000.00", SERVER_KEY)).toBe(expected);
  });

  test("verifies a genuine notification", () => {
    expect(MidtransService.verifyNotification(notification({}), SERVER_KEY)).toBe(true);
  });

  test("rejects a notification whose amount was tampered with", () => {
    const genuine = notification({});

    expect(MidtransService.verifyNotification({ ...genuine, gross_amount: "1.00" }, SERVER_KEY)).toBe(false);
  });
});

describe("MidtransService.interpretNotification", () => {
  test.each([
    ["settlement", undefined, PaymentSignal.Paid],
    ["capture", "accept", PaymentSignal.Paid],
    ["capture", "challenge", PaymentSignal.Pending],
    ["pending", undefined, PaymentSignal.Pending],
    ["expire", undefined, PaymentSignal.Lapsed],
    ["cancel", undefined, PaymentSignal.Lapsed],
    ["deny", undefined, PaymentSignal.Lapsed],
    ["refund", undefined, PaymentSignal.Ignore],
  ])("%s with fraud %s is %s", (status, fraud, signal) => {
    expect(
      MidtransService.interpretNotification(notification({ transaction_status: status, fraud_status: fraud }))
    ).toBe(signal);
  });
});

describe("MidtransService.toPaymentStatus", () => {
  test("keeps the five known statuses and maps the rest to failure", () => {
    for (const status of ["pending", "settlement", "expire", "cancel", "deny"]) {
      expect(MidtransService.toPaymentStatus(notification({ transaction_status: status }))).toBe(status);
    }
    expect(MidtransService.toPaymentStatus(notification({ transaction_status: "refund" }))).toBe("failure");
  });
});

describe("MidtransService.parseNotification", () => {
  test("rejects a body without the required strings", () => {
    expect(MidtransService.parseNotification({})).toBeNull();
    expect(MidtransService.parseNotification(null)).toBeNull();
  });

  test("returns the typed shape for a valid body", () => {
    const parsed = MidtransService.parseNotification({ ...notification({}), payment_type: "qris" });

    expect(parsed?.order_id).toBe("WS-B01-042-AB12CD");
    expect(parsed?.payment_type).toBe("qris");
  });
});

describe("MidtransService hosts", () => {
  test("picks the sandbox snap.js in sandbox", () => {
    expect(MidtransService.snapScriptUrl("sandbox")).toBe("https://app.sandbox.midtrans.com/snap/snap.js");
  });

  test("picks the live snap.js in production", () => {
    expect(MidtransService.snapScriptUrl("production")).toBe("https://app.midtrans.com/snap/snap.js");
  });
});

describe("MidtransService.createSnapTransaction failures", () => {
  test("returns null instead of throwing when the server key is missing", async () => {
    const saved = process.env.MIDTRANS_SERVER_KEY;
    delete process.env.MIDTRANS_SERVER_KEY;

    await expect(
      MidtransService.createSnapTransaction({
        orderId: "WS-B01-001-AAAAAA",
        grossAmount: 10000,
        expiryMinutes: 60,
        itemName: "Shipping",
        finishUrl: "https://within.id",
        customer: { firstName: "A", lastName: null, email: "a@b.co", phone: "+6281234567890", address: "x", city: "y", postalCode: "12250" },
      })
    ).resolves.toBeNull();

    process.env.MIDTRANS_SERVER_KEY = saved;
  });
});
