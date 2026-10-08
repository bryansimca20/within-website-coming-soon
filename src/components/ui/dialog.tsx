"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Dialog root. Base UI supplies the focus trap, Escape to close and focus return. */
const Dialog = DialogPrimitive.Root;

/** Portal that mounts the backdrop and popup at the document root. */
const DialogPortal = DialogPrimitive.Portal;

/** Close control usable inside the popup. */
const DialogClose = DialogPrimitive.Close;

/** Accessible name for the dialog. Type is set by the caller. */
const DialogTitle = DialogPrimitive.Title;

/** Click-to-close backdrop with a fade. The caller sets its fill (ink scrim or white blur). */
function DialogBackdrop({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-40 transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

/** Square, shadowless panel. The caller positions it and sets its surface. */
function DialogPopup({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Popup
      className={cn(
        "fixed z-50 flex flex-col font-brand outline-none transition-[opacity,translate,scale] duration-200 ease-brand data-ending-style:duration-150 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Dialog, DialogPortal, DialogClose, DialogBackdrop, DialogPopup, DialogTitle };
