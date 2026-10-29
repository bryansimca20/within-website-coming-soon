"use client";

import { useActionState, useState } from "react";

import { createBatchAction } from "@/app/actions/admin-batch.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogPopup, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminNewBatchDialogProps {
  /** The name the new batch will get, such as "Batch 02". */
  nextLabel: string;
  /** Pre-filled capacity: the newest batch's. */
  defaultCapacity: number;
  /** The open batch's label, which blocks creating the next one until it is closed. */
  openLabel: string | null;
}

/** "New batch": the next numbered batch, asking only for capacity. It starts as Coming soon. */
export function AdminNewBatchDialog({ nextLabel, defaultCapacity, openLabel }: AdminNewBatchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action, isPending] = useActionState(async (previous: Parameters<typeof createBatchAction>[0], formData: FormData) => {
    const result = await createBatchAction(previous, formData);
    if (result !== null && "createdLabel" in result) setIsOpen(false);
    return result;
  }, null);

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <Button size="sm" onClick={() => setIsOpen(true)} disabled={openLabel !== null} aria-describedby={openLabel === null ? undefined : "new-batch-blocked"}>New batch</Button>
        {openLabel !== null && <p id="new-batch-blocked" className="m-0 text-xs text-wi-ink-500">Close {openLabel} to create the next batch.</p>}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogBackdrop className="bg-wi-black/40" />
          <DialogPopup className="top-1/2 left-1/2 w-[calc(100vw-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-5 text-wi-ink-700 shadow-[var(--wi-shadow-lg)] data-ending-style:opacity-0 data-starting-style:opacity-0">
            <DialogTitle className="m-0 text-h3 font-medium text-wi-black">New batch: {nextLabel}</DialogTitle>
            <p className="m-0 text-sm">It starts as Coming soon. Open it from the Batches table when you&apos;re ready.</p>
            <form action={action} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-batch-capacity">Capacity</Label>
                <Input id="new-batch-capacity" name="capacity" type="number" min={1} max={10000} defaultValue={defaultCapacity} required />
              </div>
              {state !== null && "error" in state && <p role="alert" className="m-0 text-sm text-wi-error">{state.error}</p>}
              <div className="flex justify-end gap-2">
                <DialogClose render={<Button type="button" size="sm" variant="ghost" />}>Cancel</DialogClose>
                <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Creating" : `Create ${nextLabel}`}</Button>
              </div>
            </form>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </>
  );
}
