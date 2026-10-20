import 'server-only';
import { discountPercent } from '@/lib/format';
import { shopifyQuery } from '@/lib/shopify/client';
import {
  mapCollection,
  mapPageInfo,
  mapProductCard,
  mapProductDetail,
  mapProducts,
  mapShop,
} from '@/lib/shopify/mappers';
import {
  collectionProductsQuery,
  collectionsQuery,
  productQuery,
  productsQuery,
  searchQuery,
  shopQuery,
  toCollectionSort,
  toProductSort,
  toSearchSort,
} from '@/lib/shopify/queries';
import { isOk, ok, type ShopifyResult } from '@/lib/shopify/result';
import type {
  Collection,
  Paginated,
  ProductDetail,
  ProductSummary,
  ShopSummary,
} from '@/lib/shopify/types';

type RawConnection<T> = {
  nodes?: readonly T[] | null;
  pageInfo?: Parameters<typeof mapPageInfo>[0];
};

export type ListInput = {
  readonly first?: number;
  readonly sort?: string;
  readonly reverse?: boolean;
  readonly after?: string;
};

/** Everything a page may ask Shopify for lives behind these five functions. */

export async function getProducts(input: ListInput = {}): Promise<ShopifyResult<Paginated<ProductSummary>>> {
  const result = await shopifyQuery<{ products: RawConnection<Parameters<typeof mapProductCard>[0]> }>(
    productsQuery,
    {
      first: clampFirst(input.first),
      sortKey: toProductSort(input.sort) ?? 'BEST_SELLING',
      reverse: input.reverse ?? false,
      after: input.after ?? null,
    },
    { tags: ['products'] },
  );

  return isOk(result) ? { status: 'ok', data: mapProducts(result.data.products) } : result;
}

export async function getProduct(handle: string): Promise<ShopifyResult<ProductDetail | null>> {
  const result = await shopifyQuery<{ product: Parameters<typeof mapProductDetail>[0] | null }>(
    productQuery,
    { handle },
    { tags: ['products', `product:${handle}`] },
  );

  if (!isOk(result)) return result;
  return { status: 'ok', data: result.data.product ? mapProductDetail(result.data.product) : null };
}

export type CollectionPage = {
  readonly collection: Collection;
  readonly products: Paginated<ProductSummary>;
};

/**
 * One round trip for the collection header and its products. A `null` here means
 * the handle is not a collection in this store — which is a normal outcome for
 * the proposed handles in src/lib/config/site.ts, and must render as an empty
 * state rather than as a fallback catalogue.
 */
export async function getCollectionPage(
  handle: string,
  input: ListInput = {},
): Promise<ShopifyResult<CollectionPage | null>> {
  const result = await shopifyQuery<{
    collection: (Parameters<typeof mapCollection>[0] & {
      products?: RawConnection<Parameters<typeof mapProductCard>[0]> | null;
    }) | null;
  }>(
    collectionProductsQuery,
    {
      handle,
      first: clampFirst(input.first, 24),
      sortKey: toCollectionSort(input.sort) ?? 'COLLECTION_DEFAULT',
      reverse: input.reverse ?? false,
      after: input.after ?? null,
    },
    { tags: ['products', `collection:${handle}`] },
  );

  if (!isOk(result)) return result;
  const raw = result.data.collection;
  if (!raw) return { status: 'ok', data: null };

  return {
    status: 'ok',
    data: { collection: mapCollection(raw), products: mapProducts(raw.products) },
  };
}

export async function listCollections(first = 20): Promise<ShopifyResult<readonly Collection[]>> {
  const result = await shopifyQuery<{
    collections: RawConnection<Parameters<typeof mapCollection>[0]>;
  }>(collectionsQuery, { first: clampFirst(first, 100) }, { tags: ['collections'] });

  return isOk(result)
    ? { status: 'ok', data: (result.data.collections.nodes ?? []).map(mapCollection) }
    : result;
}

export async function searchProducts(
  query: string,
  input: ListInput = {},
): Promise<ShopifyResult<Paginated<ProductSummary>>> {
  const result = await shopifyQuery<{
    search: { nodes?: readonly Record<string, unknown>[] | null; pageInfo?: Parameters<typeof mapPageInfo>[0] };
  }>(
    searchQuery,
    {
      query,
      first: clampFirst(input.first, 24),
      sortKey: toSearchSort(input.sort) ?? 'RELEVANCE',
      after: input.after ?? null,
    },
    { tags: ['search'] },
  );

  if (!isOk(result)) return result;

  // `SearchResultItem` is a union of Article | Page | Product. `types: [PRODUCT]`
  // means only Product shapes are returned, but the map filters on `__typename`
  // rather than assuming it.
  const items = (result.data.search.nodes ?? [])
    .filter((node) => node.__typename === 'Product')
    .map((node) => mapProductCard(node as unknown as Parameters<typeof mapProductCard>[0]));

  return {
    status: 'ok',
    data: { items, pageInfo: mapPageInfo(result.data.search.pageInfo) },
  };
}

export async function getShop(): Promise<ShopifyResult<ShopSummary>> {
  const result = await shopifyQuery<{ shop: Parameters<typeof mapShop>[0] }>(
    shopQuery,
    undefined,
    { tags: ['shop'] },
  );

  return isOk(result) ? { status: 'ok', data: mapShop(result.data.shop) } : result;
}

/**
 * "Deals" here means *currently marked down in Shopify*, not a scheduled sale:
 * the Storefront API exposes no compare-at filter, so the candidate set is the
 * best-selling page and the markdown is confirmed per product by comparing the
 * two prices. A product with no genuine compare-at price never appears, and
 * nothing is labelled a deal that Shopify has not discounted.
 */
export async function getDeals(count = 6): Promise<ShopifyResult<readonly ProductSummary[]>> {
  const result = await getProducts({ first: 24, sort: 'BEST_SELLING' });
  if (!isOk(result)) return result;

  return ok(
    result.data.items.filter((product) => discountPercent(product.price, product.compareAtPrice) !== null).slice(0, count),
  );
}

function clampFirst(value: number | undefined, fallback = 12): number {
  const parsed = Number.isFinite(value) ? Math.trunc(value as number) : fallback;
  return Math.min(Math.max(parsed, 1), 100);
}
