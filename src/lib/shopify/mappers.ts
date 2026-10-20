import 'server-only';
import type {
  Cart,
  CartLine,
  Collection,
  MediaImage,
  Money,
  PageInfo,
  Paginated,
  PolicyLink,
  ProductDetail,
  ProductOption,
  ProductSummary,
  ProductVariant,
  SelectedOption,
  ShopSummary,
} from '@/lib/shopify/types';

/**
 * Raw GraphQL response shapes. They are intentionally loose (`?`, `| null`)
 * because this is a network boundary: a field Shopify does not return must
 * degrade to a missing value rather than throw during render.
 */
type RawMoney = { amount?: string | null; currencyCode?: string | null } | null | undefined;
type RawImage = { url?: string | null; altText?: string | null; width?: number | null; height?: number | null } | null | undefined;
type RawPageInfo = { hasNextPage?: boolean; hasPreviousPage?: boolean; startCursor?: string | null; endCursor?: string | null } | null | undefined;

type RawProductCard = {
  id: string;
  title: string;
  handle: string;
  availableForSale?: boolean;
  tags?: readonly string[] | null;
  featuredImage?: RawImage;
  priceRange?: { minVariantPrice?: RawMoney } | null;
  compareAtPriceRange?: { minVariantPrice?: RawMoney } | null;
  options?: readonly { name?: string | null; optionValues?: readonly { name?: string | null }[] | null }[] | null;
  variants?: { nodes?: readonly { id?: string | null }[] | null } | null;
};

type RawVariant = {
  id: string;
  title?: string | null;
  sku?: string | null;
  availableForSale?: boolean;
  quantityAvailable?: number | null;
  price?: RawMoney;
  compareAtPrice?: RawMoney;
  selectedOptions?: readonly { name?: string; value?: string | null }[] | null;
  image?: RawImage;
};

type RawProductDetail = RawProductCard & {
  descriptionHtml?: string | null;
  vendor?: string | null;
  productType?: string | null;
  seo?: { title?: string | null; description?: string | null } | null;
  images?: { nodes?: readonly { url?: string | null; altText?: string | null; width?: number | null; height?: number | null }[] } | null;
  variants?: { nodes?: readonly RawVariant[] } | null;
};

type RawCollection = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: RawImage;
  seo?: { title?: string | null; description?: string | null } | null;
};

type RawCartLine = {
  id: string;
  quantity: number;
  cost?: { amountPerQuantity?: RawMoney; totalAmount?: RawMoney } | null;
  merchandise?: {
    id?: string | null;
    title?: string | null;
    sku?: string | null;
    image?: RawImage;
    product?: { handle?: string | null; title?: string | null } | null;
  } | null;
};

type RawCart = {
  id: string;
  checkoutUrl?: string | null;
  totalQuantity?: number;
  cost?: { subtotalAmount?: RawMoney; totalAmount?: RawMoney } | null;
  lines?: { nodes?: readonly RawCartLine[] | null; pageInfo?: RawPageInfo } | null;
};

type RawPolicy = { title?: string | null; handle?: string | null; url?: string | null } | null | undefined;

type RawShop = {
  name: string;
  description?: string | null;
  moneyFormat?: string | null;
  customerAccountUrl?: string | null;
  paymentSettings?: { currencyCode?: string | null; countryCode?: string | null } | null;
  shipsToCountries?: readonly string[] | null;
  privacyPolicy?: RawPolicy;
  refundPolicy?: RawPolicy;
  shippingPolicy?: RawPolicy;
  termsOfService?: RawPolicy;
  contactInformation?: RawPolicy;
};

export function mapMoney(raw: RawMoney, fallbackCurrency = 'INR'): Money {
  return {
    amount: typeof raw?.amount === 'string' && raw.amount.length > 0 ? raw.amount : null,
    currencyCode: raw?.currencyCode ?? fallbackCurrency,
  };
}

export function mapImage(raw: RawImage): MediaImage | null {
  if (!raw?.url) return null;
  return { url: raw.url, altText: raw.altText ?? null, width: raw.width ?? null, height: raw.height ?? null };
}

export function mapPageInfo(raw: RawPageInfo): PageInfo {
  return {
    hasNextPage: raw?.hasNextPage ?? false,
    hasPreviousPage: raw?.hasPreviousPage ?? false,
    startCursor: raw?.startCursor ?? null,
    endCursor: raw?.endCursor ?? null,
  };
}

export function mapOptions(raw: RawProductCard['options']): readonly ProductOption[] {
  return (raw ?? []).flatMap((option) =>
    typeof option?.name === 'string' && option.name.length > 0
      ? [
          {
            name: option.name,
            values: (option.optionValues ?? []).flatMap((value) =>
              typeof value?.name === 'string' && value.name.length > 0 ? [value.name] : [],
            ),
          },
        ]
      : [],
  );
}

