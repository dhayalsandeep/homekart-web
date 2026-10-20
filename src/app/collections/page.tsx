import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { listCollections } from '@/lib/shopify/catalogue';
import { ProductMedia } from '@/components/ui/media';
import { SectionHeading } from '@/components/ui/section';
import { EmptyCatalogueNotice, NotConfiguredNotice, StatePanel } from '@/components/ui/states';
import { publicErrorMessage } from '@/lib/shopify/result';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Collections published in the connected Shopify store.',
};

export default function CollectionsPage() {
  return (
    <div className="shell py-8">
      <SectionHeading title="Categories" actionLabel="All products" actionHref="/products" />
      <Suspense fallback={<CollectionsFallback />}>
        <CollectionsView />
      </Suspense>
    </div>
  );
}

function CollectionsFallback() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="aspect-[4/3] animate-pulse rounded-card bg-cream" />
      ))}
    </div>
  );
}

async function CollectionsView() {
  const result = await listCollections(60);

  if (result.status === 'not-configured') return <NotConfiguredNotice missing={result.missing} />;
  if (result.status === 'error') {
    return <StatePanel tone="error" title="Could not load collections" description={publicErrorMessage(result)} />;
  }

  if (result.data.length === 0) {
    return <EmptyCatalogueNotice subject="collections" />;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {result.data.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`/collections/${collection.handle}`}
            className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-card"
          >
            <ProductMedia
              src={collection.image?.url}
              alt={collection.image?.altText ?? collection.title}
              label={collection.title}
              icon="layers"
              aspect="aspect-[4/3]"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
            <span className="p-3">
              <span className="block text-sm font-semibold text-ink group-hover:text-brand-600">
                {collection.title}
              </span>
              {collection.description ? (
                <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-ink-soft">
                  {collection.description}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
