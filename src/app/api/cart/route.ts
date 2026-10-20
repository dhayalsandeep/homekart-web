import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { CART_COOKIE, type CartApiEnvelope, type CartRequest } from '@/lib/cart/contract';
import { addLines, createCart, readCart, removeLine, updateLine, type CartMutationResult } from '@/lib/shopify/cart';
import { isOk, publicErrorMessage, type ShopifyResult } from '@/lib/shopify/result';
import type { Cart } from '@/lib/shopify/types';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * The browser never sees the Storefront token: every call to Shopify is made
 * here, server-side, and only the mapped cart crosses the boundary back.
 */

async function cookieStore() {
  const store = await cookies();
  return {
    id: store.get(CART_COOKIE)?.value ?? null,
    async set(cartId: string) {
      store.set(CART_COOKIE, cartId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === 'production',
      });
    },
    clear() {
      store.delete(CART_COOKIE);
    },
  };
}

function envelopeFor(result: ShopifyResult<Cart | null>): CartApiEnvelope {
  if (result.status === 'not-configured') return { status: 'not-configured', missing: result.missing };
  if (result.status === 'error') return { status: 'error', message: publicErrorMessage(result) };
  return { status: 'ok', cart: result.data };
}

function envelopeForMutation(result: ShopifyResult<CartMutationResult>): CartApiEnvelope {
  if (result.status === 'not-configured') return { status: 'not-configured', missing: result.missing };
  if (result.status === 'error') return { status: 'error', message: publicErrorMessage(result) };
  const { cart, warnings } = result.data;
  return { status: 'ok', cart, warnings: warnings.length > 0 ? [...warnings] : undefined };
}

export async function GET() {
  const store = await cookieStore();
  if (!store.id) return json({ status: 'ok', cart: null });

  const result = await readCart(store.id);
  if (result.status === 'ok' && result.data === null) {
    // Shopify no longer knows about this cart: drop the dead id rather than
    // re-reading it on every visit.
    store.clear();
    return json({ status: 'ok', cart: null });
  }

  return json(envelopeFor(result));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ status: 'error', message: 'Expected a JSON body.' }, 400);
  }

  const parsed = parseCartRequest(body);
  if (!parsed) {
    return json({ status: 'error', message: 'The cart request was not recognised.' }, 400);
  }

  const store = await cookieStore();
  const cartId = store.id;

  if (parsed.action === 'add') {
    const result = cartId
      ? await addLines(cartId, [{ merchandiseId: parsed.merchandiseId, quantity: parsed.quantity }])
      : await createCart([{ merchandiseId: parsed.merchandiseId, quantity: parsed.quantity }]);

    if (isOk(result)) await store.set(result.data.cart.id);
    return json(envelopeForMutation(result));
  }

  if (!cartId) {
    return json({ status: 'error', message: 'Your cart is empty.' } satisfies CartApiEnvelope, 400);
  }

  const result =
    parsed.action === 'update'
      ? await updateLine(cartId, parsed.lineId, parsed.quantity)
      : await removeLine(cartId, parsed.lineId);

  if (isOk(result)) {
    if (result.data.cart.lines.length === 0) store.clear();
    else await store.set(result.data.cart.id);
  }

  return json(envelopeForMutation(result));
}

function json(envelope: CartApiEnvelope, status = 200) {
  const response = NextResponse.json(envelope, { status });
  response.headers.set('cache-control', 'no-store');
  return response;
}

/** The body is untrusted input, so it is validated field by field. */
function parseCartRequest(body: unknown): CartRequest | null {
  if (typeof body !== 'object' || body === null) return null;
  const record = body as Record<string, unknown>;

  if (record.action === 'add') {
    const merchandiseId = record.merchandiseId;
    if (typeof merchandiseId !== 'string' || !merchandiseId.startsWith('gid://shopify/ProductVariant/')) return null;
    return { action: 'add', merchandiseId, quantity: toQuantity(record.quantity) };
  }

  if (record.action === 'update' || record.action === 'remove') {
    const lineId = record.lineId;
    if (typeof lineId !== 'string' || !lineId.startsWith('gid://') || lineId.length > 255) return null;
    return record.action === 'update'
      ? { action: 'update', lineId, quantity: toQuantity(record.quantity) }
      : { action: 'remove', lineId };
  }

  return null;
}

function toQuantity(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(Math.trunc(parsed), 1), 100);
}
