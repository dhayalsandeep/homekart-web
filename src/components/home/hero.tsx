import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonClass } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MediaTile } from '@/components/ui/media';

/**
 * The reference artwork shows a four-slide carousel, a "60 Minutes" delivery
 * card and an "Available in Mumbai" chip. None of that is reproduced: there is
 * no delivery SLA, no serviceability check and no approved slide set yet. A
 * single honest panel stands in its place, and the artwork is an abstract
 * placeholder rather than invented product photography.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-warm-white">
      <div className="shell pt-5 pb-2">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
          <div className="flex flex-col justify-center rounded-card bg-gradient-to-br from-cream via-warm-white to-sand/70 p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Home &amp; construction supplies
            </p>
            <h1
              id="hero-title"
              className="mt-2 font-display text-[34px] leading-[1.08] font-extrabold sm:text-5xl lg:text-[56px]"
            >
              Everything for a <span className="text-brand-500">Better Home</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              Tiles, sanitaryware, cement, steel, electrical, plumbing, paints, kitchen and
              furniture — one storefront for the whole job.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/collections" className={buttonClass('primary', 'lg')}>
                Browse categories
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                href="/collections/building-materials"
                className={buttonClass('secondary', 'lg')}
              >
                Explore construction
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <MediaTile
              label="Home and construction materials"
              icon="blocks"
              tone="brand"
              className="min-h-[220px] flex-1"
            />
            <Link
              href="/collections/building-materials"
              className="group flex items-center gap-3 rounded-card bg-ink p-4 text-white transition-colors hover:bg-brand-700 sm:p-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon name="package" className="size-5 text-white" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Construction materials</span>
                <span className="block truncate text-xs text-white/70">
                  Cement, sand, bricks, steel and adhesives
                </span>
              </span>
              <ArrowRight
                size={16}
                className="ml-auto shrink-0 text-white/60 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
