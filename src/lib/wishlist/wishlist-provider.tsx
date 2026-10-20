'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useStoredHandles, writeStored } from '@/lib/client-storage';

const STORAGE_KEY = 'homekart:wishlist:v1';

type WishlistValue = {
  readonly handles: readonly string[];
  readonly count: number;
  readonly has: (handle: string) => boolean;
  readonly toggle: (handle: string) => void;
  readonly remove: (handle: string) => void;
  readonly clear: () => void;
};

const WishlistContext = createContext<WishlistValue | null>(null);

/**
 * Shopify's Storefront API has no wishlist object, so this is intentionally
 * device-local. It is presented to the customer that way rather than implied to
 * be an account feature.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const handles = useStoredHandles(STORAGE_KEY);

  const value = useMemo<WishlistValue>(() => {
    const persist = (next: readonly string[]) => writeStored(STORAGE_KEY, JSON.stringify(next));
    return {
      handles,
      count: handles.length,
      has: (handle) => handles.includes(handle),
      toggle: (handle) => persist(handles.includes(handle) ? handles.filter((h) => h !== handle) : [...handles, handle]),
      remove: (handle) => persist(handles.filter((h) => h !== handle)),
      clear: () => persist([]),
    };
  }, [handles]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return context;
}
