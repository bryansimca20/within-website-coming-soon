import type { IShipRunResult } from "@/services/sample-shipment.service";

/** Login form state: nothing yet, a wrong passcode, or too many tries. */
export type AdminLoginState = { error: "wrong" | "rate" } | null;

/** Ship-run form state: the per-row results of the last run, or a form error. */
export type ShipRunState = { results: IShipRunResult[] } | { error: string } | null;

/** Generic result of a one-button admin action. */
export type AdminActionResult = { ok: true; message: string } | { ok: false; message: string };
