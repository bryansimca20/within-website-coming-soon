"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { DisplayHeading } from "./DisplayHeading";
import { FAQS } from "./utils/faqs";

/** One expandable question row. */
function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-wi-line">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-[22px] bg-transparent border-none cursor-pointer text-left"
      >
        <span className="font-bold text-base tracking-[0.02em] uppercase text-wi-black">
          {q}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 text-wi-ink-500 transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)]",
            open && "rotate-180"
          )}
        >
          <ChevronDown size={20} strokeWidth={2.2} />
        </span>
      </button>
      {open && (
        <p className="m-0 pb-6 max-w-[640px] text-[15px] leading-[1.6] text-wi-ink-500">
          {a}
        </p>
      )}
    </div>
  );
}

/** Two-column FAQ: heading beside an accordion of the launch's common questions. */
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-wi-paper-dim">
      <div className="wi-faq max-w-[1200px] mx-auto grid grid-cols-[0.7fr_1.3fr] gap-12 px-7 py-20">
        <div>
          <DisplayHeading as="h2" className="mt-3 text-[40px]">
            Frequently asked questions
          </DisplayHeading>
        </div>
        <div className="border-b border-wi-line">
          {FAQS.map(([q, a], i) => (
            <FaqItem
              key={q}
              q={q}
              a={a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
