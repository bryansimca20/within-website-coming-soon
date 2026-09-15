"use client";

import { useEffect, useRef, useState } from "react";

/** Movement below this is a click, not a drag — so text stays selectable. */
const DRAG_THRESHOLD_PX = 4;
/** How far a release carries past the pointer: ms of travel at release speed. */
const FLING_MS = 110;
/** Fallback for browsers without `scrollend`. */
const SETTLE_MS = 600;

interface Drag {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  lastX: number;
  lastT: number;
  /** px per ms, positive when the pointer travels right. */
  velocity: number;
  armed: boolean;
}

/** Scroll position of a child, in the scroller's own scrollLeft units. */
function childOffsets(el: HTMLElement): number[] {
  const left = el.getBoundingClientRect().left - el.scrollLeft;

  return Array.from(el.children, (child) => child.getBoundingClientRect().left - left);
}

/** The snap point closest to where a fling would land. */
function nearestSnap(el: HTMLElement, projected: number): number {
  let best = projected;
  let bestDistance = Infinity;

  for (const offset of childOffsets(el)) {
    const distance = Math.abs(offset - projected);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = offset;
    }
  }

  return Math.min(Math.max(best, 0), el.scrollWidth - el.clientWidth);
}

/**
 * Click-and-drag scrolling for a horizontal scroller, with a short fling and a
 * landing on the nearest snap point. Touch pointers are left to the platform,
 * which already scrolls them better than we can.
 *
 * Returns the ref to hang on the scroll container and whether a drag is live,
 * for cursor and selection feedback.
 */
export function useDragScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let drag: Drag | null = null;
    let settleTimer: number | undefined;
    /** A drag ends in a click event we don't want anything to act on. */
    let swallowClick = false;

    const settle = (velocity: number) => {
      const max = el.scrollWidth - el.clientWidth;
      const projected = Math.min(Math.max(el.scrollLeft - velocity * FLING_MS, 0), max);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      el.scrollTo({ left: nearestSnap(el, projected), behavior: reduce ? "auto" : "smooth" });

      // Snapping comes back only once the glide lands, or it yanks the scroller mid-flight.
      const finish = () => {
        el.removeEventListener("scrollend", finish);
        window.clearTimeout(settleTimer);
        settleTimer = undefined;
        el.style.scrollSnapType = "";
      };

      el.addEventListener("scrollend", finish);
      settleTimer = window.setTimeout(finish, SETTLE_MS);
    };

    const onPointerDown = (e: PointerEvent) => {
      swallowClick = false;
      if (e.pointerType === "touch" || e.button !== 0) return;
      if (el.scrollWidth <= el.clientWidth) return;

      drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startScrollLeft: el.scrollLeft,
        lastX: e.clientX,
        lastT: e.timeStamp,
        velocity: 0,
        armed: false,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startX;

      if (!drag.armed) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
        drag.armed = true;
        // Capture keeps the moves coming once the cursor leaves the gallery. Losing it is
        // survivable — the drag still tracks while the pointer stays over the scroller.
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // no active pointer to capture
        }
        // Mandatory snapping re-snaps on every scrollLeft write, which stalls the drag.
        el.style.scrollSnapType = "none";
        el.style.userSelect = "none";
        window.getSelection()?.removeAllRanges();
        setDragging(true);
      }

      const dt = e.timeStamp - drag.lastT;
      if (dt > 0) {
        const instant = (e.clientX - drag.lastX) / dt;
        // Smoothed, so one stuttery frame can't define the fling.
        drag.velocity = instant * 0.6 + drag.velocity * 0.4;
        drag.lastX = e.clientX;
        drag.lastT = e.timeStamp;
      }

      el.scrollLeft = drag.startScrollLeft - dx;
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;

      const { armed, velocity } = drag;
      drag = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (!armed) return;

      el.style.userSelect = "";
      swallowClick = true;
      setDragging(false);
      settle(e.type === "pointercancel" ? 0 : velocity);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
      el.removeEventListener("click", onClickCapture, true);
      window.clearTimeout(settleTimer);
      el.style.scrollSnapType = "";
      el.style.userSelect = "";
    };
  }, []);

  return { ref, dragging };
}
