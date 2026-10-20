import Link from 'next/link';
import { popularCollections } from '@/lib/config/site';
import { Icon } from '@/components/ui/icon';
import { MediaTile } from '@/components/ui/media';
import { Section, SectionHeading } from '@/components/ui/section';

export function PopularCollections() {
  return (
    <Section className="pt-0">
      <SectionHeading title="Popular Collections" actionLabel="View All" actionHref="/collections" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {popularCollections.map((collection) => (
          <li key={collection.handle}>
            <Link
              href={collection.href}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-card"
            >
              <MediaTile
                label={collection.label}
                icon={collection.icon}
                tone="cream"
                rounded="rounded-none"
                className="aspect-[4/3] w-full"
              />
              <span className="flex items-start gap-2 p-3 text-sm font-medium leading-snug text-ink group-hover:text-brand-600">
                <Icon name={collection.icon} size={15} className="mt-0.5 shrink-0 text-brand-600" />
                {collection.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
