"use client";

import { useCallback, useEffect, useState } from "react";

import type { SampleStep } from "@/app/utils/sample-request-input";

/** The intro (0) or one of the five form steps. */
export type SampleScreen = 0 | SampleStep;

/** Which way the last move went: 1 forward, -1 back. Drives the slide direction. */
export type SampleDirection = 1 | -1;

function screenFromState(state: unknown): SampleScreen {
  const value = (state as { sampleStep?: unknown } | null)?.sampleStep;
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : 0;
}

interface ISampleNavigation {
  screen: SampleScreen;
  direction: SampleDirection;
}

/** Mirrors the form's screen into browser history, so system Back steps back through the flow. */
export function useSampleStepHistory() {
  const [navigation, setNavigation] = useState<ISampleNavigation>({ screen: 0, direction: 1 });

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, sampleStep: 0 }, "");
    function handlePop(event: PopStateEvent) {
      const next = screenFromState(event.state);
      setNavigation((previous) => ({ screen: next, direction: next < previous.screen ? -1 : 1 }));
      window.scrollTo({ top: 0 });
    }
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  /** Moves to a later step and records it, so Back can return here. */
  const goForward = useCallback((next: SampleStep) => {
    window.history.pushState({ ...window.history.state, sampleStep: next }, "");
    setNavigation({ screen: next, direction: 1 });
    window.scrollTo({ top: 0 });
  }, []);

  /** Same as the browser's Back button. */
  const goBack = useCallback(() => window.history.back(), []);

  /** Walks history back to an earlier step, for a server error that belongs there. */
  const returnTo = useCallback((next: SampleStep) => {
    const current = screenFromState(window.history.state);
    if (next < current) window.history.go(next - current);
  }, []);

  return { screen: navigation.screen, direction: navigation.direction, goForward, goBack, returnTo };
}
