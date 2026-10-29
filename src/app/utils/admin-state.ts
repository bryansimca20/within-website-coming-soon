import type { IShipRunResult } from "@/services/sample-shipment.service";

/** Login form state: nothing yet, a wrong passcode, or too many tries. */
export type AdminLoginState = { error: "wrong" | "rate" } | null;

/** Ship-run form state: the per-row results of the last run, or a form error. */
export type ShipRunState = { results: IShipRunResult[] } | { error: string } | null;

/** Generic result of a one-button admin action. */
export type AdminActionResult = { ok: true; message: string } | { ok: false; message: string };

/** New-batch dialog state: an error to show, or the batch just created. */
export type CreateBatchState = { error: string } | { createdLabel: string } | null;

/** A batch row's save: an error to show beside the row, a confirmation, or nothing yet. */
export type BatchSettingsState = { error: string } | { saved: true } | null;

/** A batch status change from the confirmation popup: the refusal to show, or done. */
export type BatchPhaseResult = { ok: true } | { ok: false; message: string };
