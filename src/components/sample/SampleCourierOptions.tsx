"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EASE } from "@/components/coming-soon/Reveal";
import type { ICourierOption } from "@/services/biteship.service";

import { formatRupiah, SAMPLE_COPY } from "./utils/sample-copy";
import { sampleDevRates } from "./utils/sample-dev-fixtures";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { shipping } = SAMPLE_COPY;

type RatesState = { kind: "loading" } | { kind: "ready"; options: ICourierOption[] } | { kind: "failed" };

/** Quotes and the area they were fetched for; quotes for any other area count as still loading. */
interface IAreaRates {
  areaId: string;
  rates: RatesState;
}

async function fetchRates(areaId: string): Promise<RatesState> {
  const devRates = sampleDevRates();
  if (devRates !== null) return { kind: "ready", options: devRates };
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

/** Live courier prices for the picked area, cheapest first and preselected. Waits for an area. */
export function SampleCourierOptions({ values, errors, onChange }: ISampleStepProps) {
  const { areaId, courierCompany, courierType } = values;
  const [fetched, setFetched] = useState<IAreaRates>({ areaId: "", rates: { kind: "loading" } });
  const rates: RatesState = fetched.areaId === areaId ? fetched.rates : { kind: "loading" };
  /** The area on screen now, so a late answer for an earlier area is dropped. */
  const latestArea = useRef(areaId);
  const selectedKey = `${courierCompany}:${courierType}`;

  /** Applies a fetched quote list and keeps the choice valid: the cheapest when nothing offered is picked. */
  const apply = useCallback(
    (forArea: string, next: RatesState) => {
      if (forArea !== latestArea.current) return;
      setFetched({ areaId: forArea, rates: next });
      if (next.kind !== "ready" || next.options.length === 0) return;
      const stillOffered = next.options.some((option) => `${option.courierCompany}:${option.courierType}` === selectedKey);
      if (!stillOffered) onChange(choose(next.options[0]));
    },
    [onChange, selectedKey]
  );

  useEffect(() => {
    latestArea.current = areaId;
    if (areaId === "") return;
    let isActive = true;
    void fetchRates(areaId).then((next) => {
      if (isActive) apply(areaId, next);
    });
    return () => {
      isActive = false;
    };
    // Re-quote only when the area changes; picking a courier must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  function retry() {
    setFetched({ areaId: "", rates: { kind: "loading" } });
    void fetchRates(areaId).then((next) => apply(areaId, next));
  }

  if (areaId === "") return <p className="m-0 text-[15px] leading-[22px] text-brand-muted">{shipping.pickArea}</p>;

  if (rates.kind === "loading") {
    return (
      <div className="flex flex-col gap-2">
        <span className="sr-only" aria-live="polite">{shipping.loading}</span>
        {[0, 1, 2].map((row) => (
          <span key={row} aria-hidden className="block min-h-14 bg-brand-mist" />
        ))}
      </div>
    );
  }

  if (rates.kind === "failed") {
    return (
      <div className="flex flex-col items-start gap-2">
        <p role="alert" className="m-0 text-[15px] font-semibold text-brand-error">{shipping.failed}</p>
        <button type="button" onClick={retry} className="h-11 cursor-pointer text-[13px] font-semibold underline">{shipping.retry}</button>
      </div>
    );
  }

  if (rates.options.length === 0) return <p className="m-0 text-[15px] font-semibold">{shipping.noCourier}</p>;

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="sr-only">{SAMPLE_COPY.steps[4]}</legend>
      {rates.options.map((option, index) => {
        const key = `${option.courierCompany}:${option.courierType}`;
        return (
          <motion.label
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE, delay: index * 0.04 }}
            className="relative flex min-h-14 cursor-pointer items-center justify-between gap-4 border border-brand-ink px-4 py-3 has-checked:bg-brand-ink has-checked:text-brand-mist has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink"
          >
            <input type="radio" name="courier" checked={key === selectedKey} onChange={() => onChange(choose(option))} className="absolute size-px opacity-0" />
            <span className="flex flex-col">
              <span className="text-[15px] leading-5 font-semibold">{option.courierName} {option.serviceName}</span>
              <span className="text-[13px] leading-[18px] opacity-70">{option.etaLabel}</span>
            </span>
            <span className="text-[15px] font-semibold tabular-nums">{formatRupiah(option.price)}</span>
          </motion.label>
        );
      })}
      {errors.courierCompany !== undefined && <p role="alert" className="m-0 text-[13px] font-semibold text-brand-error">{errors.courierCompany}</p>}
    </fieldset>
  );
}
