import { describe, expect, test } from "vitest";

import { BANK_TRANSFER, isBankTransferReady, whatsappUrl } from "./bank-transfer";

const READY = { ...BANK_TRANSFER, whatsappNumber: "0812 3456 7890" };

describe("whatsappUrl", () => {
  test("whatsappUrl normalizes Indonesian numbers", () => {
    expect(whatsappUrl("0812 3456 7890")).toBe("https://wa.me/6281234567890");
    expect(whatsappUrl("+62 812-3456-7890")).toBe("https://wa.me/6281234567890");
    expect(whatsappUrl("6281234567890")).toBe("https://wa.me/6281234567890");
  });

  test("carries an encoded message", () => {
    expect(whatsappUrl("6281234567890", "Hi WITHIN, order K7P2QX")).toBe("https://wa.me/6281234567890?text=Hi%20WITHIN%2C%20order%20K7P2QX");
  });

  test("has no link without a number", () => {
    expect(whatsappUrl("")).toBeNull();
    expect(whatsappUrl(" - ")).toBeNull();
  });
});

describe("isBankTransferReady", () => {
  test("bank transfer is not ready while the WhatsApp number is empty", () => {
    expect(isBankTransferReady({ ...READY, whatsappNumber: "" })).toBe(false);
    expect(isBankTransferReady(READY)).toBe(true);
    expect(isBankTransferReady({ ...READY, whatsappNumber: "  " })).toBe(false);
  });

  test("bank transfer is not ready while any bank field is blank", () => {
    expect(isBankTransferReady({ ...READY, accountNumber: "" })).toBe(false);
    expect(isBankTransferReady({ ...READY, accountHolder: " " })).toBe(false);
    expect(isBankTransferReady({ ...READY, bankName: "" })).toBe(false);
  });
});
