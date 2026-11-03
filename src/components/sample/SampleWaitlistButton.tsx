"use client";

import { type ReactNode, useRef, useState } from "react";

import { WaitlistJoinedDialog } from "@/components/waitlist/WaitlistJoinedDialog";
import { WaitlistSheet } from "@/components/waitlist/WaitlistSheet";

interface SampleWaitlistButtonProps {
  className?: string;
  children: ReactNode;
}

/** Opens the homepage's waitlist sheet in place, so `/sample` visitors join without leaving the page. */
export function SampleWaitlistButton({ className, children }: SampleWaitlistButtonProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoinedOpen, setIsJoinedOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  /** Before joining the button opens the form; after, it reopens the confirmation. */
  function handleClick() {
    if (isJoined) {
      setIsJoinedOpen(true);
    } else {
      setIsSheetOpen(true);
    }
  }

  function handleJoined(name: string) {
    setFirstName(name);
    setIsJoined(true);
    setIsSheetOpen(false);
    setIsJoinedOpen(true);
  }

  function handleEdit() {
    setIsJoinedOpen(false);
    setIsJoined(false);
    setIsSheetOpen(true);
  }

  return (
    <>
      <button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={handleClick} className={className}>
        {children}
      </button>
      <WaitlistSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} onJoined={handleJoined} triggerRef={triggerRef} />
      <WaitlistJoinedDialog
        isOpen={isJoinedOpen}
        onOpenChange={setIsJoinedOpen}
        firstName={firstName}
        onEdit={handleEdit}
        triggerRef={triggerRef}
      />
    </>
  );
}
