"use client";

import { useEffect, useId, useState } from "react";

import type { IBiteshipArea } from "@/services/biteship.service";

import { SAMPLE_COPY } from "./utils/sample-copy";
import { sampleDevAreas } from "./utils/sample-dev-fixtures";
import type { ISampleStepProps } from "./utils/sample-form-types";

const { delivery } = SAMPLE_COPY;

const MIN_QUERY = 3;
const DEBOUNCE_MS = 400;

/** Area autocomplete: type three characters, pause, pick one. A pick fills the five address fields. */
export function SampleAreaSearch({ values, errors, onChange }: ISampleStepProps) {
  const [query, setQuery] = useState("");
  const [areas, setAreas] = useState<IBiteshipArea[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputId = useId();
  const error = errors.areaId ?? errors.postalCode;
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < MIN_QUERY) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const devAreas = sampleDevAreas();
        if (devAreas !== null) {
          setAreas(devAreas);
          return;
        }
        const response = await fetch(`/api/sample/areas?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        const payload: { areas?: IBiteshipArea[] } = await response.json();
        setAreas(payload.areas ?? []);
      } catch {
        if (!controller.signal.aborted) setAreas([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  function pick(area: IBiteshipArea) {
    onChange({
      areaId: area.id,
      areaName: area.name,
      province: area.province,
      city: area.city,
      district: area.district,
      postalCode: area.postalCode,
      shippingFee: "",
      courierCompany: "",
      courierType: "",
      courierServiceName: "",
      shippingEta: "",
    });
    setQuery("");
    setAreas([]);
  }

  function clear() {
    onChange({
      areaId: "",
      areaName: "",
      province: "",
      city: "",
      district: "",
      postalCode: "",
      shippingFee: "",
      courierCompany: "",
      courierType: "",
      courierServiceName: "",
      shippingEta: "",
    });
  }

  if (values.areaId !== "") {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-brand-muted pt-2 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] leading-[18px] text-brand-muted">{delivery.area}</span>
          <span className="text-base leading-6">{values.areaName}</span>
        </div>
        <button type="button" onClick={clear} className="h-11 shrink-0 cursor-pointer px-1 text-[13px] font-semibold underline">
          {delivery.areaChange}
        </button>
      </div>
    );
  }

  const showList = trimmed.length >= MIN_QUERY;

  return (
    <div>
      <div className={error === undefined ? "border-b border-brand-muted pt-2 pb-1.5" : "border-b-2 border-brand-error pt-2 pb-[5px]"}>
        <label htmlFor={inputId} className="text-[13px] leading-[18px] text-brand-muted">
          {delivery.area}
        </label>
        <input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={delivery.areaPlaceholder}
          autoComplete="off"
          aria-invalid={error !== undefined}
          className="m-0 w-full appearance-none rounded-none border-0 bg-transparent px-0 py-1 text-base leading-6 outline-none placeholder:text-brand-muted"
        />
      </div>
      {showList && (
        <ul className="m-0 mt-1 list-none border border-brand-ink p-0" aria-live="polite">
          {isSearching && areas.length === 0 && <li className="px-3 py-3 text-sm text-brand-muted">{delivery.areaSearching}</li>}
          {!isSearching && areas.length === 0 && <li className="px-3 py-3 text-sm text-brand-muted">{delivery.areaEmpty}</li>}
          {areas.map((area) => (
            <li key={area.id} className="border-b border-brand-mist last:border-b-0">
              <button
                type="button"
                onClick={() => pick(area)}
                className="block min-h-11 w-full cursor-pointer px-3 py-2.5 text-left text-[15px] leading-5 hover:bg-brand-mist focus-visible:bg-brand-mist focus-visible:outline-none"
              >
                {area.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error !== undefined && (
        <p role="alert" className="mt-1.5 mb-0 text-[13px] leading-[18px] font-semibold text-brand-error">
          {error}
        </p>
      )}
    </div>
  );
}
