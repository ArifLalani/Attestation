"use client";

import { useSyncExternalStore } from "react";

const KEY = "os-certificat-utile";
const listeners = new Set<() => void>();
let cache: string | null = null;

const read = () => {
  if (cache === null) cache = window.localStorage.getItem(KEY) ?? "[]";
  return cache;
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** "Utile" votes: anonymous, one per device, kept in localStorage. Nothing is sent anywhere. */
export function useUsefulVote(reviewId: string) {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const voted = (JSON.parse(raw) as string[]).includes(reviewId);

  const toggle = () => {
    const ids = new Set(JSON.parse(read()) as string[]);
    if (ids.has(reviewId)) ids.delete(reviewId);
    else ids.add(reviewId);
    cache = JSON.stringify([...ids]);
    window.localStorage.setItem(KEY, cache);
    listeners.forEach((notify) => notify());
  };

  return { voted, toggle };
}
