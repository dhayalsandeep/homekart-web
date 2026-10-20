import { publicErrorMessage, type ShopifyResult } from '@/lib/shopify/result';
import type { ProductSummary } from '@/lib/shopify/types';
import { ProductCard } from '@/components/commerce/product-card';
import { EmptyCatalogueNotice, NotConfiguredNotice, StatePanel } from '@/components/ui/states';
import { Section, SectionHeading } from '@/components/ui/section';

/**
 * "Today's Deals" reads real products and real prices from Shopify. Two things
 * the reference artwork shows are deliberately absent:
 *
 * - no countdown timer — there is no scheduled-sale source to drive one, and a
 *   fake countdown is a fabricated urgency claim;
 * - no star ratings — the Storefront API only returns review data when a reviews
 *   app is installed, and none is configured.
 *
 * Discount badges appear only when Shopify supplies a compare-at price that is
 * genuinely above the selling price (see `discountPercent`).
 */
export function DealsRail({
  title = "Today's Deals",
  result,
  viewAllHref = '/collections',
}: {
  title?: string;
  result: ShopifyResult<readonly ProductSummary[]>;
  viewAllHref?: string;
}) {
  return (
    <Section className="pt-0">
      <SectionHeading title={title} actionLabel="View All Deals" actionHref={viewAllHref} />

      {renderBody(result)}
    </Section>
  );
}

function renderBody(result: ShopifyResult<readonly ProductSummary[]>) {
  if (result.status === 'not-configured') {
    return <NotConfiguredNotice missing={result.missing} />;
  }

  if (result.status === 'error') {
    return (
      <StatePanel
        tone="error"
        title="Could not load deals from Shopify"
        description={publicErrorMessage(result)}
      />
    );
  }

  if (result.data.length === 0) {
    return <EmptyCatalogueNotice subject="products" />;
  }

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
      {result.data.map((product) => (
        <div
          key={product.id}
          className="w-[46%] shrink-0 snap-start sm:w-auto sm:shrink"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
