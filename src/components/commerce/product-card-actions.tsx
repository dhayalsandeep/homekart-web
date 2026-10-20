'use client';

import { Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart/cart-provider';
import { useWishlist } from '@/lib/wishlist/wishlist-provider';
import { cn } from '@/lib/cn';

export function ProductCardActions({
  productHandle,
  variantId,
  available,
  showWishlist = true,
}: {
  productHandle: string;
  variantId: string | null;
  available: boolean;
  showWishlist?: boolean;
}) {
  const { addItem, busy } = useCart();
  const wishlist = useWishlist();
  const [pending, setPending] = useState(false);
  const saved = wishlist.has(productHandle);

  async function onAdd() {
    if (!variantId) {
      // Without a merchandise id there is nothing honest to add; the detail page
      // is the correct place to choose a variant.
      return;
    }
    setPending(true);
    await addItem(variantId, 1);
    setPending(false);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      {showWishlist ? (
        <button
          type="button"
          onClick={() => wishlist.toggle(productHandle)}
          aria-pressed={saved}
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors',
            saved ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-600',
          )}
        >
          <Heart size={15} fill={saved ? 'currentColor' : 'none'} aria-hidden />
          <span className="sr-only">{saved ? 'Remove from wishlist' : 'Save to wishlist'}</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={onAdd}
        disabled={!available || !variantId || busy || pending}
        title={
          !variantId
            ? 'Choose options on the product page first'
            : !available
              ? 'Currently unavailable'
              : 'Add to cart'
        }
        className={cn(
          'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors',
          'bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-cream disabled:text-ink-soft',
        )}
      >
        <Plus size={15} aria-hidden />
        {available ? 'Add' : 'Unavailable'}
      </button>
    </div>
  );
}
