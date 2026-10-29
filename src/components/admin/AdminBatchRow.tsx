"use client";

import { useActionState } from "react";

import { saveBatchCapacityAction } from "@/app/actions/admin-batch.action";
import { AdminBatchStatusControl } from "@/components/admin/AdminBatchStatusControl";
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
  claimed: number;
  paid: number;
  shipped: number;
  delivered: number;
  feedback: number;
}

interface AdminBatchRowProps {
  row: IAdminBatchRow;
}

/** One batch: its counts, its status (changed through a confirmation popup) and its capacity (saved on its own). */
export function AdminBatchRow({ row }: AdminBatchRowProps) {
  const [state, action, isPending] = useActionState(saveBatchCapacityAction, null);
  const formId = `batch-${row.id}`;

  return (
    <TableRow>
      <TableCell className="font-semibold text-wi-black">{row.label}</TableCell>
      <TableCell>
        <AdminBatchStatusControl key={row.phase} batchId={row.id} label={row.label} capacity={row.capacity} phase={row.phase} />
      </TableCell>
      <TableCell>
        <form id={formId} action={action} className="flex flex-col gap-1">
          <input type="hidden" name="batchId" value={row.id} />
          <label className="sr-only" htmlFor={`${formId}-capacity`}>Capacity of {row.label}</label>
          <Input key={row.capacity} id={`${formId}-capacity`} name="capacity" type="number" min={1} max={10000} defaultValue={row.capacity} className="h-8 w-24" />
          {state !== null && "error" in state && <p role="alert" className="m-0 text-xs text-wi-error">{state.error}</p>}
          {state !== null && "saved" in state && <p role="status" className="m-0 text-xs text-wi-ink-500">Saved.</p>}
        </form>
      </TableCell>
      <TableCell className="wi-readout">{row.claimed} / {row.capacity}</TableCell>
      <TableCell className="wi-readout">{row.paid}</TableCell>
      <TableCell className="wi-readout">{row.shipped}</TableCell>
      <TableCell className="wi-readout">{row.delivered}</TableCell>
      <TableCell className="wi-readout">{row.feedback}</TableCell>
      <TableCell>
        <Button type="submit" form={formId} size="sm" variant="secondary" disabled={isPending}>
          {isPending ? "Saving" : "Save capacity"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
