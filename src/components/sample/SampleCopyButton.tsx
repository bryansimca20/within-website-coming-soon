"use client";

import { useEffect, useState } from "react";

import { SAMPLE_COPY } from "./utils/sample-copy";

const { transfer } = SAMPLE_COPY;

/** How long "Copied" stays before the button reads "Copy" again. */
const COPIED_MS = 2000;

interface SampleCopyButtonProps {
  /** Exactly what lands on the clipboard, which may differ from what is shown ("17500" for "Rp 17.500"). */
  value: string;
  /** What is copied, for screen readers: "Account number". */
  what: string;
}

/** A text button that copies one value for a bank app. If the clipboard is blocked, the value stays on screen to copy by hand. */
export function SampleCopyButton({ value, what }: SampleCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="flex min-h-11 shrink-0 cursor-pointer items-center px-2 text-[15px] leading-5 font-semibold underline underline-offset-4 transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none"
      >
        {isCopied ? transfer.copied : transfer.copy}
        <span className="sr-only"> {what}</span>
      </button>
      <span aria-live="polite" className="sr-only">{isCopied ? transfer.copiedAnnouncement(what) : ""}</span>
    </>
  );
}
