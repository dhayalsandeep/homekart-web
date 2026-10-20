'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Cart } from '@/lib/shopify/types';
import type { CartApiEnvelope, CartRequest } from '@/lib/cart/contract';

type CartContextValue = {
  readonly cart: Cart | null;
  readonly count: number;
  readonly loading: boolean;
  readonly busy: boolean;
  readonly message: string | null;
  readonly notice: string | null;
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  readonly setQuantity: (lineId: string, quantity: number) => Promise<boolean>;
  readonly removeItem: (lineId: string) => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const apply = useCallback((envelope: CartApiEnvelope) => {
    if (envelope.status === 'ok') {
      setCart(envelope.cart);
      setMessage(null);
      return true;
    }
    if (envelope.status === 'not-configured') {
      setMessage(
        `Cart needs a connected Shopify store. Missing: ${envelope.missing.join(', ')}.`,
      );
      return false;
    }
    setMessage(envelope.message);
    return false;
  }, []);

  // The bootstrap read is inline because the effect's setState calls have to be
  // visible to the lint rule as post-await callbacks, not hidden behind a shared
  // function. `loading` starts true since this always runs on mount.
  useEffect(() => {
    let current = true;
    void (async () => {
      try {
        const response = await fetch('/api/cart', { cache: 'no-store' });
        const envelope = (await response.json()) as CartApiEnvelope;
        if (current) apply(envelope);
      } catch {
        if (current) setMessage('Could not reach the cart service.');
      } finally {
        if (current) setLoading(false);
      }
    })();

    return () => {
      current = false;
    };
  }, [apply]);

  const mutate = useCallback(
    async (request: CartRequest) => {
      setBusy(true);
      setNotice(null);
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request),
          cache: 'no-store',
        });
        const envelope = (await response.json()) as CartApiEnvelope;
        const success = apply(envelope);
        if (success && request.action === 'add') {
          // A Shopify cart warning (quantity rounded to the increment, for
          // instance) is more specific than the generic confirmation, so it wins.
          const warning = envelope.status === 'ok' ? envelope.warnings?.join(' ') : undefined;
          setNotice(warning || 'Added to cart');
          setIsOpen(true);
        }
        return success;
      } catch {
        setMessage('Could not reach the cart service. Your cart may be out of date.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [apply],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.totalQuantity ?? 0,
      loading,
      busy,
      message,
      notice,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addItem: (merchandiseId, quantity = 1) => mutate({ action: 'add', merchandiseId, quantity }),
      setQuantity: (lineId, quantity) => mutate({ action: 'update', lineId, quantity }),
      removeItem: (lineId) => mutate({ action: 'remove', lineId }),
    }),
    [cart, loading, busy, message, notice, isOpen, mutate],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
