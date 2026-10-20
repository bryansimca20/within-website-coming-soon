import "server-only";

import { createHash } from "node:crypto";

import type { SamplePaymentStatus } from "@/db/schema";
import { requireEnv } from "@/lib/env";

/** Which Midtrans environment both the API and snap.js point at. */
export type MidtransEnvironment = "sandbox" | "production";

/** What the server needs to open one Snap transaction for the courier fee. */
export interface ISnapTransactionInput {
  orderId: string;
  grossAmount: number;
  expiryMinutes: number;
  itemName: string;
  finishUrl: string;
  customer: {
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

/** The Snap token the browser pays with, and the hosted page for when snap.js is unavailable. */
export interface ISnapTransaction {
  token: string;
  redirectUrl: string;
}

/** The fields of a Midtrans HTTP notification this system reads. Strings, as Midtrans sends them. */
export interface IMidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  transaction_time?: string;
  settlement_time?: string;
  signature_key: string;
}

/** What a notification means for the request: paid, still open, this attempt is over, or nothing. */
export enum PaymentSignal {
  Paid = "paid",
  Pending = "pending",
  Lapsed = "lapsed",
  Ignore = "ignore",
}

/** QRIS and the two wallets. Virtual accounts carry a flat fee that is absurd on a courier charge. */
export const MIDTRANS_ENABLED_PAYMENTS = ["other_qris", "gopay", "shopeepay"] as const;

const KNOWN_STATUSES: SamplePaymentStatus[] = ["pending", "settlement", "expire", "cancel", "deny"];

const HOSTS: Record<MidtransEnvironment, { app: string; api: string }> = {
  sandbox: { app: "https://app.sandbox.midtrans.com", api: "https://api.sandbox.midtrans.com" },
  production: { app: "https://app.midtrans.com", api: "https://api.midtrans.com" },
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function optionalString(value: unknown): string | undefined {
  return isString(value) ? value : undefined;
}

/** Midtrans Snap: creating transactions, checking notifications, reading status. */
export class MidtransService {
  /** Reads the environment flag; anything but `production` is sandbox. */
  static environment(): MidtransEnvironment {
    return process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production" ? "production" : "sandbox";
  }

  /** The snap.js the browser loads, per environment. */
  static snapScriptUrl(environment: MidtransEnvironment): string {
    return `${HOSTS[environment].app}/snap/snap.js`;
  }

  /** The Snap create-transaction body. One item: the courier service, at the full amount. */
  static buildSnapPayload(input: ISnapTransactionInput): Record<string, unknown> {
    const { customer } = input;
    const name = { first_name: customer.firstName, ...(customer.lastName === null ? {} : { last_name: customer.lastName }) };

    return {
      transaction_details: { order_id: input.orderId, gross_amount: input.grossAmount },
      item_details: [{ id: "shipping", price: input.grossAmount, quantity: 1, name: input.itemName }],
      customer_details: {
        ...name,
        email: customer.email,
        phone: customer.phone,
        shipping_address: {
          ...name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postal_code: customer.postalCode,
          country_code: "IDN",
        },
      },
      enabled_payments: [...MIDTRANS_ENABLED_PAYMENTS],
      expiry: { unit: "minutes", duration: input.expiryMinutes },
      callbacks: { finish: input.finishUrl },
    };
  }

  /** Midtrans's documented formula: SHA512 over order id, status code, gross amount and the server key. */
  static computeSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
    return createHash("sha512").update(orderId + statusCode + grossAmount + serverKey).digest("hex");
  }

  /** True only when the notification's signature matches what our server key produces. */
  static verifyNotification(notification: IMidtransNotification, serverKey: string): boolean {
    const expected = MidtransService.computeSignature(
      notification.order_id,
      notification.status_code,
      notification.gross_amount,
      serverKey
    );

    return expected === notification.signature_key;
  }

  /** Reduces the status pair to what the request should do about it. */
  static interpretNotification(notification: IMidtransNotification): PaymentSignal {
    const status = notification.transaction_status;

    if (status === "settlement") {
      return PaymentSignal.Paid;
    }
    if (status === "capture") {
      return notification.fraud_status === "accept" ? PaymentSignal.Paid : PaymentSignal.Pending;
    }
    if (status === "pending") {
      return PaymentSignal.Pending;
    }
    if (status === "expire" || status === "cancel" || status === "deny") {
      return PaymentSignal.Lapsed;
    }

    return PaymentSignal.Ignore;
  }

  /** The stored attempt status: one of the five we know, otherwise `failure`. */
  static toPaymentStatus(notification: IMidtransNotification): SamplePaymentStatus {
    const status = notification.transaction_status;

    return (KNOWN_STATUSES as string[]).includes(status) ? (status as SamplePaymentStatus) : "failure";
  }

  /** Narrows an unknown JSON body to a notification, or null when the required strings are missing. */
  static parseNotification(body: unknown): IMidtransNotification | null {
    if (typeof body !== "object" || body === null) {
      return null;
    }
    const record = body as Record<string, unknown>;
    const required = [
      record.order_id,
      record.status_code,
      record.gross_amount,
      record.transaction_status,
      record.signature_key,
    ];
    if (!required.every(isString)) {
      return null;
    }

    return {
      order_id: record.order_id as string,
      status_code: record.status_code as string,
      gross_amount: record.gross_amount as string,
      transaction_status: record.transaction_status as string,
      signature_key: record.signature_key as string,
      fraud_status: optionalString(record.fraud_status),
      payment_type: optionalString(record.payment_type),
      transaction_id: optionalString(record.transaction_id),
      transaction_time: optionalString(record.transaction_time),
      settlement_time: optionalString(record.settlement_time),
    };
  }

  /** Basic auth header: the server key as username, empty password. */
  private static authorization(): string {
    return `Basic ${Buffer.from(`${requireEnv("MIDTRANS_SERVER_KEY")}:`).toString("base64")}`;
  }

  /** Opens a Snap transaction. Logs and returns null on any failure; never throws for an HTTP error. */
  static async createSnapTransaction(input: ISnapTransactionInput): Promise<ISnapTransaction | null> {
    try {
      return await MidtransService.requestSnapTransaction(input);
    } catch (error) {
      console.error("[midtrans] snap create threw", error);
      return null;
    }
  }

  private static async requestSnapTransaction(input: ISnapTransactionInput): Promise<ISnapTransaction | null> {
    const response = await fetch(`${HOSTS[MidtransService.environment()].app}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: MidtransService.authorization(),
      },
      body: JSON.stringify(MidtransService.buildSnapPayload(input)),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[midtrans] snap create failed", response.status, await response.text());
      return null;
    }

    const payload: { token?: unknown; redirect_url?: unknown } = await response.json();
    if (!isString(payload.token) || !isString(payload.redirect_url)) {
      console.error("[midtrans] snap create returned an unexpected body", payload);
      return null;
    }

    return { token: payload.token, redirectUrl: payload.redirect_url };
  }

  /** Reads the current status of an order from Midtrans, for admin refreshes. */
  static async fetchStatus(orderId: string): Promise<IMidtransNotification | null> {
    try {
      return await MidtransService.requestStatus(orderId);
    } catch (error) {
      console.error("[midtrans] status fetch threw", error);
      return null;
    }
  }

  private static async requestStatus(orderId: string): Promise<IMidtransNotification | null> {
    const response = await fetch(
      `${HOSTS[MidtransService.environment()].api}/v2/${encodeURIComponent(orderId)}/status`,
      {
        headers: { Accept: "application/json", Authorization: MidtransService.authorization() },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("[midtrans] status fetch failed", response.status, await response.text());
      return null;
    }

    return MidtransService.parseNotification(await response.json());
  }
}
