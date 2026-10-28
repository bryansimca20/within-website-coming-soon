"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { AdminActionResult, ShipRunState } from "@/app/utils/admin-state";
import { db } from "@/db/client";
import { sampleBatches, sampleBatchPhaseEnum, sampleRequests } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-session";
import { BiteshipService } from "@/services/biteship.service";
import { SampleAdminDataService } from "@/services/sample-admin-data.service";
import { dispatchShipmentEmail } from "@/services/sample-email-dispatch.service";
import { SampleNotifier } from "@/services/sample-notifier.service";
import { SampleEmailKind } from "@/services/sample-email-templates";
import { SampleRequestService } from "@/services/sample-request.service";
import { SampleShipmentService } from "@/services/sample-shipment.service";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function revalidate(requestId?: string) {
  revalidatePath("/admin/sample");
  if (requestId !== undefined) {
    revalidatePath(`/admin/sample/${requestId}`);
  }
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
    return { error: error instanceof Error ? error.message : "Ship run failed." };
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
  revalidate(current.requestId);
  return { ok: true, message: `Status: ${order.status}.` };
}

/** Sends one of the four emails again. */
export async function resendSampleEmailAction(requestId: string, kind: SampleEmailKind): Promise<AdminActionResult> {
  await requireAdmin();
  const request = await SampleRequestService.findById(db, requestId);
  if (request === null) {
    return { ok: false, message: "Request not found." };
  }
  const [batch] = await db.select().from(sampleBatches).where(eq(sampleBatches.id, request.batchId));
  if (batch === undefined) {
    return { ok: false, message: "Batch not found." };
  }
  const shipment = await SampleShipmentService.latestForRequest(db, requestId);
  if ((kind === SampleEmailKind.Shipped || kind === SampleEmailKind.Delivered) && shipment === null) {
    return { ok: false, message: "No shipment yet." };
  }
  const sent = await SampleNotifier.sendKind(kind, request, batch, shipment);

  return sent ? { ok: true, message: "Sent." } : { ok: false, message: "Resend refused it. Check the logs." };
}

/** Marks a request cancelled with a note. Refunds happen in the Midtrans dashboard. */
export async function cancelRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  await SampleRequestService.setStatus(db, requestId, "cancelled", { adminNote: note === "" ? "Cancelled by a founder." : note });
  revalidate(requestId);
}

/** Saves the free-text founder note on a request. */
export async function saveAdminNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  await db.update(sampleRequests).set({ adminNote: note === "" ? null : note }).where(eq(sampleRequests.id, requestId));
  revalidate(requestId);
}

/** Changes the batch capacity or opens and closes it. */
export async function updateBatchAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const batchId = String(formData.get("batchId") ?? "");
  const capacity = Number(formData.get("capacity"));
  const phaseValue = formData.get("phase");
  const phase = sampleBatchPhaseEnum.enumValues.find((value) => value === phaseValue);
  await SampleRequestService.updateBatch(db, batchId, {
    ...(phase === undefined ? {} : { phase }),
    ...(Number.isInteger(capacity) && capacity > 0 && capacity <= 10_000 ? { capacity } : {}),
  });
  revalidate();
}
