import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';
import { currentYear } from '@/lib/current-year';

const columns: readonly { title: string; links: readonly { label: string; href: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All categories', href: '/collections' },
      { label: 'Building materials', href: '/collections/building-materials' },
      { label: 'Tiles & bathroom', href: '/collections/tiles-bathroom' },
      { label: 'Kitchen & appliances', href: '/collections/kitchen-appliances' },
      { label: 'Furniture', href: '/collections/furniture' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { label: 'Sign in', href: '/account' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Cart', href: '/cart' },
    ],
  },
  {
    title: 'Search',
    links: [
      { label: 'Search products', href: '/search' },
      { label: 'Today’s deals', href: '/collections' },
    ],
  },
];

export async function SiteFooter() {
  const year = await currentYear();

  return (
    <footer className="mt-16 border-t border-line bg-cream">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Link href="/" className="inline-flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              Home<span className="text-brand-500">Kart</span>
            </span>
            <span className="text-xs text-ink-soft">{siteConfig.descriptor}</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">{siteConfig.shortDescription}</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-ink-soft transition-colors hover:text-brand-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.fullName}. Prices, availability and orders are served by Shopify.
          </p>
          <p>Returns, shipping and support pages are pending store configuration.</p>
        </div>
      </div>
    </footer>
  );
}
