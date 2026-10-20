import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-start justify-center gap-4 py-16">
      <p className="font-mono text-sm text-brand-600">404</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">We could not find that page</h1>
      <p className="max-w-lg text-base leading-relaxed text-ink-soft">
        The address may be mistyped, or it may point at a product or collection that is not published
        in the connected Shopify store yet.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/" className={buttonClass('primary', 'md')}>
          Back to home
        </Link>
        <Link href="/collections" className={buttonClass('secondary', 'md')}>
          Browse categories
        </Link>
      </div>
    </div>
  );
}
