import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DiscountBadge({ percent }: { percent: number }) {
  if (!Number.isFinite(percent) || percent <= 0) return null;
  return <Badge className="bg-brand-600 text-white">{percent}% OFF</Badge>;
}

export function StockBadge({ available }: { available: boolean }) {
  return (
    <Badge className={available ? 'bg-positive-bg text-positive' : 'bg-cream text-ink-soft'}>
      {available ? 'In stock' : 'Out of stock'}
    </Badge>
  );
}
