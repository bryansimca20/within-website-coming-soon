import { splitChoices } from "@/app/utils/sample-request-input";
import { cn } from "@/lib/utils";

interface SampleMultiChoiceGroupProps<T extends string> {
  /** Field name; also the id prefix for each option. */
  name: string;
  legend: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  /** The picked option keys, comma-joined, as the form carries them. */
  value: string;
  onChange: (next: string) => void;
  error?: string;
  /** One full-width chip per row, for answers that read as sentences. */
  isStacked?: boolean;
}

/** Pick-all question as chips: native checkboxes, visually hidden, so keyboard and screen readers work as usual. */
export function SampleMultiChoiceGroup<T extends string>({ name, legend, options, value, onChange, error, isStacked = false }: SampleMultiChoiceGroupProps<T>) {
  const errorId = `${name}-error`;
  const picked = splitChoices(value);

  /** Adds or removes one key, keeping the order the options are listed in. */
  function toggle(key: T, isOn: boolean) {
    const next = options.map((option) => option.value).filter((optionKey) => (optionKey === key ? isOn : picked.includes(optionKey)));
    onChange(next.join(","));
  }

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0" aria-describedby={error === undefined ? undefined : errorId}>
      <legend className="mb-2.5 p-0 text-[15px] leading-[22px] font-semibold">{legend}</legend>
      <div className={cn("flex flex-wrap gap-2", isStacked && "flex-col flex-nowrap")}>
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "relative flex min-h-11 cursor-pointer items-center border border-brand-ink px-4 text-[15px] leading-5 transition-[background-color,color,transform] duration-150 ease-brand active:scale-[0.97] has-checked:bg-brand-ink has-checked:text-brand-mist has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink motion-reduce:transition-none",
                isStacked ? "justify-start py-2.5 text-left" : "justify-center"
              )}
            >
              <input
                id={id}
                type="checkbox"
                name={name}
                value={option.value}
                checked={picked.includes(option.value)}
                onChange={(event) => toggle(option.value, event.currentTarget.checked)}
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
