import { cacheLife } from 'next/cache';

/**
 * Under `cacheComponents` a bare `new Date()` blocks prerendering because the
 * value differs between renders. Caching the year keeps every page that renders
 * the footer static; the weekly expiry means the copyright line can lag 1 January
 * by a few days, which is the right trade against making the whole site dynamic
 * just to print a number.
 */
export async function currentYear(): Promise<number> {
  'use cache';
  cacheLife('weeks');
  return new Date().getFullYear();
}
