import type { ChangeEvent, InputHTMLAttributes } from "react";

interface WaitlistFieldProps {
  /** Input id; the label points at it. */
  id: string;
  /** Form field name, as the Server Action reads it. */
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Fixed text before the input, such as the "@" on the Instagram field. */
  prefix?: string;
  /** Id of the visible error line, set only while this field is the one in error. */
  errorId?: string;
  /** Native input attributes: type, autocomplete, placeholder and so on. */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

/** One underlined field of the waitlist form. The input is 16px so iOS does not zoom on focus. */
export function WaitlistField({
  id,
  name,
  label,
  value,
  onValueChange,
  prefix,
  errorId,
  inputProps,
}: WaitlistFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value);
  }

  return (
    <div className="flex flex-col gap-0.5 border-b border-brand-muted pt-2 pb-1.5 outline-offset-2 outline-brand-ink has-focus-visible:outline-2 desk:pt-2.5">
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
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          aria-invalid={errorId !== undefined}
          aria-describedby={errorId}
          className="m-0 w-full min-w-0 appearance-none rounded-none border-0 bg-transparent px-0 py-1 text-base leading-6 text-brand-ink outline-none placeholder:text-brand-muted placeholder:opacity-100"
        />
      </div>
    </div>
  );
}
