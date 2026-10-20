import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getShop } from '@/lib/shopify/catalogue';
import { buttonClass } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section';
import { StatePanel } from '@/components/ui/states';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sign in to your HomeKart account.',
};

export default function AccountPage() {
  return (
    <div className="shell max-w-inner py-10">
      <SectionHeading title="Your account" />
      <Suspense fallback={<StatePanel tone="neutral" title="Checking account access…" description="Reading the store configuration." />}>
        <AccountStatus />
      </Suspense>
    </div>
  );
}

async function AccountStatus() {
  const result = await getShop();

  if (result.status === 'not-configured') {
    return (
      <StatePanel
        tone="warning"
        title="Sign-in is not available yet"
        description={
          <>
            Accounts are provided by the Shopify store, and this storefront is not connected to one.
            These environment variables are not set:
            <span className="mt-2 flex flex-wrap gap-1.5">
              {result.missing.map((name) => (
                <code key={name} className="rounded-md bg-cream px-1.5 py-0.5 font-mono text-xs text-ink">
                  {name}
                </code>
              ))}
            </span>
          </>
        }
      />
    );
  }

  if (result.status === 'error' || !result.data.customerAccountUrl) {
    return (
      <StatePanel
        tone="warning"
        title="Customer accounts are not switched on for this store"
        description="Shopify exposes an accounts page only when customer accounts are enabled in the store admin, under Settings → Customer accounts. Until then there is nothing to sign in to, and this page does not pretend otherwise."
      />
    );
  }

  return (
    <div className="rounded-card border border-line bg-white p-6">
      <h2 className="font-display text-lg font-bold">Sign in with {result.data.name}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Accounts, order history and saved addresses are managed by Shopify on its own hosted account
        pages. This storefront does not collect or store your password: email and password sign-in
        against the Storefront API is documented as legacy-only, so signing in here goes to Shopify and
        returns you to the store.
      </p>
      <a
        href={result.data.customerAccountUrl}
        className={buttonClass('primary', 'lg', 'mt-5')}
      >
        <Icon name="shield-check" className="size-4" />
        Sign in with Shopify
      </a>
      <p className="mt-3 text-xs text-ink-soft">
        Your wishlist is separate: it is saved in this browser only, and does not follow you between
        devices.
      </p>
    </div>
  );
}
