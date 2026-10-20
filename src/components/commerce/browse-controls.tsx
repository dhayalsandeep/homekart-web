import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PageInfo } from '@/lib/shopify/types';

function withParams(searchParams: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(searchParams);
  if (value === null) next.delete(key);
  else next.set(key, value);
  const query = next.toString();
  return query ? `?${query}` : '';
}

/**
 * Sorting is rendered as links rather than a `<select>` that posts: it keeps the
 * whole browse experience working without JavaScript, and every URL is
 * shareable. Only values the Storefront API accepts are offered.
 */
export function SortLinks({
  basePath,
  searchParams,
  options,
  value,
  label = 'Sort by',
}: {
  basePath: string;
  searchParams: URLSearchParams;
  options: readonly { value: string; label: string }[];
  value?: string;
  label?: string;
}) {
  const current = value ?? options[0]?.value ?? '';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <ul className="flex flex-wrap gap-1">
        {options.map((option) => {
          const active = option.value === current;
          const href = `${basePath}${withParams(searchParams, 'sort', active ? null : option.value)}`;
          return (
            <li key={option.value}>
              <Link
                href={href}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700'
                    : 'border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-600',
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Storefront connections are cursor-based — there is no page number to show, and
 * inventing "page 3 of 12" would require a `totalCount` these connections do not
 * return. So this is honestly just older/newer.
 */
export function CursorPagination({
  basePath,
  searchParams,
  pageInfo,
}: {
  basePath: string;
  searchParams: URLSearchParams;
  pageInfo: PageInfo;
}) {
  if (!pageInfo.hasPreviousPage && !pageInfo.hasNextPage) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
      {pageInfo.hasPreviousPage && pageInfo.startCursor ? (
        <Link
          href={`${basePath}${withParams(searchParams, 'after', null)}`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:border-brand-200 hover:text-brand-600"
        >
          <ArrowLeft size={15} aria-hidden />
          First page
        </Link>
      ) : (
        <span />
      )}

      {pageInfo.hasNextPage && pageInfo.endCursor ? (
        <Link
          href={`${basePath}${withParams(searchParams, 'after', pageInfo.endCursor)}`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          More items
          <ArrowRight size={15} aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
