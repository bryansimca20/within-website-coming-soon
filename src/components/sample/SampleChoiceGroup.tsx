import { cn } from "@/lib/utils";

interface SampleChoiceGroupProps<T extends string> {
  /** Field name; also the id prefix for each option. */
  name: string;
  legend: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: string;
  onChange: (value: T) => void;
  error?: string;
  /** Lays the chips out as one row of equal cells, for the 1 to 5 taste scale. */
  isScale?: boolean;
  /** Keeps the legend for screen readers only, when a heading above already asks the question. */
  isLegendHidden?: boolean;
}

/** Single-choice question as chips: native radios, visually hidden, so keyboard and screen readers work as usual. */
export function SampleChoiceGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  isScale = false,
  isLegendHidden = false,
}: SampleChoiceGroupProps<T>) {
  const errorId = `${name}-error`;

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0" aria-describedby={error === undefined ? undefined : errorId}>
      <legend className={cn("mb-2.5 p-0 text-[15px] leading-[22px] font-semibold", isLegendHidden && "sr-only")}>{legend}</legend>
      <div className={cn("flex flex-wrap gap-2", isScale && "grid grid-cols-5")}>
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="relative flex min-h-11 cursor-pointer items-center justify-center border border-brand-ink px-4 text-[15px] leading-5 transition-[background-color,color,transform] duration-150 ease-brand active:scale-[0.97] has-checked:bg-brand-ink has-checked:text-brand-mist has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink motion-reduce:transition-none"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="absolute size-px opacity-0"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {error !== undefined && (
        <p id={errorId} role="alert" className="m-0 text-[13px] leading-[18px] font-semibold text-brand-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
