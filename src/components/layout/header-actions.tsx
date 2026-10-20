'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-provider';
import { useWishlist } from '@/lib/wishlist/wishlist-provider';
import { cn } from '@/lib/cn';

const LINK_BASE =
  'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-ink transition-colors hover:bg-cream';

function CountBubble({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-0.5 top-0 flex min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-[18px] text-white"
      aria-live="polite"
    >
      <span aria-hidden>{count > 99 ? '99+' : count}</span>
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
}

export function AccountButton() {
  return (
    <Link href="/account" className={LINK_BASE}>
      <UserGlyph />
      <span className="text-[11px] leading-none">Account</span>
    </Link>
  );
}

function UserGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" strokeLinecap="round" />
    </svg>
  );
}

export function WishlistButton({ className }: { className?: string }) {
  const { count } = useWishlist();
  return (
    <Link href="/wishlist" className={cn(LINK_BASE, className)}>
      <Heart size={19} strokeWidth={1.7} aria-hidden />
      <CountBubble count={count} label="saved items" />
      <span className="text-[11px] leading-none">Wishlist</span>
    </Link>
  );
}

export function CartButton({ className }: { className?: string }) {
  const { count, open, loading } = useCart();
  return (
    <button type="button" onClick={open} className={cn(LINK_BASE, className)}>
      <ShoppingCart size={19} strokeWidth={1.7} aria-hidden />
      <CountBubble count={count} label={count === 1 ? 'item in cart' : 'items in cart'} />
      <span className="text-[11px] leading-none">Cart</span>
      {loading ? <span className="sr-only">Loading cart</span> : null}
    </button>
  );
}
