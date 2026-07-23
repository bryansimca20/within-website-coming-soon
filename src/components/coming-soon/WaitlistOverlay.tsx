"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerDescription,
  DrawerPopup,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from "@/components/ui/drawer";

import { SignupForm } from "./SignupForm";

/** Viewport at or above which the overlay is a centered Dialog rather than a bottom Drawer. */
const DESKTOP_QUERY = "(min-width: 768px)";
const OVERLAY_TITLE = "Get the launch 10% discount";
const OVERLAY_SUBTITLE = "One email when we launch.";

/** Signup entry point: a button that opens the form as a Dialog on desktop and a Drawer on mobile. */
interface WaitlistOverlayProps {
  /** Trigger button styling. `inverse` for black surfaces (the hero and footer). */
  tone?: "default" | "inverse";
  className?: string;
}

/** Trigger button + responsive overlay wrapping one shared SignupForm. */
export function WaitlistOverlay({ tone = "inverse", className }: WaitlistOverlayProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const trigger = (
    <Button variant={tone === "inverse" ? "inverse" : "default"} className={className}>
      Join the list
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger render={trigger} />
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <DialogTitle>{OVERLAY_TITLE}</DialogTitle>
            <DialogDescription>{OVERLAY_SUBTITLE}</DialogDescription>
            <SignupForm tone="default" />
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    );
  }

  return (
    <Drawer swipeDirection="down">
      <DrawerTrigger render={trigger} />
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-wi-line" />
            <DrawerContent>
              <DrawerTitle>{OVERLAY_TITLE}</DrawerTitle>
              <DrawerDescription>{OVERLAY_SUBTITLE}</DrawerDescription>
              <SignupForm tone="default" />
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </Drawer>
  );
}
