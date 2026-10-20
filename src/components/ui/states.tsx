import { CircleAlert, ImageOff, Info, Loader, PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'warning' | 'error';

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'bg-cream text-ink-soft',
  warning: 'bg-brand-50 text-brand-700',
  error: 'bg-brand-50 text-negative',
};

const TONE_ICON: Record<Tone, typeof Info> = {
  neutral: Info,
  warning: ImageOff,
  error: CircleAlert,
};

export function StatePanel({
  tone = 'neutral',
  title,
  description,
  action,
  className,
}: {
  tone?: Tone;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const IconComponent = TONE_ICON[tone];
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-start gap-3 rounded-card border border-dashed border-line bg-white p-6',
        className,
      )}
    >
      <span className={cn('flex size-9 items-center justify-center rounded-full', TONE_STYLES[tone])}>
        <IconComponent size={18} aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
      {action}
    </div>
  );
}

/**
 * Rendered whenever a Shopify read cannot happen because the store is not wired
 * up yet. Lists the variable *names* only — never values.
 */
export function NotConfiguredNotice({ missing }: { missing: readonly string[] }) {
  return (
    <StatePanel
      tone="warning"
      title="Storefront not connected to Shopify yet"
      description={
        <>
          Live products, prices, availability and checkout are unavailable because these environment
          variables are not set:
          <span className="mt-2 flex flex-wrap gap-1.5">
            {missing.map((name) => (
              <code key={name} className="rounded-md bg-cream px-1.5 py-0.5 font-mono text-xs text-ink">
                {name}
              </code>
            ))}
          </span>
          <span className="mt-1 block">
            Nothing here is mocked or hard-coded — this panel is the real state of the integration.
          </span>
        </>
      }
    />
  );
}

export function EmptyCatalogueNotice({ subject }: { subject: string }) {
  return (
    <StatePanel
      tone="neutral"
      title={`No ${subject} yet`}
      description="Shopify returned an empty result for this request. Add or publish products in the store and they will appear here."
      action={<span className="inline-flex items-center gap-1.5 text-xs text-ink-soft"><PackageOpen size={14} aria-hidden /> Source: Storefront API</span>}
    />
  );
}

export function LoadingPanel({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-ink-soft">
      <Loader size={16} className="animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function SkeletonGrid({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-card border border-line bg-white">
          <div className="aspect-square w-full animate-pulse bg-cream" />
          <div className="space-y-2 p-3">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-cream" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-cream" />
          </div>
        </div>
      ))}
    </div>
  );
}
