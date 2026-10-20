'use client';

import { useMemo, useState } from 'react';
import { Check, Heart, Minus, Plus } from 'lucide-react';
import { discountPercent, formatMoney } from '@/lib/format';
import type { ProductDetail, ProductVariant } from '@/lib/shopify/types';
import { useCart } from '@/lib/cart/cart-provider';
import { useWishlist } from '@/lib/wishlist/wishlist-provider';
import { cn } from '@/lib/cn';
import { StatePanel } from '@/components/ui/states';

function initialSelection(product: ProductDetail): Record<string, string> {
  const selection: Record<string, string> = {};
  for (const option of product.options) {
    const first = option.values[0];
    if (first) selection[option.name] = first;
  }
  return selection;
}

function findVariant(product: ProductDetail, selection: Record<string, string>): ProductVariant | null {
  const names = product.options.map((option) => option.name);
  if (names.length === 0) return product.variants[0] ?? null;
  return (
    product.variants.find((variant) =>
      names.every((name) => {
        const chosen = selection[name];
        const actual = variant.selectedOptions.find((option) => option.name === name)?.value;
        return chosen !== undefined && chosen === actual;
      }),
    ) ?? null
  );
}

/**
 * Options are chosen here, on the detail page, because that is the only place
 * the customer's selection is known. A card never guesses a variant on the
 * customer's behalf.
 *
 * Availability comes from `variant.availableForSale`, which Shopify derives from
 * inventory. No stock *count* is shown: `quantityAvailable` is nullable and a
 * missing value must not be rendered as "0 left".
 */
export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const [selection, setSelection] = useState(() => initialSelection(product));
  const [quantity, setQuantity] = useState(1);
  const { addItem, busy } = useCart();
  const wishlist = useWishlist();

  const variant = useMemo(() => findVariant(product, selection), [product, selection]);
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const percent = discountPercent(price, compareAt);
  const available = variant?.availableForSale ?? false;
  const saved = wishlist.has(product.handle);

  return (
    <div className="lg:sticky lg:top-24">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.title}</h1>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-bold text-ink">{formatMoney(price) ?? 'Price on request'}</span>
        {compareAt && percent ? (
          <>
            <span className="text-sm text-ink-soft line-through">{formatMoney(compareAt)}</span>
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              {percent}% OFF
            </span>
          </>
        ) : null}
      </div>

      {product.options.length > 0 ? (
        <dl className="mt-6 space-y-4">
          {product.options.map((option) => (
            <div key={option.name}>
              <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {option.name}
                {selection[option.name] ? <span className="ml-1 normal-case text-ink">: {selection[option.name]}</span> : null}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const active = selection[option.name] === value;
                  return (
                    <button
                      key={`${option.name}-${value}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelection((current) => ({ ...current, [option.name]: value }))}
                      className={cn(
                        'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
                        active
                          ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700'
                          : 'border-line bg-white text-ink hover:border-brand-200',
                      )}
                    >
                      {active ? <Check size={13} aria-hidden /> : null}
                      {value}
                    </button>
                  );
                })}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="inline-flex size-9 items-center justify-center text-ink-soft hover:text-brand-600"
          >
            <Minus size={15} aria-hidden />
            <span className="sr-only">Decrease quantity</span>
          </button>
          <span className="min-w-8 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(100, value + 1))}
            className="inline-flex size-9 items-center justify-center text-ink-soft hover:text-brand-600"
          >
            <Plus size={15} aria-hidden />
            <span className="sr-only">Increase quantity</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => void wishlist.toggle(product.handle)}
          aria-pressed={saved}
          className="inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-brand-200 hover:text-brand-600"
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden />
          <span className="sr-only">{saved ? 'Remove from wishlist' : 'Save to wishlist'}</span>
        </button>
      </div>

      <button
        type="button"
        disabled={!variant || !available || busy}
        onClick={() => variant && void addItem(variant.id, quantity)}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cream disabled:text-ink-soft sm:w-auto"
      >
        {available ? 'Add to cart' : 'Unavailable'}
      </button>

      {variant ? (
        <p className="mt-3 text-xs text-ink-soft">
          {variant.sku ? `SKU ${variant.sku} · ` : ''}
          {available ? 'Available to order' : 'Currently out of stock'}
        </p>
      ) : (
        <StatePanel
          tone="neutral"
          className="mt-4"
          title="This combination is not sold"
          description="Pick a different option above. Only combinations Shopify lists for this product can be added."
        />
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-soft">
        Prices include any taxes configured in Shopify. Shipping is calculated at checkout.
      </p>
    </div>
  );
}
