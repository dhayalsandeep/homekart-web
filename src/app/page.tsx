import { Suspense } from 'react';
import { getDeals } from '@/lib/shopify/catalogue';
import { BenefitsStrip } from '@/components/home/benefits-strip';
import { CategoryGrid } from '@/components/home/category-grid';
import { DealsRail } from '@/components/home/deal-rail';
import { Hero } from '@/components/home/hero';
import { FeatureBanners, PromoBanners } from '@/components/home/promo-banners';
import { PopularCollections } from '@/components/home/popular-collections';
import { SkeletonGrid } from '@/components/ui/states';

/**
 * `cacheComponents` is on, so anything read at request time must sit inside a
 * `<Suspense>` boundary — the static shell (hero, banners, category tiles) is
 * rendered ahead of time and only the Shopify-backed rail streams in.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <BenefitsStrip />
      <CategoryGrid />
      <PromoBanners />
      <Suspense fallback={<DealsFallback />}>
        <DealsSection />
      </Suspense>
      <FeatureBanners />
      <PopularCollections />
    </>
  );
}

function DealsFallback() {
  return (
    <section className="py-8 sm:py-10">
      <div className="shell">
        <div className="mb-5 h-8 w-48 animate-pulse rounded-lg bg-cream" aria-hidden />
        <SkeletonGrid count={6} />
      </div>
    </section>
  );
}

async function DealsSection() {
  const result = await getDeals(6);
  return <DealsRail result={result} viewAllHref="/products" />;
}
