import type { Metadata } from 'next';
import { WishlistView } from '@/components/commerce/wishlist-view';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Items saved on this device.',
};

export default function WishlistPage() {
  return (
    <div className="shell py-8">
      <h1 className="mb-1 font-display text-2xl font-bold sm:text-3xl">Your wishlist</h1>
      <p className="mb-5 text-sm text-ink-soft">
        Saved in this browser on this device. Shopify&apos;s Storefront API has no wishlist object, so
        this list does not follow you to another device or appear in your account.
      </p>
      <WishlistView />
    </div>
  );
}
