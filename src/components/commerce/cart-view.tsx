'use client';

import Link from 'next/link';
import { Loader, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { useCart } from '@/lib/cart/cart-provider';
import { buttonClass } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ProductMedia } from '@/components/ui/media';
import { StatePanel } from '@/components/ui/states';

export function CartView() {
  const { cart, loading, busy, message, setQuantity, removeItem } = useCart();

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-ink-soft" role="status">
        <Loader size={16} className="animate-spin" aria-hidden />
        Loading your cart…
      </div>
    );
  }

  if (message && !cart) {
    return <StatePanel tone="warning" title="Cart unavailable" description={message} />;
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <StatePanel
        tone="neutral"
        title="Your cart is empty"
        description="Items you add will appear here. Prices shown at checkout are calculated by Shopify."
        action={
          <Link href="/" className={buttonClass('primary', 'md')}>
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
        {cart.lines.map((line) => {
          const unit = formatMoney(line.unitPrice, 'en-IN');
          const lineTotal = formatMoney(line.linePrice, 'en-IN');
          return (
            <li key={line.id} className="flex gap-4 p-4">
              {line.productHandle ? (
                <Link href={`/products/${line.productHandle}`} className="shrink-0">
                  <ProductMedia
                    src={line.image?.url}
                    alt={line.title}
                    label={line.title}
                    icon="package"
                    className="w-20 rounded-tile sm:w-24"
                  />
                </Link>
              ) : (
                <ProductMedia
                  src={line.image?.url}
                  alt={line.title}
                  label={line.title}
                  icon="package"
                  className="w-20 shrink-0 rounded-tile sm:w-24"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{line.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {line.variantTitle && line.variantTitle !== 'Default Title' ? line.variantTitle : 'Standard'}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {unit ? `${unit} each` : 'Price on request'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() => void setQuantity(line.id, line.quantity - 1)}
                      disabled={busy}
                      className="inline-flex size-8 items-center justify-center text-ink-soft hover:text-brand-600 disabled:opacity-50"
                    >
                      <Minus size={14} aria-hidden />
                      <span className="sr-only">Decrease quantity of {line.title}</span>
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => void setQuantity(line.id, line.quantity + 1)}
                      disabled={busy}
                      className="inline-flex size-8 items-center justify-center text-ink-soft hover:text-brand-600 disabled:opacity-50"
                    >
                      <Plus size={14} aria-hidden />
                      <span className="sr-only">Increase quantity of {line.title}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void removeItem(line.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-negative disabled:opacity-50"
                  >
                    <Trash2 size={14} aria-hidden />
                    Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold text-ink">{lineTotal ?? '—'}</p>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-card border border-line bg-white p-5">
        <h2 className="font-display text-lg font-bold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">Items</dt>
            <dd className="tabular-nums">{cart.totalQuantity}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(cart.subtotal, 'en-IN') ?? '—'}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Shipping, taxes and any discounts are calculated by Shopify at checkout. This storefront does
          not compute them locally.
        </p>

        {cart.checkoutUrl ? (
          <a
            href={cart.checkoutUrl}
            className={buttonClass('primary', 'lg', 'mt-4 w-full')}
          >
            <Icon name="bolt" className="size-4" />
            Checkout on Shopify
          </a>
        ) : (
          <button type="button" disabled className={buttonClass('primary', 'lg', 'mt-4 w-full')}>
            Checkout unavailable
          </button>
        )}

        <Link href="/" className={buttonClass('secondary', 'md', 'mt-2 w-full')}>
          <ShoppingBag size={16} aria-hidden />
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
