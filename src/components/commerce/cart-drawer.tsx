'use client';

import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-provider';
import { formatMoneyOrUnavailable } from '@/lib/format';
import { ProductMedia } from '@/components/ui/media';
import { Button, ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function CartDrawer() {
  const { isOpen, close, cart, message, busy, setQuantity, removeItem } = useCart();
  if (!isOpen) return null;

  const lines = cart?.lines ?? [];

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close cart" onClick={close} className="absolute inset-0 bg-ink/40" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-[min(92vw,420px)] flex-col bg-white shadow-pop"
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <h2 className="font-display text-base font-bold text-ink">
            Your cart {cart ? <span className="text-ink-soft">({cart.totalQuantity})</span> : null}
          </h2>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-8 items-center justify-center rounded-full text-ink hover:bg-cream"
          >
            <X size={18} aria-hidden />
            <span className="sr-only">Close cart</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {message ? (
            <p className="rounded-card border border-dashed border-line bg-cream px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
              {message}
            </p>
          ) : null}

          {!message && lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-cream text-ink-soft">
                <ShoppingCart size={20} aria-hidden />
              </span>
              <p className="text-sm font-medium text-ink">Your cart is empty</p>
              <p className="max-w-[26ch] text-xs leading-relaxed text-ink-soft">
                Items you add will be held in a Shopify cart, so they survive a return visit.
              </p>
              <ButtonLink href="/collections" variant="primary" size="sm" onClick={close}>
                Start shopping
              </ButtonLink>
            </div>
          ) : null}

          <ul className="space-y-3">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3">
                <ProductMedia
                  src={line.image?.url}
                  alt={line.title}
                  label={line.title}
                  className="size-20 shrink-0 rounded-tile"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{line.title}</p>
                  <p className="truncate text-xs text-ink-soft">{line.variantTitle}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatMoneyOrUnavailable(line.linePrice)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <QtyButton
                        label={`Decrease ${line.title}`}
                        disabled={busy}
                        onClick={() => void setQuantity(line.id, Math.max(1, line.quantity - 1))}
                      >
                        <Minus size={13} aria-hidden />
                      </QtyButton>
                      <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                      <QtyButton label={`Increase ${line.title}`} disabled={busy} onClick={() => void setQuantity(line.id, line.quantity + 1)}>
                        <Plus size={13} aria-hidden />
                      </QtyButton>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeItem(line.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-ink-soft hover:bg-cream hover:text-negative disabled:opacity-50"
                    >
                      <Trash2 size={13} aria-hidden /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {lines.length > 0 ? (
          <footer className="space-y-3 border-t border-line px-4 py-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-soft">Subtotal</span>
              <span className="font-display text-lg font-bold text-ink">
                {formatMoneyOrUnavailable(cart?.subtotal)}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-soft">
              Shipping, taxes and discounts are calculated by Shopify at checkout.
            </p>
            {cart?.checkoutUrl ? (
              <a
                href={cart.checkoutUrl}
                className="flex h-11 w-full items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white hover:bg-brand-700"
              >
                Checkout on Shopify
              </a>
            ) : (
              <Button disabled className="w-full">
                Checkout unavailable
              </Button>
            )}
            <ButtonLink href="/cart" variant="ghost" size="sm" className="w-full" onClick={close}>
              View full cart
            </ButtonLink>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

function QtyButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn('flex size-7 items-center justify-center rounded-full text-ink hover:bg-cream disabled:opacity-50')}
    >
      {children}
    </button>
  );
}
