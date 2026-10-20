import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { getShopifyConfig } from '@/lib/config/env';
import { fail, notConfigured, ok, type ShopifyResult } from '@/lib/shopify/result';

const TIMEOUT_MS = 8_000;

type GraphQlError = { readonly message: string; readonly extensions?: { readonly code?: string } };
type GraphQlBody<T> = { readonly data?: T | null; readonly errors?: GraphQlError[] };

async function request<T>(
  document: string,
  variables: Record<string, unknown> | undefined,
): Promise<ShopifyResult<T>> {
  const config = getShopifyConfig();
  if (config.status === 'not-configured') return notConfigured();

  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'X-Shopify-Storefront-Access-Token': config.accessToken,
      },
      body: JSON.stringify({ query: document, variables: variables ?? {} }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.name : 'unknown';
    return fail(`Storefront request failed before completing (${reason}).`, 'network');
  }

  // Status only — the response body can describe the store, so it is not propagated.
  if (!response.ok) return fail(`Storefront API responded ${response.status}.`, 'api');

  let body: GraphQlBody<T>;
  try {
    body = (await response.json()) as GraphQlBody<T>;
  } catch {
    return fail('Storefront API returned a response that was not JSON.', 'api');
  }

  const firstError = body.errors?.[0];
  if (firstError) return fail(firstError.message || 'The Storefront API returned an unspecified error.', 'api');
  if (!body.data) return fail('The Storefront API returned no data for this operation.', 'api');
  return ok(body.data);
}

/**
 * Shared, cacheable catalogue reads (products, collections, search, shop).
 *
 * Never route per-visitor data through this: `'use cache'` stores the result in
 * the shared data cache keyed by the arguments, so a cart read here would leak
 * one visitor's cart into another's render. Cart reads use `shopifyUncached`.
 */
export async function shopifyQuery<T>(
  document: string,
  variables?: Record<string, unknown>,
  options: { readonly tags?: readonly string[] } = {},
): Promise<ShopifyResult<T>> {
  'use cache';

  const tags = options.tags ?? [];
  if (tags.length > 0) cacheTag(...tags);
  cacheLife('minutes');

  return request<T>(document, variables);
}

/** Cart reads and every mutation: always network, never the shared cache. */
export function shopifyUncached<T>(
  document: string,
  variables?: Record<string, unknown>,
): Promise<ShopifyResult<T>> {
  return request<T>(document, variables);
}
