"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { AdminActionResult, ShipRunState } from "@/app/utils/admin-state";
import { db } from "@/db/client";
import { sampleRequests } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-session";
import { BiteshipService } from "@/services/biteship.service";
import { SampleAdminDataService } from "@/services/sample-admin-data.service";
import { dispatchPaidEmail, dispatchShipmentEmail } from "@/services/sample-email-dispatch.service";
import { SampleNotifier } from "@/services/sample-notifier.service";
import { SamplePaymentService } from "@/services/sample-payment.service";
import { SampleEmailKind } from "@/services/sample-email-templates";
import { SampleRequestService } from "@/services/sample-request.service";
import { SampleShipmentService } from "@/services/sample-shipment.service";
import { SampleTransferService } from "@/services/sample-transfer.service";

const REJECT_NOTE_MAX = 500;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

/** Every admin page shows shipment state now (overview, batch pages, sidebar counts), so refresh them all. */
function revalidate() {
  revalidatePath("/admin", "layout");
}

/** Books one Biteship order per selected paid request. */
export async function bookShipRunAction(_previous: ShipRunState, formData: FormData): Promise<ShipRunState> {
  await requireAdmin();
  const requestIds = formData.getAll("requestId").filter((value): value is string => typeof value === "string");
  const deliveryType = formData.get("deliveryType") === "scheduled" ? "scheduled" : "now";
  const deliveryDate = String(formData.get("deliveryDate") ?? "");
  const deliveryTime = String(formData.get("deliveryTime") ?? "");

  if (requestIds.length === 0) {
    return { error: "Select at least one box." };
  }
  if (deliveryType === "scheduled" && (!DATE_PATTERN.test(deliveryDate) || !TIME_PATTERN.test(deliveryTime))) {
    return { error: "Pick a pickup date and time." };
  }

  try {
    const results = await SampleShipmentService.bookRun(
      db,
      {
        requestIds,
        deliveryType,
        deliveryDate: deliveryType === "scheduled" ? deliveryDate : null,
        deliveryTime: deliveryType === "scheduled" ? deliveryTime : null,
      },
      new Date()
    );
    revalidate();
    return { results };
  } catch (error) {
    console.error("[admin] ship run failed", error);
    return { error: "Ship run failed. Check the logs." };
  }
}

/** Re-reads one shipment from Biteship and applies it; sends any email now due. */
export async function refreshShipmentAction(shipmentId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const shipment = await SampleAdminDataService.shipmentById(db, shipmentId);
  if (shipment === null) {
    return { ok: false, message: "Shipment not found." };
  }
  const order = await BiteshipService.fetchOrder(shipment.biteshipOrderId);
  if (order === null) {
    return { ok: false, message: "Biteship did not return the order." };
  }
  const now = new Date();
  const { shipment: current, dueEmail } = await SampleShipmentService.applyOrderSnapshot(db, shipment, order, now);
  if (dueEmail !== null) {
    await dispatchShipmentEmail(db, current, dueEmail, now);
  }
  revalidate();
  return { ok: true, message: `Status: ${order.status}.` };
}

/** Sends one of the sampler emails again. Payment instructions go only to an unpaid bank-transfer request. */
export async function resendSampleEmailAction(requestId: string, kind: SampleEmailKind): Promise<AdminActionResult> {
  await requireAdmin();
  const request = await SampleRequestService.findById(db, requestId);
  if (request === null) {
    return { ok: false, message: "Request not found." };
  }
  if (kind === SampleEmailKind.PaymentInstructions) {
    if (request.paymentCode === null) {
      return { ok: false, message: "This request isn't paid by bank transfer." };
    }
    if (request.status !== "pending_payment" && request.status !== "awaiting_confirmation") {
      return { ok: false, message: "This request is no longer waiting for payment." };
    }
  }
  const batch = await SampleRequestService.findBatch(db, request.batchId);
  if (request.batchId !== null && batch === null) {
    return { ok: false, message: "Batch not found." };
  }
  const shipment = await SampleShipmentService.latestForRequest(db, requestId);
  if ((kind === SampleEmailKind.Shipped || kind === SampleEmailKind.Delivered) && shipment === null) {
    return { ok: false, message: "No shipment yet." };
  }
  const sent = await SampleNotifier.sendKind(kind, request, batch, shipment);

  return sent ? { ok: true, message: "Sent." } : { ok: false, message: "Resend refused it. Check the logs." };
}

/** A founder saw the bank transfer arrive: pays the box, then sends the paid email once. */
export async function confirmTransferAction(requestId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const now = new Date();
  const result = await SampleTransferService.confirm(db, requestId, now);
  if (result.kind === "paid") {
    const batch = await SampleRequestService.findBatch(db, result.request.batchId);
    if (batch !== null) {
      await dispatchPaidEmail(db, result.request, batch, now);
    }
  }
  revalidate();

  if (result.kind === "paid") return { ok: true, message: "Confirmed. The paid email is on its way." };
  if (result.kind === "repeat") return { ok: true, message: "Already confirmed." };
  if (result.kind === "refund") return { ok: false, message: "Not confirmed: this needs a refund. See the note." };
  return { ok: false, message: result.message };
}

/** A founder found no bank transfer: the box goes back to the batch, and the request keeps the reason and the note. */
export async function rejectTransferAction(requestId: string, note: string): Promise<AdminActionResult> {
  await requireAdmin();
  const result = await SampleTransferService.reject(db, requestId, typeof note === "string" ? note.trim().slice(0, REJECT_NOTE_MAX) : "");
  revalidate();

  return result.ok ? { ok: true, message: "Rejected. The box is back in the batch." } : { ok: false, message: result.message };
}

/** Marks a request cancelled with a note and stops its open payment. Refunds happen in the Midtrans dashboard. */
export async function cancelRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  await SampleRequestService.setStatus(db, requestId, "cancelled", { adminNote: note === "" ? "Cancelled by a founder." : note });
  await SamplePaymentService.cancelForRequest(db, requestId, new Date());
  revalidate();
}

/** Saves the free-text founder note on a request. */
export async function saveAdminNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  await db.update(sampleRequests).set({ adminNote: note === "" ? null : note }).where(eq(sampleRequests.id, requestId));
  revalidate();
}

/** Flags a request as a test order, or back to a real one. Test orders are left out of capacity, stats and exports. */
export async function setTestRequestAction(requestId: string, isTest: boolean): Promise<void> {
  await requireAdmin();
  await SampleRequestService.setTest(db, z.string().uuid().parse(requestId), z.boolean().parse(isTest));
  revalidate();
}
