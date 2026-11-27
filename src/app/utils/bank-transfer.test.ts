import { describe, expect, test } from "vitest";

import { isBankTransferReady, readBankTransferDetails, whatsappUrl } from "./bank-transfer";

const READY = {
  bankName: "CIMB Niaga",
  accountHolder: "DAYA RAGA INDONESIA",
  accountNumber: "800207642000",
  whatsappNumber: "0812 3456 7890",
};

describe("readBankTransferDetails", () => {
  test("reads the four values from the environment, trimmed", () => {
    expect(
      readBankTransferDetails({
        BANK_NAME: " CIMB Niaga ",
        BANK_ACCOUNT_HOLDER: "DAYA RAGA INDONESIA",
        BANK_ACCOUNT_NUMBER: "800207642000\n",
        WHATSAPP_NUMBER: "0812 3456 7890",
      })
    ).toEqual(READY);
  });

  test("a missing value reads as empty, so bank transfer is not ready", () => {
    const details = readBankTransferDetails({ BANK_NAME: "CIMB Niaga" });

    expect(details.whatsappNumber).toBe("");
    expect(isBankTransferReady(details)).toBe(false);
  });
});

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
