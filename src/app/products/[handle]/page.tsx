import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/shopify/catalogue';
import { formatMoney } from '@/lib/format';
import { ProductPurchasePanel } from '@/components/commerce/product-purchase-panel';
import { MediaTile, ProductMedia } from '@/components/ui/media';
import { NotConfiguredNotice, StatePanel } from '@/components/ui/states';
import { publicErrorMessage } from '@/lib/shopify/result';

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const result = await getProduct(handle);
  const title = result.status === 'ok' && result.data ? result.data.title : handle.replace(/-/g, ' ');
  const description =
    result.status === 'ok' && result.data ? (result.data.seo.description ?? undefined) : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="shell py-8">
      <Suspense fallback={<ProductFallback />}>
        <ProductView params={params} />
      </Suspense>
    </div>
  );
}

function ProductFallback() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]" aria-hidden>
      <div className="aspect-square w-full animate-pulse rounded-card bg-cream" />
      <div className="space-y-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-cream" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-cream" />
        <div className="h-12 w-full animate-pulse rounded-full bg-cream" />
      </div>
    </div>
  );
}

async function ProductView({ params }: Props) {
  const { handle } = await params;
  const result = await getProduct(handle);

  if (result.status === 'not-configured') return <NotConfiguredNotice missing={result.missing} />;
  if (result.status === 'error') {
    return <StatePanel tone="error" title="Could not load this product" description={publicErrorMessage(result)} />;
  }
  if (!result.data) notFound();

  const product = result.data;
  const gallery = product.images.length > 0 ? product.images : product.featuredImage ? [product.featuredImage] : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
      <div>
        {gallery.length > 0 ? (
          <ProductMedia
            src={gallery[0].url}
            alt={gallery[0].altText ?? product.title}
            label={product.title}
            icon="package"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        ) : (
          <MediaTile label={product.title} icon="package" className="aspect-square w-full" />
        )}

        {gallery.length > 1 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {gallery.slice(1).map((image) => (
              <li key={image.url} className="shrink-0">
                <div className="relative size-20 overflow-hidden rounded-tile border border-line bg-cream">
                  <Image
                    src={image.url}
                    alt={image.altText ?? `${product.title} view`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ProductPurchasePanel product={product} />

      <div className="lg:col-span-2 lg:max-w-3xl">
        {product.descriptionHtml ? (
          <section aria-labelledby="description-heading" className="border-t border-line pt-6">
            <h2 id="description-heading" className="mb-3 font-display text-lg font-bold">
              Product details
            </h2>
            {/*
              Merchant-authored HTML from this store's own product record. It is
              rendered as-is because Shopify product descriptions are rich text by
              design; it is never mixed with customer input.
            */}
            <div
              className="prose-homekart text-sm leading-relaxed text-ink-soft"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </section>
        ) : null}

        {product.vendor || product.productType ? (
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm sm:grid-cols-4">
            {product.vendor ? <Detail term="Brand" value={product.vendor} /> : null}
            {product.productType ? <Detail term="Type" value={product.productType} /> : null}
            <Detail term="Currency" value={product.price.currencyCode} />
            {product.variants[0]?.price ? (
              <Detail term="From" value={formatMoney(product.price) ?? '—'} />
            ) : null}
          </dl>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{term}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
