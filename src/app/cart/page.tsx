import type { Metadata } from 'next';
import { CartView } from '@/components/commerce/cart-view';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review the items in your cart before checking out with Shopify.',
};

export default function CartPage() {
  return (
    <div className="shell py-8">
      <h1 className="mb-5 font-display text-2xl font-bold sm:text-3xl">Your cart</h1>
      <CartView />
    </div>
  );
}
