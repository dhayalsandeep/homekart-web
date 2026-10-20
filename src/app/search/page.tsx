import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchProducts } from '@/lib/shopify/catalogue';
import { SEARCH_SORTS } from '@/lib/shopify/queries';
import { toSearchParams, type SearchParamsInput } from '@/lib/query-params';
import { Search } from 'lucide-react';
import { CursorPagination, SortLinks } from '@/components/commerce/browse-controls';
import { ProductGrid } from '@/components/commerce/product-card';
import { SearchForm } from '@/components/layout/search-form';
import { SectionHeading } from '@/components/ui/section';
import { EmptyCatalogueNotice, NotConfiguredNotice, SkeletonGrid, StatePanel } from '@/components/ui/states';
import { publicErrorMessage } from '@/lib/shopify/result';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 24;

type Props = { searchParams?: Promise<SearchParamsInput> };

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="shell py-8">
      <SectionHeading title="Search" />
      <SearchForm className="mb-6 max-w-xl" />
      <Suspense fallback={<SkeletonGrid count={12} />}>
        <SearchView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchView({ searchParams }: Props) {
  const params = toSearchParams((await searchParams) ?? {});
  const term = params.get('q')?.trim() ?? '';

  if (term.length === 0) {
    return (
      <StatePanel
        tone="neutral"
        title="What are you looking for?"
        description="Search the connected Shopify catalogue by product title, description or type."
      />
    );
  }

  const sort = params.get('sort') ?? undefined;
  const after = params.get('after') ?? undefined;
  const result = await searchProducts(term, { first: PAGE_SIZE, sort, after });

  if (result.status === 'not-configured') return <NotConfiguredNotice missing={result.missing} />;
  if (result.status === 'error') {
    return <StatePanel tone="error" title="Search is unavailable" description={publicErrorMessage(result)} />;
  }

  return (
    <>
      <p className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
        <Search size={14} aria-hidden />
        Results for <span className="font-semibold text-ink">“{term}”</span>
      </p>

      <div className="mb-5">
        <SortLinks basePath="/search" searchParams={params} options={SEARCH_SORTS} value={sort} />
      </div>

      {result.data.items.length === 0 ? (
        <EmptyCatalogueNotice subject={`results for “${term}”`} />
      ) : (
        <ProductGrid products={result.data.items} />
      )}

      <CursorPagination basePath="/search" searchParams={params} pageInfo={result.data.pageInfo} />
    </>
  );
}
