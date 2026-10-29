"use server";

import { revalidatePath } from "next/cache";

import type { BatchPhaseResult, BatchSettingsState, CreateBatchState } from "@/app/utils/admin-state";
import { db } from "@/db/client";
import { sampleBatchPhaseEnum } from "@/db/schema";
import { rememberAdminBatch } from "@/lib/admin-batch";
import { requireAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";

/** Switches the batch every admin page shows. Unknown ids are ignored. */
export async function selectBatchAction(batchId: string): Promise<void> {
  await requireAdmin();
  if ((await SampleBatchService.findById(db, batchId)) === null) {
    return;
  }
  await rememberAdminBatch(batchId);
  revalidatePath("/admin", "layout");
}

/** Creates the next numbered batch as coming soon and switches admin to it. Only capacity is asked for. */
export async function createBatchAction(_previous: CreateBatchState, formData: FormData): Promise<CreateBatchState> {
  await requireAdmin();
  const capacity = Number(formData.get("capacity"));
  const result = await SampleBatchService.create(db, capacity, new Date());
  if (!result.ok) {
    return { error: result.message };
  }
  await rememberAdminBatch(result.batch.id);
  revalidatePath("/admin", "layout");

  return { createdLabel: result.batch.label };
}

/** Changes a batch's capacity. Lowering it below the claimed count is allowed; a closed batch is refused. */
export async function saveBatchCapacityAction(_previous: BatchSettingsState, formData: FormData): Promise<BatchSettingsState> {
  await requireAdmin();
  const batchId = String(formData.get("batchId") ?? "");
  const result = await SampleBatchService.setCapacity(db, batchId, Number(formData.get("capacity")));
  if (!result.ok) {
    return { error: result.message };
  }
  revalidatePath("/admin", "layout");

  return { saved: true };
}

/** Changes what /sample shows for a batch, after the founder confirmed it. Opening is refused while another batch is open. */
export async function setBatchPhaseAction(batchId: string, phaseValue: string): Promise<BatchPhaseResult> {
  await requireAdmin();
  const phase = sampleBatchPhaseEnum.enumValues.find((value) => value === phaseValue);
  if (phase === undefined) {
    return { ok: false, message: "Unknown status." };
  }
  const result = await SampleBatchService.setPhase(db, batchId, phase);
  revalidatePath("/admin", "layout");

  return result;
}

/** Removes a batch with no requests, after the founder confirmed it. */
export async function removeBatchAction(batchId: string): Promise<BatchPhaseResult> {
  await requireAdmin();
  const result = await SampleBatchService.remove(db, batchId);
  revalidatePath("/admin", "layout");

  return result;
}
