"use client";

import { useRef, useState } from "react";

import { WaitlistCta } from "./WaitlistCta";
import { WaitlistFeatureDialog } from "./WaitlistFeatureDialog";
import { WaitlistHeader } from "./WaitlistHeader";
import { WaitlistJoinedDialog } from "./WaitlistJoinedDialog";
import { WaitlistOrbit } from "./WaitlistOrbit";
import { WaitlistSheet } from "./WaitlistSheet";
import { trackWaitlistEvent, WaitlistEvent } from "./utils/waitlist-analytics";
import { WAITLIST_COPY, WAITLIST_FEATURES, type WaitlistFeatureId } from "./utils/waitlist-copy";

/** The whole coming-soon page: one viewport, no scrolling, whose only job is the waitlist. */
export function WaitlistPage() {
  const [feature, setFeature] = useState(WAITLIST_FEATURES[0]);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoinedOpen, setIsJoinedOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const featureTriggerRef = useRef<HTMLButtonElement | null>(null);
  const ctaRef = useRef<HTMLButtonElement | null>(null);

  function openFeature(id: WaitlistFeatureId, trigger: HTMLButtonElement) {
    const nextFeature = WAITLIST_FEATURES.find((candidate) => candidate.id === id);
    if (nextFeature === undefined) {
      return;
    }

    featureTriggerRef.current = trigger;
    setFeature(nextFeature);
    setIsFeatureOpen(true);
    trackWaitlistEvent(WaitlistEvent.FeatureOpened, { feature: id });
  }

  /** Before joining the button opens the form; after, it reopens the confirmation. */
  function openFromCta(trigger: HTMLButtonElement) {
    ctaRef.current = trigger;
    setIsFeatureOpen(false);
    if (isJoined) {
      setIsJoinedOpen(true);
    } else {
      setIsSheetOpen(true);
    }
    trackWaitlistEvent(WaitlistEvent.CtaClicked);
  }

  /** The sheet leaves and the confirmation lands in the same beat; the button stamps itself behind the scrim. */
  function handleJoined(name: string) {
    setFirstName(name);
    setIsJoined(true);
    setIsSheetOpen(false);
    setIsJoinedOpen(true);
  }

  /** "Edit my details": back to the form with the values intact, and the button back to its resting state. */
  function handleEdit() {
    setIsJoinedOpen(false);
    setIsJoined(false);
    setIsSheetOpen(true);
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-white px-4 pb-4 font-brand text-brand-ink desk:p-0">
      <WaitlistHeader />
      {/* Phone stacks headline, sachet, button. Desktop is two columns, copy centred beside the sachet. */}
      <div className="flex min-h-0 flex-1 flex-col desk:grid desk:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] desk:grid-rows-[1fr_auto_auto_1fr] desk:gap-x-16 desk:px-12 desk:pt-10 desk:pb-12">
        <div className="flex flex-none flex-col gap-2 pt-[18px] pb-1 desk:col-start-1 desk:row-start-2 desk:gap-6 desk:p-0">
          <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em] desk:text-[clamp(40px,min(4.45vw,7.1vh),64px)] desk:leading-none desk:tracking-[-0.03em] [@media(max-height:600px)]:text-[26px] [@media(max-height:600px)]:leading-[30px]">
            {WAITLIST_COPY.headline}
          </h1>
          <p className="m-0 text-sm leading-5 text-pretty desk:text-[17px] desk:leading-7">
            {WAITLIST_COPY.subHeadline}
          </p>
        </div>
        <WaitlistOrbit
          onOpenFeature={openFeature}
          className="mt-2 desk:col-start-2 desk:row-span-4 desk:row-start-1 desk:mt-0"
        />
        <WaitlistCta
          isJoined={isJoined}
          onOpen={openFromCta}
          className="pt-6 desk:col-start-1 desk:row-start-3 desk:max-w-[460px] desk:pt-12"
        />
      </div>
      <WaitlistFeatureDialog
        feature={feature}
        isOpen={isFeatureOpen}
        onOpenChange={setIsFeatureOpen}
        triggerRef={featureTriggerRef}
      />
      <WaitlistSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onJoined={handleJoined}
        triggerRef={ctaRef}
      />
      <WaitlistJoinedDialog
        isOpen={isJoinedOpen}
        onOpenChange={setIsJoinedOpen}
        firstName={firstName}
        onEdit={handleEdit}
        triggerRef={ctaRef}
      />
    </main>
  );
}
