"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Dialog root. Uncontrolled by default; the trigger toggles it. */
const Dialog = DialogPrimitive.Root;

/** Button that opens the dialog. Pass `render` to project a styled Button. */
const DialogTrigger = DialogPrimitive.Trigger;

/** Portal that mounts the backdrop and popup at the document root. */
const DialogPortal = DialogPrimitive.Portal;

/** Close control usable inside the popup. */
const DialogClose = DialogPrimitive.Close;

/** Dimmed, click-to-close backdrop with a fade transition. */
function DialogBackdrop({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 ease-[var(--wi-ease-out)] data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

/** Centered paper panel that fades and scales in. */
function DialogPopup({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Popup
      className={cn(
        "fixed left-1/2 top-1/2 z-50 flex w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-7 text-wi-black shadow-[var(--wi-shadow-lg)] outline-none transition-[opacity,transform] duration-200 ease-[var(--wi-ease-out)] data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

/** Uppercase brand title. */
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("m-0 text-xl font-bold uppercase leading-tight tracking-[0.02em] text-wi-black", className)}
      {...props}
    />
  );
}

/** Muted sub-line under the title. */
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-2 mb-6 text-sm leading-[1.5] text-wi-ink-500", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
};
