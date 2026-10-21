"use client";

import { useSyncExternalStore } from "react";

import { SAMPLE_DEV_DATA } from "./utils/sample-dev-fixtures";

const LABELS = { demo: "Demo data", worst: "Worst case", empty: "Empty", one: "One" } as const;

function readSet() {
  return new URLSearchParams(window.location.search).get("data") ?? "demo";
}

/** Dev-only switch between stress-test data sets for `/sample`. Never rendered in production. */
export function SampleDevDataToggle() {
  const active = useSyncExternalStore(() => () => undefined, readSet, () => "demo");
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <nav aria-label="Dev data set" className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 gap-0.5 rounded-full bg-neutral-200 p-0.5 font-sans text-xs shadow-sm">
      {SAMPLE_DEV_DATA.map((set) => (
        <a
          key={set}
          href={set === "demo" ? "?" : `?data=${set}`}
          className={set === active ? "rounded-full bg-white px-3 py-1.5 text-neutral-900 no-underline" : "rounded-full px-3 py-1.5 text-neutral-600 no-underline"}
        >
          {LABELS[set]}
        </a>
      ))}
    </nav>
  );
}
