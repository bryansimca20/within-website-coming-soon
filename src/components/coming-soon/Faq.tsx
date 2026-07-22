"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { DisplayHeading } from "./DisplayHeading";
import { EASE, Reveal } from "./Reveal";
import { Section } from "./Section";
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
        <span className="font-bold text-base tracking-[0.02em] uppercase text-wi-black transition-opacity duration-200 hover:opacity-60">
          {q}
        </span>
        <motion.span
          className="inline-flex shrink-0 text-wi-ink-500"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <ChevronDown size={20} strokeWidth={2.2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="m-0 pb-6 max-w-[640px] text-[15px] leading-[1.6] text-wi-ink-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Two-column FAQ: heading beside an accordion of the launch's common questions. */
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section
      surface="paperDim"
      containerClassName="grid grid-cols-1 gap-6 md:grid-cols-[0.7fr_1.3fr] md:gap-12"
    >
      <Reveal>
        <DisplayHeading as="h2" className="mt-3 text-[40px]">
          Frequently asked questions
        </DisplayHeading>
      </Reveal>
      <Reveal className="border-b border-wi-line" delay={100}>
        {FAQS.map(([q, a], i) => (
          <FaqItem
            key={q}
            q={q}
            a={a}
            open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
          />
        ))}
      </Reveal>
    </Section>
  );
}
