import type { Money } from '@/lib/shopify/types';

const DEFAULT_CURRENCY = 'INR';
const DEFAULT_LOCALE = 'en-IN';

const cache = new Map<string, Intl.NumberFormat>();

function formatter(currencyCode: string, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}`;
  let instance = cache.get(key);
  if (!instance) {
    instance = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    cache.set(key, instance);
  }
  return instance;
}

/**
 * Shopify `Money.amount` is a decimal *string* (e.g. "1099.00"), never a number,
 * so it is parsed rather than trusted. Falls back to a currency-less render if
 * the store ever returns something unparseable instead of showing ₹NaN.
 */
export function formatMoney(money: Money | null | undefined, locale = DEFAULT_LOCALE): string | null {
  if (!money?.amount) return null;
  const value = Number.parseFloat(money.amount);
  if (!Number.isFinite(value)) return null;
  const currencyCode = money.currencyCode || DEFAULT_CURRENCY;
  try {
    return formatter(currencyCode, locale).format(value);
  } catch {
    return `${money.amount} ${currencyCode}`;
  }
}

export function formatMoneyOrUnavailable(money: Money | null | undefined, locale = DEFAULT_LOCALE): string {
  return formatMoney(money, locale) ?? 'Price on request';
}

/** Integer-only discount, and only when it is mathematically real. */
export function discountPercent(selling: Money | null | undefined, compareAt: Money | null | undefined): number | null {
  const now = Number.parseFloat(selling?.amount ?? '');
  const was = Number.parseFloat(compareAt?.amount ?? '');
  if (!Number.isFinite(now) || !Number.isFinite(was) || was <= 0 || now <= 0 || now >= was) return null;
  const pct = Math.round(((was - now) / was) * 100);
  return pct > 0 ? pct : null;
}

export function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}
