import Link from 'next/link';
import { categories } from '@/lib/config/site';
import { Icon } from '@/components/ui/icon';
import { Section, SectionHeading } from '@/components/ui/section';

/**
 * Circular category tiles, as in the reference. These link to Shopify collection
 * handles; an unmapped handle renders its own empty state rather than unrelated
 * products, so nothing here claims the catalogue exists yet.
 */
export function CategoryGrid() {
  return (
    <Section id="categories">
      <SectionHeading title="Shop by Category" actionLabel="View All Categories" actionHref="/collections" />
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
        {categories.map((entry) => (
          <li key={entry.handle}>
            <Link
              href={entry.href}
              className="group flex flex-col items-center gap-2.5 rounded-card p-2 text-center transition-colors hover:bg-cream"
            >
              <span className="flex size-16 items-center justify-center rounded-full border border-line bg-cream text-brand-600 transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 sm:size-[72px]">
                <Icon name={entry.icon} className="size-7" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-medium leading-tight text-ink sm:text-[13px]">
                {entry.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
