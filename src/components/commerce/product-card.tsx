import Link from 'next/link';
import { cn } from '@/lib/cn';
import { discountPercent, formatMoneyOrUnavailable } from '@/lib/format';
import type { ProductSummary } from '@/lib/shopify/types';
import { DiscountBadge } from '@/components/ui/badge';
import { ProductMedia } from '@/components/ui/media';
import { ProductCardActions } from '@/components/commerce/product-card-actions';

/**
 * No rating is rendered here: the Storefront API returns review data only when a
 * reviews integration is installed, and none is configured on this store yet.
 * Likewise no delivery chip — delivery speed is unverified. Both stay off until
 * there is a real source, per the "never invent" rule in the brief.
 */
export function ProductCard({
  product,
  className,
}: {
  product: ProductSummary;
  className?: string;
}) {
  const percent = discountPercent(product.price, product.compareAtPrice);
  const href = `/products/${product.handle}`;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-card',
        className,
      )}
    >
      <div className="relative">
        <Link href={href} aria-label={product.title} className="block">
          <ProductMedia
            src={product.featuredImage?.url}
            alt={product.featuredImage?.altText ?? product.title}
            label={product.title}
            icon="package"
          />
        </Link>
        {percent ? (
          <span className="absolute left-2 top-2">
            <DiscountBadge percent={percent} />
          </span>
        ) : null}
        {!product.availableForSale ? (
          <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold text-white">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          <Link href={href} className="hover:text-brand-600">
            {product.title}
          </Link>
        </h3>

        {product.options.length > 1 ? (
          <p className="mt-1 text-xs text-ink-soft">
            {product.options.length} options · choose on product page
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-ink">
            {formatMoneyOrUnavailable(product.price)}
          </span>
          {product.compareAtPrice?.amount ? (
            <span className="text-xs text-ink-soft line-through">
              {formatMoneyOrUnavailable(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto">
          <ProductCardActions
            productHandle={product.handle}
            variantId={product.singleVariantId}
            available={product.availableForSale}
          />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: readonly ProductSummary[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5',
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
