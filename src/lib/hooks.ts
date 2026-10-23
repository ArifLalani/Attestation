"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const minuteListeners = new Set<() => void>();
let minuteTimer: ReturnType<typeof setInterval> | undefined;
let currentMinute = 0;

function subscribeMinute(listener: () => void) {
  minuteListeners.add(listener);
  if (!minuteTimer) {
    currentMinute = Date.now();
    minuteTimer = setInterval(() => {
      currentMinute = Date.now();
      minuteListeners.forEach((notify) => notify());
    }, 30_000);
  }
  return () => {
    minuteListeners.delete(listener);
    if (!minuteListeners.size && minuteTimer) {
      clearInterval(minuteTimer);
      minuteTimer = undefined;
    }
  };
}

/**
 * Current time, refreshed every 30 s. `null` during server rendering and the first paint,
 * so time-based text (opening hours) never mismatches between server and browser.
 */
export function useNow(): Date | null {
  const time = useSyncExternalStore(
    subscribeMinute,
    () => (currentMinute ||= Date.now()),
    () => 0,
  );
  return time ? new Date(time) : null;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Animates a number from its previous value to `target`. Starts at `target` on first render. */
export function useCountUp(target: number, duration = 600) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (reduced || from.current === target) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(origin + (target - origin) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      from.current = target;
    };
  }, [target, duration, reduced]);

  return value;
}

/** Which section is under the pinned header. `ids` in page order. */
export function useScrollSpy(ids: readonly string[], offset: number) {
  const [active, setActive] = useState(ids[0]);
  const lockUntil = useRef(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (performance.now() < lockUntil.current) return;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top - offset <= 8) current = id;
      }
      // At the very bottom, the last section wins even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, offset]);

  /** Scrolls to a section and keeps its tab selected while the smooth scroll runs. */
  const goTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    setActive(id);
    lockUntil.current = performance.now() + 900;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [offset]);

  return { active, goTo };
}
