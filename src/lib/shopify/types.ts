/**
 * HomeKart's own view-models. These are deliberately *not* a mirror of the
 * Storefront API schema: the GraphQL response is mapped into these shapes so a
 * Shopify field rename cannot leak through the whole app.
 *
 * Every shape here is constrained by what the Storefront API (2026-10) actually
 * exposes — verified against Shopify's introspected schema. Notably there is no
 * product excerpt, no collection product count and no review/rating field, so
 * none is modelled and none can be rendered.
 */

export type Money = {
  readonly amount: string | null;
  readonly currencyCode: string;
};

export type MediaImage = {
  readonly url: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
};

export type SelectedOption = { readonly name: string; readonly value: string };

export type ProductOption = {
  readonly name: string;
  readonly values: string[];
};

export type ProductVariant = {
  readonly id: string;
  readonly title: string;
  readonly sku: string | null;
  readonly price: Money;
  readonly compareAtPrice: Money | null;
  readonly availableForSale: boolean;
  readonly selectedOptions: readonly SelectedOption[];
  readonly image: MediaImage | null;
};

export type ProductSummary = {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly featuredImage: MediaImage | null;
  readonly price: Money;
  readonly compareAtPrice: Money | null;
  readonly availableForSale: boolean;
  readonly options: readonly ProductOption[];
  readonly tags: readonly string[];
  /**
   * Populated only when the product has exactly one variant, so a card can add
   * it directly. Multi-variant products return null and must be chosen on the
   * detail page rather than guessed at from the card.
   */
  readonly singleVariantId: string | null;
};

export type ProductDetail = ProductSummary & {
  readonly descriptionHtml: string | null;
  readonly variants: readonly ProductVariant[];
  readonly images: readonly MediaImage[];
  readonly seo: { readonly title: string | null; readonly description: string | null };
  readonly vendor: string | null;
  readonly productType: string | null;
};

/**
 * `Collection` carries no product count: the Storefront API exposes no
 * `productsCount` and `ProductConnection` has no `totalCount`, so a count like
 * "1,200 items" cannot be shown honestly and is not modelled.
 */
export type Collection = {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly description: string | null;
  readonly image: MediaImage | null;
  readonly seo: { readonly title: string | null; readonly description: string | null };
};

export type CartLine = {
  readonly id: string;
  readonly merchandiseId: string;
  readonly title: string;
  readonly variantTitle: string;
  readonly productHandle: string | null;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly linePrice: Money;
  readonly image: MediaImage | null;
};

export type Cart = {
  readonly id: string;
  readonly checkoutUrl: string | null;
  readonly totalQuantity: number;
  readonly lines: readonly CartLine[];
  readonly subtotal: Money | null;
  readonly currencyCode: string;
};

export type PageInfo = {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: string | null;
  readonly endCursor: string | null;
};

export type Paginated<T> = { readonly items: readonly T[]; readonly pageInfo: PageInfo };

export type Customer = {
  readonly id: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly displayName: string;
};

export type OrderLineItem = {
  readonly title: string;
  readonly variantTitle: string | null;
  readonly quantity: number;
  readonly image: MediaImage | null;
  readonly productHandle: string | null;
  readonly originalTotalPrice: Money;
};

/**
 * `Fulfillment` has no `status` field in the Storefront API — order-level status
 * comes from `Order.fulfillmentStatus`, and a fulfillment only carries tracking
 * company plus zero or more tracking numbers/URLs.
 */
export type Fulfillment = {
  readonly trackingCompany: string | null;
  readonly tracking: readonly { readonly number: string | null; readonly url: string | null }[];
};

export type Order = {
  readonly id: string;
  readonly name: string;
  readonly orderNumber: number;
  readonly processedAt: string;
  readonly lineItems: readonly OrderLineItem[];
  readonly totalPrice: Money;
  readonly subtotalPrice: Money | null;
  readonly totalShippingPrice: Money;
  readonly totalTax: Money | null;
  readonly financialStatus: string | null;
  readonly fulfillmentStatus: string;
  readonly statusUrl: string | null;
  readonly fulfillments: readonly Fulfillment[];
};

/**
 * Read from `Query.shop`. This is where the footer gets real policy links and
 * where "which currencies are actually enabled" is answered, instead of the
 * storefront asserting a returns window or payment claim it cannot back up.
 */
export type PolicyLink = {
  readonly title: string;
  readonly handle: string;
  readonly url: string;
};

export type ShopSummary = {
  readonly name: string;
  readonly description: string | null;
  readonly currencyCode: string;
  readonly moneyFormat: string;
  readonly shipsToCountries: readonly string[];
  readonly policies: readonly PolicyLink[];
  /**
   * Shopify's hosted accounts page. Present only when customer accounts are
   * enabled for the store — the storefront links there rather than collecting a
   * password, because email/password auth on the Storefront API is documented as
   * legacy-only.
   */
  readonly customerAccountUrl: string | null;
};
