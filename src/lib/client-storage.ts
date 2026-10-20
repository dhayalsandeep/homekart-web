'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * localStorage is an external system, so reads go through `useSyncExternalStore`
 * rather than an effect that copies storage into component state. Two details
 * make that work here:
 *
 * - The `storage` event only fires in *other* tabs, so writes notify this tab's
 *   subscribers directly.
 * - `getSnapshot` must be referentially stable, so parsed values are cached
 *   against the raw string they came from.
 */
const subscribers = new Set<() => void>();

function notify() {
  for (const subscriber of [...subscribers]) subscriber();
}

function subscribe(subscriber: () => void) {
  subscribers.add(subscriber);
  window.addEventListener('storage', subscriber);
  return () => {
    subscribers.delete(subscriber);
    window.removeEventListener('storage', subscriber);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage blocked (private mode, disabled cookies): the value is simply absent.
    return null;
  }
}

/** Writing is best-effort — a quota or private-mode failure must not throw. */
export function writeStored(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* the in-memory snapshot still updates for this view */
  }
  notify();
}

const EMPTY_LIST: readonly string[] = [];
const listCache = new Map<string, { raw: string | null; value: readonly string[] }>();

const emptyStringSnapshot = () => null;
const emptyListSnapshot = () => EMPTY_LIST;

export function useStoredString(key: string): string | null {
  const getSnapshot = useCallback(() => read(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, emptyStringSnapshot);
}

/** Reads a JSON array of strings, ignoring anything the store did not put there. */
export function useStoredHandles(key: string): readonly string[] {
  const getSnapshot = useCallback(() => {
    const raw = read(key);
    const cached = listCache.get(key);
    if (cached && cached.raw === raw) return cached.value;

    let value: readonly string[] = EMPTY_LIST;
    try {
      const parsed: unknown = raw === null ? null : JSON.parse(raw);
      if (Array.isArray(parsed)) value = parsed.filter((item): item is string => typeof item === 'string');
    } catch {
      /* corrupted JSON: treat the list as empty rather than throwing */
    }

    listCache.set(key, { raw, value });
    return value;
  }, [key]);

  return useSyncExternalStore(subscribe, getSnapshot, emptyListSnapshot);
}
