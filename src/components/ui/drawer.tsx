"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Drawer root. Set `swipeDirection="down"` for a bottom sheet. Uncontrolled by default. */
const Drawer = DrawerPrimitive.Root;

/** Button that opens the drawer. Pass `render` to project a styled Button. */
const DrawerTrigger = DrawerPrimitive.Trigger;

/** Portal that mounts the backdrop and popup at the document root. */
const DrawerPortal = DrawerPrimitive.Portal;

/** Close control usable inside the popup. */
const DrawerClose = DrawerPrimitive.Close;

/** Dimmed, swipe-and-tap-to-close backdrop with a fade transition. */
function DrawerBackdrop({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ease-[var(--wi-ease-out)] data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

/** Full-width fixed layer that pins the popup to the bottom of the screen. */
function DrawerViewport({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Viewport>) {
  return (
    <DrawerPrimitive.Viewport
      className={cn("fixed inset-0 z-50 flex items-end justify-center", className)}
      {...props}
    />
  );
}

/** Bottom sheet that slides up. Preserves the swipe transform variable while transitioning. */
function DrawerPopup({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Popup>) {
  return (
    <DrawerPrimitive.Popup
      className={cn(
        "flex max-h-[85vh] w-full max-w-[520px] flex-col overflow-y-auto overscroll-contain rounded-t-[var(--wi-radius-card)] border-t border-wi-line bg-wi-paper px-6 pt-4 pb-8 text-wi-black shadow-[var(--wi-shadow-lg)] outline-none [transform:translateY(var(--drawer-swipe-movement-y,0px))] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)] data-swiping:select-none motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

/** Inner width-capped content wrapper, per the Base UI drawer anatomy. */
function DrawerContent({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Content className={cn("mx-auto w-full max-w-[420px]", className)} {...props} />
  );
}

/** Uppercase brand title. */
function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn("m-0 text-xl font-bold uppercase leading-tight tracking-[0.02em] text-wi-black", className)}
      {...props}
    />
  );
}

/** Muted sub-line under the title. */
function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn("mt-2 mb-6 text-sm leading-[1.5] text-wi-ink-500", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
};
