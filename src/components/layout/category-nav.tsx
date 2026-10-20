'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, LayoutGrid, Menu, X } from 'lucide-react';
import { allCategories, categories, siteConfig } from '@/lib/config/site';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';

export function CategoryNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // The router is the source of truth for "the page changed", so both surfaces
  // are dismissed as part of rendering the new path rather than from an effect.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (drawerOpen) setDrawerOpen(false);
    if (moreOpen) setMoreOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <div className="border-b border-line bg-warm-white">
        <nav aria-label="Primary" className="shell flex h-12 items-center gap-1">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <LayoutGrid size={15} aria-hidden />
            All Categories
          </button>

          <ul className="ml-2 hidden min-w-0 items-center gap-0.5 overflow-x-auto no-scrollbar lg:flex">
            <li>
              <NavLink href="/" active={pathname === '/'}>
                Home
              </NavLink>
            </li>
            {categories.slice(0, 8).map((entry) => (
              <li key={entry.handle + entry.label}>
                <NavLink href={entry.href} active={pathname === entry.href}>
                  {entry.label}
                </NavLink>
              </li>
            ))}
            <li className="relative">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="true"
                onClick={() => setMoreOpen((value) => !value)}
                className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-full px-3 text-sm text-ink transition-colors hover:bg-cream"
              >
                More
                <ChevronDown size={14} aria-hidden className={cn('transition-transform', moreOpen && 'rotate-180')} />
              </button>
              {moreOpen ? (
                <div className="absolute right-0 top-11 z-40 w-60 rounded-card border border-line bg-white p-2 shadow-pop">
                  <ul className="space-y-0.5">
                    {allCategories.slice(8).map((entry) => (
                      <li key={`more-${entry.handle}-${entry.label}`}>
                        <Link
                          href={entry.href}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink transition-colors hover:bg-cream"
                        >
                          <Icon name={entry.icon} size={15} className="text-brand-600" />
                          {entry.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          </ul>

          <Link
            href="/collections"
            className="ml-auto hidden shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 lg:inline-flex"
          >
            Browse all <ArrowRight size={14} aria-hidden />
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="ml-auto inline-flex size-9 items-center justify-center rounded-full text-ink hover:bg-cream lg:hidden"
          >
            <Menu size={19} aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
        </nav>
      </div>

      {drawerOpen ? <CategoryDrawer onClose={() => setDrawerOpen(false)} /> : null}
    </>
  );
}

/**
 * The active-link styling needs the URL, which is runtime data under
 * `cacheComponents`, so the nav streams in behind this. It mirrors the real bar's
 * height and padding to keep the sticky header from shifting when it lands.
 */
export function CategoryNavFallback() {
  return (
    <div className="border-b border-line bg-warm-white" aria-hidden>
      <div className="shell flex h-12 items-center gap-3">
        <span className="h-9 w-36 shrink-0 rounded-full bg-cream" />
        <span className="hidden gap-2 lg:flex">
          {['w-20', 'w-24', 'w-16', 'w-24', 'w-20', 'w-16'].map((width) => (
            <span key={width} className={`h-6 rounded-full bg-cream ${width}`} />
          ))}
        </span>
        <span className="ml-auto size-9 rounded-full bg-cream lg:hidden" />
      </div>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-sm transition-colors',
        active ? 'font-semibold text-brand-600' : 'text-ink hover:bg-cream',
      )}
    >
      {children}
    </Link>
  );
}

function CategoryDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close menu" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All categories"
        className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col bg-white shadow-pop"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="font-display text-base font-bold text-ink">All Categories</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-full text-ink hover:bg-cream"
          >
            <X size={18} aria-hidden />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          <li>
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream">
              <Icon name="home" size={17} className="text-brand-600" />
              Home
            </Link>
          </li>
          {allCategories.map((entry) => (
            <li key={`drawer-${entry.label}`}>
              <Link
                href={entry.href}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream"
              >
                <Icon name={entry.icon} size={17} className="mt-0.5 shrink-0 text-brand-600" />
                <span className="min-w-0">
                  <span className="block font-medium">{entry.label}</span>
                  <span className="block text-xs text-ink-soft">{entry.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-line p-4 text-xs leading-relaxed text-ink-soft">
          Category pages read from Shopify collections named for {siteConfig.name}. A collection that does not exist in
          the store yet shows an explanatory empty state instead of unrelated products.
        </div>
      </div>
    </div>
  );
}
