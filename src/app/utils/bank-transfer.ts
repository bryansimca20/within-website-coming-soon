/** Where a bank-transfer sampler sends the courier fee, and where they send the proof. */
export interface IBankTransferDetails {
  bankName: string;
  accountHolder: string;
  /** Shown and copied exactly as typed, so it pastes straight into a bank app. */
  accountNumber: string;
  /** Receives the transfer proofs. Empty until the founder supplies it; no batch can switch to bank transfer before then. */
  whatsappNumber: string;
}

/**
 * The account and WhatsApp number for this deployment, from server-only env vars, so staging can use a test number.
 * Not secret (every sampler sees them), but only server code calls this. A missing value reads as empty.
 */
export function readBankTransferDetails(env: Partial<Record<string, string>> = process.env): IBankTransferDetails {
  return {
    bankName: env.BANK_NAME?.trim() ?? "",
    accountHolder: env.BANK_ACCOUNT_HOLDER?.trim() ?? "",
    accountNumber: env.BANK_ACCOUNT_NUMBER?.trim() ?? "",
    whatsappNumber: env.WHATSAPP_NUMBER?.trim() ?? "",
  };
}

/** The promise on the page and in the email: a reported transfer is confirmed within this many hours. */
export const CONFIRM_WITHIN_HOURS = 24;

/** Whether every detail a sampler needs is filled in, so a batch may switch to bank transfer. */
export function isBankTransferReady(details: IBankTransferDetails): boolean {
  return [details.bankName, details.accountHolder, details.accountNumber, details.whatsappNumber].every((value) => value.trim() !== "");
}

/**
 * A `wa.me` link to an Indonesian number in any local format (`0812…`, `+62 812…`, `62812…`), with an optional
 * prefilled message. Null when there is no number to link to.
 */
export function whatsappUrl(phone: string, message?: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits === "") return null;
  const international = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;

  return message === undefined ? `https://wa.me/${international}` : `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}
