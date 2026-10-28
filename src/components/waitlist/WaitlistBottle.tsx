"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { WAITLIST_COPY } from "./utils/waitlist-copy";

/**
 * The free bottle, turning slowly. three.js only loads once this mounts (the sheet opening), and the
 * still render holds the spot until the first printed frame, or for good when WebGL is off.
 */
export function WaitlistBottle({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null) {
      return;
    }

    let scene: { dispose: () => void } | undefined;
    let isCancelled = false;
    import("./utils/bottle-scene.js")
      .then(({ createBottleScene }) => {
        if (isCancelled) {
          return;
        }
        scene = createBottleScene(stage, {
          lean: 0,
          logos: { mark: "/waitlist/bottle-mark.webp", word: "/waitlist/bottle-word.webp" },
          onReady: () => setIsReady(true),
        });
      })
      // No WebGL or the chunk failed to load: the still render stays.
      .catch(() => {});

    return () => {
      isCancelled = true;
      scene?.dispose();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Image
        src="/waitlist/bottle-still.webp"
        alt={WAITLIST_COPY.sheet.offer.bottleAlt}
        width={840}
        height={1280}
        className={cn(
          "absolute inset-0 size-full object-contain transition-opacity duration-500 ease-brand",
          isReady && "opacity-0",
        )}
      />
      <div
        ref={stageRef}
        aria-hidden
        className={cn(
          "absolute inset-0 cursor-grab touch-pan-y opacity-0 transition-opacity duration-500 ease-brand select-none data-dragging:cursor-grabbing",
          isReady && "opacity-100",
        )}
      />
    </div>
  );
}
