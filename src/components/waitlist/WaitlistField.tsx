import type { ChangeEvent, FocusEvent, InputHTMLAttributes, RefObject } from "react";

import { cn } from "@/lib/utils";

interface WaitlistFieldProps {
  /** Input id; the label and the error line both key off it. */
  id: string;
  /** Form field name, as the Server Action reads it. */
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Called with the current value when the visitor leaves the field. */
  onValueBlur: (value: string) => void;
  /** Fixed text before the input, such as the "@" on the Instagram field. */
  prefix?: string;
  /** This field's error, shown directly under it. */
  error?: string;
  /** Lets the sheet put the cursor here when it opens on desktop. */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Native input attributes: type, autocomplete, keyboard hints, placeholder. */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

/** One underlined field of the waitlist form. The input is 16px so iOS does not zoom on focus. */
export function WaitlistField({
  id,
  name,
  label,
  value,
  onValueChange,
  onValueBlur,
  prefix,
  error,
  inputRef,
  inputProps,
}: WaitlistFieldProps) {
  const errorId = `${id}-error`;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    onValueBlur(event.currentTarget.value);
  }

  return (
    <div>
      <div
        className={cn(
          "flex flex-col gap-0.5 border-b pt-2 outline-offset-2 outline-brand-ink has-focus-visible:outline-2 desk:pt-2.5",
          error === undefined ? "border-brand-muted pb-1.5" : "border-b-2 border-brand-error pb-[5px]"
        )}
      >
        <label htmlFor={id} className="text-[13px] leading-[18px] text-brand-muted">
          {label}
        </label>
        <div className="flex items-center gap-0.5">
          {prefix !== undefined && (
            <span aria-hidden className="text-base leading-6 text-brand-muted">
              {prefix}
            </span>
          )}
          <input
            {...inputProps}
            ref={inputRef}
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={error !== undefined}
            aria-describedby={error !== undefined ? errorId : undefined}
            className="m-0 w-full min-w-0 appearance-none rounded-none border-0 bg-transparent px-0 py-1 text-base leading-6 text-brand-ink outline-none placeholder:text-brand-muted placeholder:opacity-100"
          />
        </div>
      </div>
      {error !== undefined && (
        <p id={errorId} role="alert" className="mt-1.5 mb-0 text-[13px] leading-[18px] font-semibold text-brand-error">
          {error}
        </p>
      )}
    </div>
  );
}
