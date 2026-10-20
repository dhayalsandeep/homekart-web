import 'server-only';
import { shopifyUncached } from '@/lib/shopify/client';
import { mapCart } from '@/lib/shopify/mappers';
import {
  cartCreateMutation,
  cartLinesAddMutation,
  cartLinesRemoveMutation,
  cartLinesUpdateMutation,
  cartQuery,
} from '@/lib/shopify/queries';
import { fail, isOk, ok, type ShopifyResult } from '@/lib/shopify/result';
import type { Cart } from '@/lib/shopify/types';

type RawCartPayload = {
  cart?: Parameters<typeof mapCart>[0] | null;
  userErrors?: readonly { field?: readonly string[] | null; message?: string | null }[] | null;
  warnings?: readonly { code?: string | null; message?: string | null; target?: string | null }[] | null;
};

/**
 * A cart payload can carry `userErrors` *and* a usable cart, and it can carry
 * `warnings` with no errors at all (quantity rounded up to the increment, for
 * example). Both are surfaced instead of being treated as success, because
 * silently accepting a rounded quantity would misreport what the customer asked
 * for.
 */
export type CartMutationResult = {
  readonly cart: Cart;
  readonly warnings: readonly string[];
};

function toCartResult(result: ShopifyResult<RawCartPayload>): ShopifyResult<CartMutationResult> {
  if (!isOk(result)) return result;

  const rejection = (result.data.userErrors ?? []).find((error) => error?.message);
  if (rejection) {
    return fail(rejection.message ?? 'Shopify rejected the cart change.', 'api');
  }

  if (!result.data.cart) {
    return fail('Shopify accepted the request but returned no cart.', 'api');
  }

  const cart = mapCart(result.data.cart);
  if (!cart) return fail('Shopify returned a cart that could not be read.', 'api');

  return ok({
    cart,
    warnings: (result.data.warnings ?? [])
      .map((warning) => warning?.message ?? '')
      .filter((message) => message.length > 0),
  });
}

export type NewCartLine = { readonly merchandiseId: string; readonly quantity?: number };

export async function readCart(cartId: string): Promise<ShopifyResult<Cart | null>> {
  // Uncached on purpose: a cart belongs to one visitor, never to the shared cache.
  const result = await shopifyUncached<{ cart: Parameters<typeof mapCart>[0] | null }>(cartQuery, { cartId });
  if (!isOk(result)) return result;
  return ok(mapCart(result.data.cart));
}

export async function createCart(lines: readonly NewCartLine[]): Promise<ShopifyResult<CartMutationResult>> {
  const result = await shopifyUncached<RawCartPayload>(cartCreateMutation, {
    input: { lines: lines.map((line) => toLineInput(line)) },
  });
  return toCartResult(result);
}

export async function addLines(
  cartId: string,
  lines: readonly NewCartLine[],
): Promise<ShopifyResult<CartMutationResult>> {
  const result = await shopifyUncached<RawCartPayload>(cartLinesAddMutation, {
    cartId,
    lines: lines.map((line) => toLineInput(line)),
  });
  return toCartResult(result);
}

export async function updateLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyResult<CartMutationResult>> {
  const result = await shopifyUncached<RawCartPayload>(cartLinesUpdateMutation, {
    cartId,
    lines: [{ id: lineId, quantity: Math.max(quantity, 1) }],
  });
  return toCartResult(result);
}

export async function removeLine(cartId: string, lineId: string): Promise<ShopifyResult<CartMutationResult>> {
  const result = await shopifyUncached<RawCartPayload>(cartLinesRemoveMutation, {
    cartId,
    lineIds: [lineId],
  });
  return toCartResult(result);
}

function toLineInput(line: NewCartLine): { merchandiseId: string; quantity?: number } {
  const quantity = line.quantity ?? 1;
  return { merchandiseId: line.merchandiseId, quantity: Math.max(quantity, 1) };
}
