import { benefits, type Benefit } from '@/lib/config/site';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';

/**
 * Renders only claims the business has confirmed. Every entry in `benefits`
 * starts disabled with a `requires` note explaining what has to become true
 * first, so this strip is empty on a fresh checkout — that is the intended
 * state, not a bug. Flip `enabled` in src/lib/config/site.ts per claim.
 */
export function BenefitsStrip({ className }: { className?: string }) {
  const live = benefits.filter((benefit) => benefit.enabled);
  if (live.length === 0) return null;

  return (
    <section aria-label="Service highlights" className={cn('shell', className)}>
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {live.map((benefit) => (
          <BenefitItem key={benefit.id} benefit={benefit} />
        ))}
      </ul>
    </section>
  );
}

function BenefitItem({ benefit }: { benefit: Benefit }) {
  return (
    <li className="flex items-center gap-3 bg-cream/60 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon name={benefit.icon} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{benefit.title}</span>
        <span className="block truncate text-xs text-ink-soft">{benefit.detail}</span>
      </span>
    </li>
  );
}
