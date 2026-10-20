import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCollectionPage } from '@/lib/shopify/catalogue';
import { COLLECTION_SORTS } from '@/lib/shopify/queries';
import { toSearchParams, type SearchParamsInput } from '@/lib/query-params';
import { CursorPagination, SortLinks } from '@/components/commerce/browse-controls';
import { ProductGrid } from '@/components/commerce/product-card';
import { MediaTile, ProductMedia } from '@/components/ui/media';
import { EmptyCatalogueNotice, NotConfiguredNotice, SkeletonGrid, StatePanel } from '@/components/ui/states';
import { publicErrorMessage } from '@/lib/shopify/result';

const PAGE_SIZE = 24;

type Props = { params: Promise<{ handle: string }>; searchParams?: Promise<SearchParamsInput> };

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const result = await getCollectionPage(handle, { first: 1 });
  // A missing store or a missing collection both fall back to the handle: there is
  // nothing verified to say about it, and guessing a title would be fabrication.
  if (result.status !== 'ok' || !result.data) return { title: handle.replace(/-/g, ' ') };
  return {
    title: result.data.collection.title,
    description: result.data.collection.seo.description ?? result.data.collection.description ?? undefined,
  };
}

export default function CollectionPage({ params, searchParams }: Props) {
  return (
    <div className="shell py-8">
      <Suspense fallback={<CollectionFallback />}>
        <CollectionView params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function CollectionFallback() {
  return (
    <>
      <div className="mb-6 h-40 w-full animate-pulse rounded-card bg-cream" aria-hidden />
      <SkeletonGrid count={PAGE_SIZE} />
    </>
  );
}

async function CollectionView({ params, searchParams }: Props) {
  const { handle } = await params;
  const query = toSearchParams((await searchParams) ?? {});
  const sort = query.get('sort') ?? undefined;
  const after = query.get('after') ?? undefined;

  const result = await getCollectionPage(handle, { first: PAGE_SIZE, sort, after });

  if (result.status === 'not-configured') {
    return (
      <>
        <CollectionHeader handle={handle} title={null} description={null} image={null} />
        <NotConfiguredNotice missing={result.missing} />
      </>
    );
  }

  if (result.status === 'error') {
    return <StatePanel tone="error" title="Could not load this collection" description={publicErrorMessage(result)} />;
  }

  if (!result.data) {
    // The handle is not a collection in this store. That is a real 404, not a
    // reason to silently show a different catalogue.
    notFound();
  }

  const { collection, products } = result.data;
  const basePath = `/collections/${collection.handle}`;

  return (
    <>
      <CollectionHeader
        handle={collection.handle}
        title={collection.title}
        description={collection.description}
        image={collection.image}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SortLinks basePath={basePath} searchParams={query} options={COLLECTION_SORTS} value={sort} />
      </div>

      {products.items.length === 0 ? (
        <EmptyCatalogueNotice subject="products in this collection" />
      ) : (
        <ProductGrid products={products.items} />
      )}

      <CursorPagination basePath={basePath} searchParams={query} pageInfo={products.pageInfo} />
    </>
  );
}

function CollectionHeader({
  handle,
  title,
  description,
  image,
}: {
  handle: string;
  title: string | null;
  description: string | null;
  image: { url: string; altText: string | null } | null;
}) {
  const label = title ?? handle.replace(/-/g, ' ');
  return (
    <header className="mb-6">
      <div className="relative mb-4 hidden overflow-hidden rounded-card sm:block">
        {image ? (
          <ProductMedia
            src={image.url}
            alt={image.altText ?? label}
            label={label}
            aspect="aspect-[21/6]"
            sizes="100vw"
          />
        ) : (
          <MediaTile label={label} icon="layers" tone="sand" className="aspect-[21/6] w-full" rounded="rounded-none" />
        )}
      </div>
      <h1 className="font-display text-2xl font-bold sm:text-[28px]">{label}</h1>
      {description ? <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p> : null}
    </header>
  );
}
