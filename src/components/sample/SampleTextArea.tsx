"use client";

import type { KeyboardEvent, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SampleTextAreaProps {
  /** Textarea id; the label and the error line both key off it. */
  id: string;
  /** Form field name, as the Server Action reads it. */
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** This field's error, shown directly under it. */
  error?: string;
  /** Lets Enter add a new line. Off by default, so Enter moves on like a one-line field. */
  allowsLineBreaks?: boolean;
  /** Native attributes: placeholder, autocomplete, maxLength. */
  textAreaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
}

/** An underlined free-text field that wraps and grows downward, then scrolls vertically past about six lines. */
export function SampleTextArea({ id, name, label, value, onValueChange, error, allowsLineBreaks = false, textAreaProps }: SampleTextAreaProps) {
  const errorId = `${id}-error`;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (allowsLineBreaks || event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
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
        <textarea
          {...textAreaProps}
          id={id}
          name={name}
          rows={1}
          value={value}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? errorId : undefined}
          className="m-0 block max-h-[152px] min-h-8 w-full field-sizing-content resize-none appearance-none overflow-y-auto overscroll-contain rounded-none border-0 bg-transparent px-0 py-1 text-base leading-6 text-brand-ink outline-none placeholder:text-brand-muted placeholder:opacity-100"
        />
      </div>
      {error !== undefined && (
        <p id={errorId} role="alert" className="mt-1.5 mb-0 text-[13px] leading-[18px] font-semibold text-brand-error">
          {error}
        </p>
      )}
    </div>
  );
}
