"use client";

import { motion } from "motion/react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "./ui/button";
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
import { WithinLogo } from "@/components/brand/WithinLogo";

import { EASE } from "./Reveal";
import { SignupForm } from "./SignupForm";

/** Viewport at or above which the overlay is a centered Dialog rather than a bottom Drawer. */
const DESKTOP_QUERY = "(min-width: 768px)";
const OVERLAY_TITLE = "Get the launch 10% discount";
const OVERLAY_SUBTITLE = "One email when we launch. Unsubscribe anytime.";

/** Orchestrated open: the panel's content cascades in rather than landing all at once. */
const OVERLAY_CONTENT = {
  hidden: {},
  show: { transition: { delayChildren: 0.06, staggerChildren: 0.06 } },
};
const OVERLAY_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

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
          <DialogPopup className="theme-v2 border-wi-on-dark-line bg-wi-black text-wi-paper">
            <motion.div variants={OVERLAY_CONTENT} initial="hidden" animate="show">
              <motion.div variants={OVERLAY_ITEM}>
                <WithinLogo kind="logomark" color="white" height={26} className="mb-5" />
              </motion.div>
              <motion.div variants={OVERLAY_ITEM}>
                <DialogTitle className="text-wi-paper">{OVERLAY_TITLE}</DialogTitle>
              </motion.div>
              <motion.div variants={OVERLAY_ITEM}>
                <DialogDescription className="text-wi-on-dark-3">{OVERLAY_SUBTITLE}</DialogDescription>
              </motion.div>
              <motion.div variants={OVERLAY_ITEM}>
                <SignupForm tone="inverse" />
              </motion.div>
            </motion.div>
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
          <DrawerPopup className="theme-v2 border-wi-on-dark-line bg-wi-black text-wi-paper">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-wi-on-dark-line" />
            <DrawerContent>
              <motion.div variants={OVERLAY_CONTENT} initial="hidden" animate="show">
                <motion.div variants={OVERLAY_ITEM}>
                  <WithinLogo kind="logomark" color="white" height={26} className="mb-5" />
                </motion.div>
                <motion.div variants={OVERLAY_ITEM}>
                  <DrawerTitle className="text-wi-paper">{OVERLAY_TITLE}</DrawerTitle>
                </motion.div>
                <motion.div variants={OVERLAY_ITEM}>
                  <DrawerDescription className="text-wi-on-dark-3">{OVERLAY_SUBTITLE}</DrawerDescription>
                </motion.div>
                <motion.div variants={OVERLAY_ITEM}>
                  <SignupForm tone="inverse" />
                </motion.div>
              </motion.div>
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </Drawer>
  );
}
