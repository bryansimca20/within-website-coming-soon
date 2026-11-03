import type { ReactNode } from "react";

import { WaitlistCheckGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";
import { cn } from "@/lib/utils";

interface SampleCheckboxProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  /** A muted line under the sentence, for why it matters. */
  description?: string;
  children: ReactNode;
}

/** A square ink checkbox with its sentence. Ticking fills the box and draws the check on. */
export function SampleCheckbox({ name, checked, onChange, error, description, children }: SampleCheckboxProps) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label className="group flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[15px] leading-[22px]">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
          aria-invalid={error !== undefined}
          aria-describedby={error === undefined ? undefined : errorId}
          className="absolute size-px opacity-0"
        />
        <span
          aria-hidden
          className={cn(
            "mt-px flex size-[22px] flex-none items-center justify-center border-[1.5px] bg-white text-brand-mist transition-[background-color,border-color,transform] duration-150 ease-brand group-active:scale-[0.92] group-has-checked:border-brand-ink group-has-checked:bg-brand-ink group-has-focus-visible:outline-2 group-has-focus-visible:outline-offset-2 group-has-focus-visible:outline-brand-ink motion-reduce:transition-none [@media(hover:hover)]:group-hover:bg-brand-mist [@media(hover:hover)]:group-hover:group-has-checked:bg-brand-ink",
            error === undefined ? "border-brand-ink" : "border-brand-error"
          )}
        >
          <WaitlistCheckGlyph
            className="size-4"
            pathClassName="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-200 ease-brand group-has-checked:[stroke-dashoffset:0] motion-reduce:transition-none"
          />
        </span>
        <span className="flex flex-col gap-0.5">
          <span>{children}</span>
          {description !== undefined && <span className="text-[13px] leading-[18px] text-brand-muted">{description}</span>}
        </span>
      </label>
      {error !== undefined && (
        <p id={errorId} role="alert" className="mt-1 mb-0 pl-[34px] text-[13px] leading-[18px] font-semibold text-brand-error">
          {error}
        </p>
      )}
    </div>
  );
}
