# HomeKart by Astafic

Storefront for an Indian home-improvement and construction-materials catalogue, built on Next.js 16 (App Router) with the Shopify Storefront GraphQL API as the source of every product, price, cart and checkout.

The UI is complete and runs without credentials: every commerce surface renders an explicit "not connected to Shopify yet" state instead of invented content.

## Status

| Area | State |
| --- | --- |
| Design system, layout shell, header, category nav, footer | Implemented, renders statically |
| Homepage sections (hero, benefits, categories, promos, deals rail, collections) | Implemented; data-driven sections show a notice until the store is connected |
| `/products`, `/collections`, `/search` browse + cursor pagination + sorting | Implemented, reads Shopify when configured |
| `/products/[handle]` gallery, variant picker, add to cart | Implemented, reads Shopify when configured |
| Cart (`/api/cart` + `/cart` + drawer) | Implemented against the Cart API contract; unverifiable without a store |
| Wishlist | Implemented as device-local storage (the Storefront API has no wishlist object) |
| `/account` | Implemented as a link to Shopify's hosted accounts page |
| Orders, addresses, password sign-in | Not implemented — needs the Customer Account API (see below) |
| Live products, prices, inventory, checkout | **Awaiting Shopify credentials** |

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the two Shopify values
npm run dev
```

| Variable | Required | Notes |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | yes | `my-store.myshopify.com`; a scheme and trailing slash are stripped |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | yes | Storefront API token, sent only in a server-side header — never to the browser |
| `SHOPIFY_STOREFRONT_API_VERSION` | no | Defaults to `2026-10`, the version this code was written and type-checked against |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical/metadata base, defaults to `http://localhost:3000` |

`.env.local` is git-ignored; `.env.example` is tracked so the required keys stay documented.

## Checks

```bash
npm run lint      # eslint (flat config; `next lint` no longer exists in Next 16)
npx tsc --noEmit
npm run build     # every route prerenders (static or partial-prerender); only /api/cart is dynamic
```

## Deliberately not invented

The reference artwork advertises things the store cannot yet back up. Those are switched off in code, not just commented out, so they cannot appear by accident:

- **No countdown timers.** The Storefront API exposes no scheduled-sale object, so nothing can be timed.
- **No "60 minute delivery" badge.** `siteConfig.deliveryPromise.enabled` is `false`; a serviceability check does not exist.
- **No star ratings.** Ratings require a review integration that is not connected.
- **Discount badges only when the math is real** — computed from Shopify's `priceRange` versus `compareAtPriceRange`; a product with no compare-at price is never labelled a deal.
- **"Today's Deals" only lists products that are actually marked down**, filtered per product after the read.
- **No email/password login form.** `customerAccessTokenCreate` is documented as legacy-accounts-only, so `/account` links to `Shop.customerAccountUrl` and says so.
- **No stock counts.** Availability comes from `availableForSale`; the queries never ask for `quantityAvailable`, which is nullable anyway, so nothing sells "3 left" that Shopify cannot confirm.

## Architecture

```
src/lib/shopify/    client.ts (fetch + cache split), queries.ts (fragments), mappers.ts, catalogue.ts, cart.ts, types.ts
src/lib/config/     env.ts (credential gating), site.ts (nav, categories, copy), tokens.ts (colour measurements)
src/lib/cart/       wire contract shared by the provider and /api/cart, provider
src/app/api/cart/   the only place the Storefront token is used for cart traffic
src/components/     layout/ · home/ · commerce/ · ui/
```

Two rules hold it together:

1. **`shopifyQuery` is cached, `shopifyUncached` is not.** Catalogue reads go through `'use cache'` with cache tags; every cart read and mutation bypasses it, because a per-visitor cart in the shared data cache would leak one customer's cart into another's render.
2. **The Storefront token never reaches the browser.** Cart traffic goes through `/api/cart`, which validates the body field by field and returns only mapped cart data.
