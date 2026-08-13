"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "@phosphor-icons/react/ssr";

import { EASE } from "./Reveal";
import { Section } from "./Section";
import { FAQS } from "./utils/faqs";

/** One expandable question row: a plus that rotates to a cross, answer height-animates open. */
function FaqRow({
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
        className="group flex w-full cursor-pointer items-center justify-between gap-6 border-none bg-transparent py-5 text-left"
      >
        <span
          className={
            "text-[17px] font-medium tracking-[-0.01em] transition-colors md:text-[19px] " +
            (open ? "text-wi-black" : "text-wi-ink-700 group-hover:text-wi-black")
          }
        >
          {q}
        </span>
        <motion.span
          aria-hidden
          className={
            "grid size-7 shrink-0 place-items-center rounded-[var(--wi-radius-control)] border transition-colors " +
            (open ? "border-wi-signal text-wi-signal" : "border-wi-line text-wi-ink-500")
          }
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <Plus size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="m-0 max-w-[62ch] pb-6 text-[15px] leading-[1.6] text-wi-ink-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Two-column FAQ: a fixed heading beside the accordion of launch questions. */
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section
      surface="paper"
      borderTop
      containerClassName="grid grid-cols-1 gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16"
    >
      <div>
        <h2 className="m-0 text-[clamp(30px,3.6vw,44px)] font-medium leading-[1.02] tracking-[-0.03em] text-wi-black text-balance">
          Questions,
          <br />
          answered plainly.
        </h2>
      </div>
      <div className="border-b border-wi-line">
        {FAQS.map(([q, a], i) => (
          <FaqRow key={q} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </Section>
  );
}
