import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { featureBanners, promoBanners, type IconName, type PromoBanner } from '@/lib/config/site';
import { MediaTile } from '@/components/ui/media';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/cn';

const TONE_ICON: Record<PromoBanner['tone'], IconName> = {
  sand: 'layers',
  brand: 'package',
  ink: 'utensils-crossed',
};

function PromoCard({ banner, tall = false }: { banner: PromoBanner; tall?: boolean }) {
  const onDark = banner.tone === 'ink' || banner.tone === 'brand';

  return (
    <article
      className={cn(
        'relative isolate flex flex-col justify-end overflow-hidden rounded-card border border-line p-5 sm:p-6',
        tall ? 'min-h-[260px]' : 'min-h-[200px]',
      )}
    >
      <div className="absolute inset-0 -z-10">
        <MediaTile
          label={banner.title}
          icon={TONE_ICON[banner.tone]}
          tone={banner.tone}
          dark={onDark}
          rounded="rounded-none"
          className="h-full w-full"
        />
      </div>
      <div
        className={cn(
          'absolute inset-0 -z-10 bg-gradient-to-t',
          onDark ? 'from-ink/80 via-ink/40 to-transparent' : 'from-white/90 via-white/50 to-transparent',
        )}
        aria-hidden
      />
      <div className="relative">
        <h3 className={cn('font-display text-xl font-bold sm:text-2xl', onDark ? 'text-white' : 'text-ink')}>
          {banner.title}
        </h3>
        <p className={cn('mt-1.5 max-w-sm text-sm', onDark ? 'text-white/85' : 'text-ink-soft')}>
          {banner.copy}
        </p>
        <Link
          href={banner.href}
          className={cn(
            'mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50',
            !onDark && 'border border-line',
          )}
        >
          {banner.cta}
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function PromoBanners() {
  return (
    <Section className="pt-0">
      <h2 className="sr-only">Featured promotions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {promoBanners.map((banner) => (
          <PromoCard key={banner.id} banner={banner} tall />
        ))}
      </div>
    </Section>
  );
}

export function FeatureBanners() {
  return (
    <Section className="pt-0">
      <h2 className="sr-only">Highlights</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {featureBanners.map((banner) => (
          <PromoCard key={banner.id} banner={banner} />
        ))}
      </div>
    </Section>
  );
}
