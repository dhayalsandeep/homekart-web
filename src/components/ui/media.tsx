import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/lib/config/site';

const TONES = {
  cream: 'from-cream via-sand/60 to-sand',
  sand: 'from-sand via-brand-100/70 to-brand-200/70',
  brand: 'from-brand-100 via-brand-200/80 to-brand-400/60',
  ink: 'from-ink via-ink to-brand-700',
} as const;

export type MediaTone = keyof typeof TONES;

/**
 * Stand-in artwork for slots that need real Shopify media (or approved brand
 * photography) before launch. It is deliberately abstract: no invented product
 * imagery, no fake photography, and it is announced to assistive tech as a
 * placeholder rather than a product picture.
 */
export function MediaTile({
  label,
  icon,
  tone = 'cream',
  className,
  dark = false,
  rounded = 'rounded-card',
}: {
  label: string;
  icon?: IconName;
  tone?: MediaTone;
  className?: string;
  dark?: boolean;
  rounded?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} — placeholder artwork, awaiting real imagery`}
      className={cn('relative isolate overflow-hidden bg-gradient-to-br', TONES[tone], rounded, className)}
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 14px)',
        }}
        aria-hidden
      />
      <div className="relative flex h-full w-full items-center justify-center">
        {icon ? (
          <Icon name={icon} className={cn('size-10', dark ? 'text-white/85' : 'text-brand-700/70')} strokeWidth={1.25} />
        ) : null}
      </div>
      <span
        className={cn(
          'absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-medium',
          dark ? 'bg-black/25 text-white/90' : 'bg-white/70 text-ink-soft',
        )}
      >
        Placeholder
      </span>
    </div>
  );
}

/** Shopify-backed media when present, an honest placeholder when it is not. */
export function ProductMedia({
  src,
  alt,
  label,
  icon,
  tone = 'cream',
  className,
  aspect = 'aspect-square',
  sizes = '(min-width: 1280px) 220px, (min-width: 768px) 30vw, 45vw',
}: {
  src: string | null | undefined;
  alt: string;
  label: string;
  icon?: IconName;
  tone?: MediaTone;
  className?: string;
  /** A single aspect class; passed through rather than merged so it cannot collide. */
  aspect?: string;
  sizes?: string;
}) {
  if (!src) {
    return <MediaTile label={label} icon={icon} tone={tone} className={cn(aspect, 'w-full', className)} />;
  }
  return (
    <div className={cn('relative', aspect, 'w-full overflow-hidden bg-cream', className)}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" loading="lazy" />
    </div>
  );
}
