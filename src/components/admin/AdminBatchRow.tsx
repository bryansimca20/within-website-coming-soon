"use client";

import { useActionState } from "react";

import { saveBatchCapacityAction } from "@/app/actions/admin-batch.action";
import { AdminBatchStatusControl } from "@/components/admin/AdminBatchStatusControl";
import { AdminRemoveBatchButton } from "@/components/admin/AdminRemoveBatchButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { SampleBatchPhase } from "@/db/schema";

/** One batch as the Batches table shows it. */
export interface IAdminBatchRow {
  id: string;
  label: string;
  capacity: number;
  phase: SampleBatchPhase;
  /** Every request ever made, expired included. Zero lets the batch be removed. */
  requests: number;
  claimed: number;
  paid: number;
  shipped: number;
  delivered: number;
  feedback: number;
}

interface AdminBatchRowProps {
  row: IAdminBatchRow;
}

/** One batch: its counts, its status (changed through a confirmation popup) and its capacity (saved on its own, locked once closed). */
export function AdminBatchRow({ row }: AdminBatchRowProps) {
  const [state, action, isPending] = useActionState(saveBatchCapacityAction, null);
  const formId = `batch-${row.id}`;
  const isClosed = row.phase === "closed";

  return (
    <TableRow className="border-wi-line/70 hover:bg-transparent">
      <TableCell className="py-3 font-medium text-wi-black">{row.label}</TableCell>
      <TableCell>
        <AdminBatchStatusControl key={row.phase} batchId={row.id} label={row.label} capacity={row.capacity} phase={row.phase} />
      </TableCell>
      <TableCell>
        {isClosed ? (
          <span className="text-wi-ink-500 tabular-nums">{row.capacity}</span>
        ) : (
          <form id={formId} action={action} className="flex flex-col gap-1">
            <input type="hidden" name="batchId" value={row.id} />
            <label className="sr-only" htmlFor={`${formId}-capacity`}>Capacity of {row.label}</label>
            <Input key={row.capacity} id={`${formId}-capacity`} name="capacity" type="number" min={1} max={10000} defaultValue={row.capacity} className="h-8 w-24 bg-wi-paper tabular-nums" />
            {state !== null && "error" in state && <p role="alert" className="m-0 text-xs text-wi-error">{state.error}</p>}
            {state !== null && "saved" in state && <p role="status" className="m-0 text-xs text-wi-ink-500">Saved.</p>}
          </form>
        )}
      </TableCell>
      <TableCell className="text-wi-black tabular-nums">{row.claimed} / {row.capacity}</TableCell>
      <TableCell className="text-wi-black tabular-nums">{row.paid}</TableCell>
      <TableCell className="text-wi-black tabular-nums">{row.shipped}</TableCell>
      <TableCell className="text-wi-black tabular-nums">{row.delivered}</TableCell>
      <TableCell className="text-wi-black tabular-nums">{row.feedback}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {!isClosed && (
            <Button type="submit" form={formId} size="sm" variant="secondary" disabled={isPending}>
              {isPending ? "Saving" : "Save capacity"}
            </Button>
          )}
          {row.requests === 0 && row.phase !== "open" && <AdminRemoveBatchButton batchId={row.id} label={row.label} />}
        </div>
      </TableCell>
    </TableRow>
  );
}