/**
 * `values` comes from `ProductOption.optionValues` — the deprecated
 * `ProductOption.values` is not requested anywhere in this codebase.
 */
export function mapProductCard(raw: RawProductCard): ProductSummary {
  const variantNodes = (raw.variants?.nodes ?? []).filter(
    (node): node is { id: string } => typeof node?.id === 'string' && node.id.length > 0,
  );

  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    featuredImage: mapImage(raw.featuredImage),
    price: mapMoney(raw.priceRange?.minVariantPrice),
    compareAtPrice: mapMoney(raw.compareAtPriceRange?.minVariantPrice),
    availableForSale: raw.availableForSale ?? false,
    options: mapOptions(raw.options),
    tags: (raw.tags ?? []).filter((tag): tag is string => typeof tag === 'string'),
    // Only add straight from a card when there is exactly one variant to add.
    singleVariantId: variantNodes.length === 1 ? variantNodes[0].id : null,
  };
}

function mapSelectedOptions(
  raw: RawVariant['selectedOptions'],
): readonly SelectedOption[] {
  return (raw ?? []).flatMap((option) =>
    typeof option?.name === 'string' && typeof option.value === 'string'
      ? [{ name: option.name, value: option.value }]
      : [],
  );
}

export function mapVariant(raw: RawVariant): ProductVariant {
  return {
    id: raw.id,
    title: raw.title ?? '',
    sku: raw.sku ?? null,
    price: mapMoney(raw.price),
    compareAtPrice: raw.compareAtPrice ? mapMoney(raw.compareAtPrice) : null,
    availableForSale: raw.availableForSale ?? false,
    selectedOptions: mapSelectedOptions(raw.selectedOptions),
    image: mapImage(raw.image),
  };
}

export function mapProductDetail(raw: RawProductDetail): ProductDetail {
  return {
    ...mapProductCard(raw),
    descriptionHtml: raw.descriptionHtml?.trim() ? raw.descriptionHtml : null,
    variants: (raw.variants?.nodes ?? []).map(mapVariant),
    images: (raw.images?.nodes ?? []).map(mapImage).filter((image): image is MediaImage => image !== null),
    seo: { title: raw.seo?.title ?? null, description: raw.seo?.description ?? null },
    vendor: raw.vendor ?? null,
    productType: raw.productType ?? null,
  };
}

export function mapCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    description: raw.description?.trim() ? raw.description : null,
    image: mapImage(raw.image),
    seo: { title: raw.seo?.title ?? null, description: raw.seo?.description ?? null },
  };
}

export function mapProducts(
  raw: { nodes?: readonly RawProductCard[] | null; pageInfo?: RawPageInfo } | null | undefined,
): Paginated<ProductSummary> {
  return {
    items: (raw?.nodes ?? []).map(mapProductCard),
    pageInfo: mapPageInfo(raw?.pageInfo),
  };
}

export function mapCart(raw: RawCart | null | undefined): Cart | null {
  if (!raw) return null;
  const lines = (raw.lines?.nodes ?? []).map(mapCartLine);
  const currencyCode = lines[0]?.linePrice.currencyCode ?? mapMoney(raw.cost?.subtotalAmount).currencyCode;
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl ?? null,
    totalQuantity: raw.totalQuantity ?? lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    subtotal: raw.cost?.subtotalAmount ? mapMoney(raw.cost.subtotalAmount, currencyCode) : null,
    currencyCode,
  };
}

function mapCartLine(raw: RawCartLine): CartLine {
  const merchandise = raw.merchandise ?? {};
  return {
    id: raw.id,
    merchandiseId: merchandise.id ?? '',
    title: merchandise.product?.title ?? merchandise.title ?? 'Item',
    variantTitle: merchandise.title ?? '',
    productHandle: merchandise.product?.handle ?? null,
    quantity: raw.quantity,
    unitPrice: mapMoney(raw.cost?.amountPerQuantity),
    linePrice: mapMoney(raw.cost?.totalAmount),
    image: mapImage(merchandise.image),
  };
}

export function mapShop(raw: RawShop): ShopSummary {
  const policies: readonly PolicyLink[] = [
    raw.privacyPolicy,
    raw.refundPolicy,
    raw.shippingPolicy,
    raw.termsOfService,
    raw.contactInformation,
  ]
    .filter((policy) => Boolean(policy?.url && policy.title))
    .map((policy) => ({
      title: policy?.title ?? '',
      handle: policy?.handle ?? '',
      url: policy?.url ?? '',
    }));

  return {
    name: raw.name,
    description: raw.description ?? null,
    currencyCode: raw.paymentSettings?.currencyCode ?? 'INR',
    moneyFormat: raw.moneyFormat ?? '${{amount}}',
    shipsToCountries: (raw.shipsToCountries ?? []).filter((code): code is string => typeof code === 'string'),
    policies,
    customerAccountUrl: raw.customerAccountUrl ?? null,
  };
}
