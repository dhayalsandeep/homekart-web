import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/shopify/catalogue';
import { PRODUCT_SORTS } from '@/lib/shopify/queries';
import { toSearchParams, type SearchParamsInput } from '@/lib/query-params';
import { CursorPagination, SortLinks } from '@/components/commerce/browse-controls';
import { ProductGrid } from '@/components/commerce/product-card';
import { SectionHeading } from '@/components/ui/section';
import { EmptyCatalogueNotice, NotConfiguredNotice, SkeletonGrid, StatePanel } from '@/components/ui/states';
import { publicErrorMessage } from '@/lib/shopify/result';

export const metadata: Metadata = {
  title: 'All products',
  description: 'Every product published in the connected Shopify store.',
};

const PAGE_SIZE = 24;

type Props = { searchParams?: Promise<SearchParamsInput> };

export default function ProductsPage({ searchParams }: Props) {
  return (
    <div className="shell py-8">
      <SectionHeading title="All products" />
      <Suspense fallback={<SkeletonGrid count={PAGE_SIZE} />}>
        <ProductsView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProductsView({ searchParams }: Props) {
  const params = toSearchParams((await searchParams) ?? {});
  const sort = params.get('sort') ?? undefined;
  const after = params.get('after') ?? undefined;

  const result = await getProducts({ first: PAGE_SIZE, sort, after });

  if (result.status === 'not-configured') return <NotConfiguredNotice missing={result.missing} />;
  if (result.status === 'error') {
    return <StatePanel tone="error" title="Could not load products" description={publicErrorMessage(result)} />;
  }

  const { items, pageInfo } = result.data;
  const basePath = '/products';

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SortLinks basePath={basePath} searchParams={params} options={PRODUCT_SORTS} value={sort} />
      </div>

      {items.length === 0 ? (
        <EmptyCatalogueNotice subject="published products" />
      ) : (
        <ProductGrid products={items} />
      )}

      <CursorPagination basePath={basePath} searchParams={params} pageInfo={pageInfo} />
    </>
  );
}
