"use client";

import { useActionState } from "react";

import { saveBatchCapacityAction } from "@/app/actions/admin-batch.action";
import { AdminBatchStatusControl } from "@/components/admin/AdminBatchStatusControl";
import { AdminRemoveBatchButton } from "@/components/admin/AdminRemoveBatchButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SampleBatchPhase } from "@/db/schema";

interface AdminBatchSettingsProps {
  id: string;
  label: string;
  capacity: number;
  phase: SampleBatchPhase;
  /** Every request ever made, expired included. Zero lets the batch be removed. */
  requests: number;
}

/** A batch's header controls: status (through a confirmation popup), capacity (locked once closed), and remove while it is empty. */
export function AdminBatchSettings({ id, label, capacity, phase, requests }: AdminBatchSettingsProps) {
  const [state, action, isPending] = useActionState(saveBatchCapacityAction, null);
  const isClosed = phase === "closed";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-wi-ink-500">
      <AdminBatchStatusControl key={phase} batchId={id} label={label} capacity={capacity} phase={phase} />
      {isClosed ? (
        <span>Capacity <span className="text-wi-black tabular-nums">{capacity}</span></span>
      ) : (
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="batchId" value={id} />
          <label htmlFor={`capacity-${id}`}>Capacity</label>
          <Input key={capacity} id={`capacity-${id}`} name="capacity" type="number" min={1} max={10000} defaultValue={capacity} className="h-8 w-20 bg-wi-paper tabular-nums" />
          <Button type="submit" size="sm" variant="secondary" disabled={isPending}>{isPending ? "Saving" : "Save"}</Button>
          {state !== null && "error" in state && <p role="alert" className="m-0 text-xs text-wi-error">{state.error}</p>}
          {state !== null && "saved" in state && <p role="status" className="m-0 text-xs">Saved.</p>}
        </form>
      )}
      {requests === 0 && phase !== "open" && <AdminRemoveBatchButton batchId={id} label={label} />}
    </div>
  );
}
