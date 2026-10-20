'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist/wishlist-provider';
import { buttonClass } from '@/components/ui/button';
import { StatePanel } from '@/components/ui/states';

/**
 * Lists what this browser has saved. Product titles, prices and images are not
 * cached here — they are read live on the product page, so a saved item can
 * never show a stale price. Hydrating this list into cards needs the Storefront
 * `product(handle:)` query for each saved handle, which is part of the Shopify
 * work still awaiting credentials.
 */
export function WishlistView() {
  const { handles, remove, clear } = useWishlist();

  if (handles.length === 0) {
    return (
      <StatePanel
        tone="neutral"
        title="Nothing saved yet"
        description="Use the heart on any product to save it here on this device."
        action={
          <Link href="/collections" className={buttonClass('primary', 'md')}>
            Browse categories
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {handles.length} item{handles.length === 1 ? '' : 's'} saved on this device
        </p>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-negative"
        >
          <Trash2 size={14} aria-hidden />
          Clear all
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {handles.map((handle) => (
          <li
            key={handle}
            className="flex items-center gap-3 rounded-card border border-line bg-white p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Heart size={16} fill="currentColor" aria-hidden />
            </span>
            <Link
              href={`/products/${handle}`}
              className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:text-brand-600"
            >
              {handle.replace(/-/g, ' ')}
              <span className="sr-only"> — open product page</span>
            </Link>
            <Link
              href={`/products/${handle}`}
              className="inline-flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-cream hover:text-brand-600"
            >
              <ArrowRight size={15} aria-hidden />
              <span className="sr-only">Open {handle.replace(/-/g, ' ')}</span>
            </Link>
            <button
              type="button"
              onClick={() => remove(handle)}
              className="inline-flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-cream hover:text-negative"
            >
              <Trash2 size={15} aria-hidden />
              <span className="sr-only">Remove {handle.replace(/-/g, ' ')} from wishlist</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
