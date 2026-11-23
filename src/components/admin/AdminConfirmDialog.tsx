"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogPopup, DialogPortal, DialogTitle } from "@/components/ui/dialog";

interface AdminConfirmDialogProps {
  open: boolean;
  /** Ignored while saving, so a running action can't be dismissed halfway. */
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  savingLabel: string;
  isSaving: boolean;
  /** A refusal from the action, shown above the buttons; it disables Confirm until the popup is reopened. */
  error: string | null;
  onConfirm: () => void;
  isDestructive?: boolean;
  /** Extra fields between the body and the buttons, such as a note. */
  children?: ReactNode;
}

/** The admin's confirmation popup: nothing changes until the founder presses the confirm button. */
export function AdminConfirmDialog(props: AdminConfirmDialogProps) {
  const { isSaving, error } = props;

  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!isSaving) props.onOpenChange(open); }}>
      <DialogPortal>
        <DialogBackdrop className="bg-wi-black/40" />
        <DialogPopup className="top-1/2 left-1/2 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-5 text-wi-ink-700 shadow-[var(--wi-shadow-lg)] data-ending-style:opacity-0 data-starting-style:opacity-0">
          <DialogTitle className="m-0 text-h3 font-medium text-wi-black">{props.title}</DialogTitle>
          <p className="m-0 text-sm leading-relaxed">{props.body}</p>
          {props.children}
          {error !== null && <p role="alert" className="m-0 text-sm font-medium text-wi-error">{error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button type="button" size="sm" variant="ghost" disabled={isSaving} />}>Cancel</DialogClose>
            <Button type="button" size="sm" variant={props.isDestructive ? "destructive" : "default"} onClick={props.onConfirm} disabled={isSaving || error !== null}>
              {isSaving ? props.savingLabel : props.confirmLabel}
            </Button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
