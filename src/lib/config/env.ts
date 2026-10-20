import 'server-only';

export type ShopifyConfig =
  | { readonly status: 'configured'; readonly domain: string; readonly apiVersion: string; readonly accessToken: string }
  | { readonly status: 'not-configured'; readonly missing: readonly string[] };

const REQUIRED = {
  domain: 'SHOPIFY_STORE_DOMAIN',
  token: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  version: 'SHOPIFY_STOREFRONT_API_VERSION',
} as const;

/**
 * Verified, not guessed: `@shopify/hydrogen@2026.10.1` ships Shopify's
 * introspected Storefront schema plus `STOREFRONT_API_VERSION = "2026-10"` in
 * `dist/core/constants.mjs`. Override with SHOPIFY_STOREFRONT_API_VERSION.
 */
const FALLBACK_API_VERSION = '2026-10';

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

/** Accepts `store.myshopify.com` or `https://store.myshopify.com/`. */
function normalizeDomain(value: string): string {
  return value.replace(/^[a-z]+:\/\//i, '').replace(/\/+$/, '');
}

function placeholderFree(value: string): boolean {
  return !/^(your-|<|changeme|todo|xxx)/i.test(value);
}

export function getShopifyConfig(): ShopifyConfig {
  const rawDomain = read(REQUIRED.domain);
  const rawToken = read(REQUIRED.token);
  const missing: string[] = [];

  const domain = rawDomain && placeholderFree(rawDomain) ? normalizeDomain(rawDomain) : undefined;
  const accessToken = rawToken && placeholderFree(rawToken) ? rawToken : undefined;

  if (!domain) missing.push(REQUIRED.domain);
  if (!accessToken) missing.push(REQUIRED.token);

  if (missing.length > 0) return { status: 'not-configured', missing };

  return {
    status: 'configured',
    domain: domain!,
    accessToken: accessToken!,
    apiVersion: read(REQUIRED.version) ?? FALLBACK_API_VERSION,
  };
}

export function requireShopifyConfig(): Extract<ShopifyConfig, { status: 'configured' }> {
  const config = getShopifyConfig();
  if (config.status === 'configured') return config;
  throw new Error(
    `Shopify Storefront is not configured. Set ${config.missing.join(', ')} in .env.local. ` +
      `See .env.example for the expected format.`,
  );
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return url && url.length > 0 ? url.replace(/\/$/, '') : 'http://localhost:3000';
}
