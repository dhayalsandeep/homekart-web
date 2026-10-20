import Link from 'next/link';
import { BrandLogo } from '@/components/layout/brand-logo';
import { SearchForm } from '@/components/layout/search-form';
import { PincodeSelector } from '@/components/layout/pincode-selector';
import { AccountButton, CartButton, WishlistButton } from '@/components/layout/header-actions';

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-warm-white">
      <div className="shell flex h-[68px] items-center gap-3">
        <Link href="/" aria-label="HomeKart by Astafic — home" className="shrink-0">
          <BrandLogo visualHeight={26} />
        </Link>

        <SearchForm className="min-w-0 flex-1 max-lg:hidden" />

        <PincodeSelector />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 max-lg:ml-0">
          <AccountButton />
          <WishlistButton />
          <CartButton />
        </div>
      </div>

      <SearchForm compact className="px-4 pb-3 lg:hidden" />
    </header>
  );
}
