import type { Cart } from '@/lib/shopify/types';

/** Shared wire contract between the client cart provider and /api/cart. */
export type CartApiEnvelope =
  | {
      readonly status: 'ok';
      readonly cart: Cart | null;
      /** Shopify's `CartWarning` messages, e.g. a quantity rounded to the increment. */
      readonly warnings?: readonly string[];
    }
  | { readonly status: 'not-configured'; readonly missing: readonly string[] }
  | { readonly status: 'error'; readonly message: string };

export type CartAddRequest = { readonly action: 'add'; readonly merchandiseId: string; readonly quantity: number };
export type CartUpdateRequest = { readonly action: 'update'; readonly lineId: string; readonly quantity: number };
export type CartRemoveRequest = { readonly action: 'remove'; readonly lineId: string };
export type CartRequest = CartAddRequest | CartUpdateRequest | CartRemoveRequest;

export const CART_COOKIE = 'homekart_cart_id';
