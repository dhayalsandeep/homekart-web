import 'server-only';

/**
 * GraphQL documents for the Storefront API. Every selection below was checked
 * against Shopify's introspected schema for 2026-10, including the two renames
 * that trip people up: the money type is `MoneyV2` (there is no `Money`), and
 * `Image.src` / `Image.originalSrc` / `ProductOption.values` are deprecated in
 * favour of `url` and `optionValues`.
 */

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment StorefrontMoney on MoneyV2 {
    amount
    currencyCode
  }
`;

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment StorefrontImage on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    title
    handle
    availableForSale
    tags
    featuredImage {
      ...StorefrontImage
    }
    priceRange {
      minVariantPrice {
        ...StorefrontMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...StorefrontMoney
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 2) {
      nodes {
        id
      }
    }
  }
`;

export const PRODUCT_DETAIL_FIELDS = /* GraphQL */ `
  fragment ProductDetailFields on Product {
    ...ProductCardFields
    descriptionHtml
    vendor
    productType
    createdAt
    seo {
      title
      description
    }
    images(first: 12) {
      nodes {
        ...StorefrontImage
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        price {
          ...StorefrontMoney
        }
        compareAtPrice {
          ...StorefrontMoney
        }
        selectedOptions {
          name
          value
        }
        image {
          ...StorefrontImage
        }
      }
    }
  }
`;

export const CART_FIELDS = /* GraphQL */ `
  fragment StorefrontCart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...StorefrontMoney
      }
      totalAmount {
        ...StorefrontMoney
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity {
            ...StorefrontMoney
          }
          totalAmount {
            ...StorefrontMoney
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            sku
            image {
              ...StorefrontImage
            }
            product {
              handle
              title
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const FRAGMENTS = [
  MONEY_FRAGMENT,
  IMAGE_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_DETAIL_FIELDS,
  CART_FIELDS,
].join('\n');

function withFragments(body: string): string {
  return `${FRAGMENTS}\n${body}`;
}

/**
 * Sort options are the real enum members, verified per connection:
 * `ProductCollectionSortKeys` (for `Collection.products`) and `ProductSortKeys`
 * (for `Query.products`) are *not* the same list, and `SearchSortKeys` is
 * smaller again. Anything outside these would be rejected by the API.
 */
export const COLLECTION_SORTS = [
  { value: 'COLLECTION_DEFAULT', label: 'Featured' },
  { value: 'BEST_SELLING', label: 'Best selling' },
  { value: 'PRICE', label: 'Price' },
  { value: 'CREATED', label: 'Newest' },
  { value: 'TITLE', label: 'Alphabetical' },
  { value: 'RELEVANCE', label: 'Relevance' },
] as const;

export const PRODUCT_SORTS = [
  { value: 'BEST_SELLING', label: 'Best selling' },
  { value: 'PRICE', label: 'Price' },
  { value: 'CREATED_AT', label: 'Newest' },
  { value: 'TITLE', label: 'Alphabetical' },
  { value: 'UPDATED_AT', label: 'Recently updated' },
  { value: 'RELEVANCE', label: 'Relevance' },
] as const;

export const SEARCH_SORTS = [
  { value: 'RELEVANCE', label: 'Relevance' },
  { value: 'PRICE', label: 'Price' },
] as const;

export type CollectionSortValue = (typeof COLLECTION_SORTS)[number]['value'];
export type ProductSortValue = (typeof PRODUCT_SORTS)[number]['value'];

function pick<T extends readonly { value: string }[]>(list: T, value: string | undefined): T[number] | undefined {
  if (!value) return undefined;
  return list.find((entry) => entry.value.toLowerCase() === value.toLowerCase());
}

export const toCollectionSort = (value: string | undefined) => pick(COLLECTION_SORTS, value)?.value;
export const toProductSort = (value: string | undefined) => pick(PRODUCT_SORTS, value)?.value;
export const toSearchSort = (value: string | undefined) => pick(SEARCH_SORTS, value)?.value;

export type ProductsQuery = {
  readonly first?: number;
  readonly query?: string;
  readonly sortKey?: string;
  readonly reverse?: boolean;
  readonly after?: string;
};

export const productsQuery = withFragments(/* GraphQL */ `
  query HomekartProducts($first: Int, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $after: String) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after) {
      nodes {
        ...ProductCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export const productQuery = withFragments(/* GraphQL */ `
  query HomekartProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductDetailFields
    }
  }
`);

export const collectionProductsQuery = withFragments(/* GraphQL */ `
  query HomekartCollectionProducts($handle: String!, $first: Int, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        ...StorefrontImage
      }
      seo {
        title
        description
      }
      products(first: $first, sortKey: $sortKey, reverse: $reverse, after: $after) {
        nodes {
          ...ProductCardFields
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`);

export const collectionsQuery = withFragments(/* GraphQL */ `
  query HomekartCollections($first: Int) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        description
        image {
          ...StorefrontImage
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

/** `types: [PRODUCT]` keeps the connection to one result __typename, so mapping is total. */
export const searchQuery = withFragments(/* GraphQL */ `
  query HomekartSearch($query: String!, $first: Int, $after: String, $sortKey: SearchSortKeys) {
    search(query: $query, first: $first, after: $after, sortKey: $sortKey, types: [PRODUCT]) {
      nodes {
        __typename
        ... on Product {
          ...ProductCardFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

/**
 * `Shop` is the only honest source for policy links, the enabled currency and
 * the countries the store actually ships to. The footer reads this instead of
 * asserting a returns window.
 */
export const shopQuery = withFragments(/* GraphQL */ `
  query HomekartShop {
    shop {
      name
      description
      moneyFormat
      customerAccountUrl
      paymentSettings {
        currencyCode
        countryCode
      }
      shipsToCountries
      privacyPolicy {
        title
        handle
        url
      }
      refundPolicy {
        title
        handle
        url
      }
      shippingPolicy {
        title
        handle
        url
      }
      termsOfService {
        title
        handle
        url
      }
      contactInformation {
        title
        handle
        url
      }
    }
  }
`);

export const cartQuery = withFragments(/* GraphQL */ `
  query HomekartCart($cartId: ID!) {
    cart(id: $cartId) {
      ...StorefrontCart
    }
  }
`);

export const cartCreateMutation = withFragments(/* GraphQL */ `
  mutation HomekartCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...StorefrontCart
      }
      userErrors {
        field
        message
      }
    }
  }
`);

export const cartLinesAddMutation = withFragments(/* GraphQL */ `
  mutation HomekartCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...StorefrontCart
      }
      userErrors {
        field
        message
      }
    }
  }
`);

export const cartLinesUpdateMutation = withFragments(/* GraphQL */ `
  mutation HomekartCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...StorefrontCart
      }
      userErrors {
        field
        message
      }
    }
  }
`);

export const cartLinesRemoveMutation = withFragments(/* GraphQL */ `
  mutation HomekartCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...StorefrontCart
      }
      userErrors {
        field
        message
      }
    }
  }
`);
