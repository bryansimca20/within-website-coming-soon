"use client";

import { useCallback, useEffect, useState } from "react";

import type { ICourierOption } from "@/services/biteship.service";

import { formatRupiah, SAMPLE_COPY } from "./utils/sample-copy";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { shipping } = SAMPLE_COPY;

interface SampleStepShippingProps extends ISampleStepProps {
  /** Takes the visitor back to step 2 to change the address. */
  onBack: () => void;
}

type RatesState = { kind: "loading" } | { kind: "ready"; options: ICourierOption[] } | { kind: "failed" };

async function fetchRates(areaId: string): Promise<RatesState> {
  try {
    const response = await fetch("/api/sample/rates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ areaId }),
    });
    if (!response.ok) return { kind: "failed" };
    const payload: { options?: ICourierOption[] } = await response.json();
    return { kind: "ready", options: payload.options ?? [] };
  } catch {
    return { kind: "failed" };
  }
}

function choose(option: ICourierOption) {
  return {
    courierCompany: option.courierCompany,
    courierType: option.courierType,
    courierServiceName: `${option.courierName} ${option.serviceName}`,
    shippingFee: String(option.price),
    shippingEta: option.etaLabel,
  };
}

/** Step 3: live courier prices for the chosen area, cheapest first and preselected. */
export function SampleStepShipping({ values, errors, onChange, onBack }: SampleStepShippingProps) {
  const [rates, setRates] = useState<RatesState>({ kind: "loading" });
  const { areaId, courierCompany, courierType } = values;
  const selectedKey = `${courierCompany}:${courierType}`;

  /** Applies a fetched quote list and keeps the choice valid: the cheapest when nothing offered is picked. */
  const apply = useCallback(
    (next: RatesState) => {
      setRates(next);
      if (next.kind !== "ready" || next.options.length === 0) return;
      const stillOffered = next.options.some((option) => `${option.courierCompany}:${option.courierType}` === selectedKey);
      if (!stillOffered) onChange(choose(next.options[0]));
    },
    [onChange, selectedKey]
  );

  useEffect(() => {
    let isActive = true;
    void fetchRates(areaId).then((next) => {
      if (isActive) apply(next);
    });
    return () => {
      isActive = false;
    };
    // Re-quote only when the area changes; picking a courier must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  function retry() {
    setRates({ kind: "loading" });
    void fetchRates(areaId).then(apply);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5 border-b border-brand-mist pb-4 text-[15px] leading-[22px]">
        <span className="text-[13px] leading-[18px] text-brand-muted">{shipping.sendTo}</span>
        <span>{values.fullName}</span>
        <span>{values.addressLine}</span>
        <span className="text-brand-muted">{values.areaName}</span>
      </div>

      {rates.kind === "loading" && <p className="m-0 text-[15px] text-brand-muted" aria-live="polite">{shipping.loading}</p>}

      {rates.kind === "failed" && (
        <div className="flex flex-col items-start gap-2">
          <p role="alert" className="m-0 text-[15px] font-semibold">{shipping.failed}</p>
          <button type="button" onClick={retry} className="h-11 cursor-pointer text-[13px] font-semibold underline">{shipping.retry}</button>
        </div>
      )}

      {rates.kind === "ready" && rates.options.length === 0 && (
        <div className="flex flex-col items-start gap-2">
          <p className="m-0 text-[15px] font-semibold">{shipping.noCourier}</p>
          <button type="button" onClick={onBack} className="h-11 cursor-pointer text-[13px] font-semibold underline">{shipping.changeAddress}</button>
        </div>
      )}

      {rates.kind === "ready" && rates.options.length > 0 && (
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="sr-only">{SAMPLE_COPY.steps[2]}</legend>
          {rates.options.map((option) => {
            const key = `${option.courierCompany}:${option.courierType}`;
            return (
              <label key={key} className="relative flex min-h-14 cursor-pointer items-center justify-between gap-4 border border-brand-ink px-4 py-3 has-checked:bg-brand-ink has-checked:text-brand-mist has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink">
                <input type="radio" name="courier" checked={key === selectedKey} onChange={() => onChange(choose(option))} className="absolute size-px opacity-0" />
                <span className="flex flex-col">
                  <span className="text-[15px] leading-5 font-semibold">{option.courierName} {option.serviceName}</span>
                  <span className="text-[13px] leading-[18px] opacity-70">{option.etaLabel}</span>
                </span>
                <span className="text-[15px] font-semibold tabular-nums">{formatRupiah(option.price)}</span>
              </label>
            );
          })}
          {errors.courierCompany !== undefined && <p role="alert" className="m-0 text-[13px] font-semibold">{errors.courierCompany}</p>}
        </fieldset>
      )}
    </div>
  );
}
