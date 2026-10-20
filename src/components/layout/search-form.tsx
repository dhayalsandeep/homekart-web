'use client';

import { Search } from 'lucide-react';
import { searchPlaceholder } from '@/lib/config/site';

export function SearchForm({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <form action="/search" method="get" role="search" className={className}>
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
        />
        <input
          id="site-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder={searchPlaceholder}
          className={
            'w-full rounded-full border border-line bg-white text-sm text-ink placeholder:text-ink-soft ' +
            'focus:border-brand-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ' +
            (compact ? 'h-10 pl-10 pr-12' : 'h-11 pl-10 pr-12')
          }
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
        >
          <Search size={16} aria-hidden />
          <span className="sr-only">Search</span>
        </button>
      </div>
    </form>
  );
}
