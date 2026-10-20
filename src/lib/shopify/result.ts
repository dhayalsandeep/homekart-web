import { getShopifyConfig } from '@/lib/config/env';

/**
 * Every Shopify read returns one of these. The point is that "we have not been
 * given credentials" and "the store answered but had nothing" are *different*
 * states, and neither is allowed to be papered over with invented content.
 */
export type ShopifyResult<T> =
  | { readonly status: 'ok'; readonly data: T }
  | { readonly status: 'not-configured'; readonly missing: readonly string[] }
  | { readonly status: 'error'; readonly message: string; readonly kind: ErrorKind };

export type ErrorKind = 'network' | 'api' | 'config' | 'unknown';

export function notConfigured(): ShopifyResult<never> {
  const config = getShopifyConfig();
  return config.status === 'not-configured'
    ? { status: 'not-configured', missing: config.missing }
    : { status: 'error', message: 'Unexpected configuration state', kind: 'config' };
}

export function ok<T>(data: T): ShopifyResult<T> {
  return { status: 'ok', data };
}

export function fail(message: string, kind: ErrorKind = 'unknown'): ShopifyResult<never> {
  return { status: 'error', message, kind };
}

export function isOk<T>(result: ShopifyResult<T>): result is Extract<ShopifyResult<T>, { status: 'ok' }> {
  return result.status === 'ok';
}

/** Safe for the browser: carries no token, domain or response body. */
export function publicErrorMessage(result: Extract<ShopifyResult<unknown>, { status: 'error' }>): string {
  switch (result.kind) {
    case 'network':
      return 'Could not reach the Shopify Storefront API. Check the store domain and network access.';
    case 'api':
      return 'Shopify rejected the request. The query, API version or token scope may be out of date.';
    case 'config':
      return 'Shopify environment configuration is incomplete or invalid.';
    default:
      return 'The storefront request failed unexpectedly.';
  }
}
