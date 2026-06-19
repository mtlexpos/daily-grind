/**
 * Shopify Storefront API client.
 *
 * Reads the catalogue (products + collections) for the storefront. Cart
 * mutations live in `shopify-cart.ts`. All credentials are read server-side
 * from environment variables and never shipped to the client bundle.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01";

export const COFFEE_COLLECTION =
  process.env.SHOPIFY_COFFEE_COLLECTION ?? "coffee";
export const MERCH_COLLECTION = process.env.SHOPIFY_MERCH_COLLECTION ?? "merch";

/** True only when both the store domain and token are configured. */
export const isShopifyConfigured = Boolean(DOMAIN && TOKEN);

export type ProductImage = { url: string; alt: string };

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: ProductImage | null;
  /** First variant GID — the merchandise id the cart adds. */
  variantId: string | null;
  available: boolean;
  // Optional coffee-specific metafields (custom namespace).
  roast?: string;
  origin?: string;
  notes?: string;
};

type Money = { amount: string; currencyCode: string };

type ShopifyImageNode = { url: string; altText: string | null } | null;

type ShopifyMetafield = { key: string; value: string } | null;

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: ShopifyImageNode;
  priceRange: { minVariantPrice: Money };
  variants: { nodes: { id: string; availableForSale: boolean }[] };
  metafields: ShopifyMetafield[];
};

/**
 * Low-level Storefront GraphQL fetch. Catalogue reads use ISR (revalidate);
 * pass `cache: "no-store"` for anything that must always be fresh.
 */
export async function shopifyFetch<T>({
  query,
  variables,
  revalidate = 60,
  cache,
}: {
  query: string;
  variables?: Record<string, unknown>;
  revalidate?: number;
  cache?: RequestCache;
}): Promise<T> {
  if (!isShopifyConfigured) {
    throw new Error("Shopify is not configured (missing env vars).");
  }

  const res = await fetch(
    `https://${DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
      ...(cache ? { cache } : { next: { revalidate } }),
    },
  );

  if (!res.ok) {
    throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    featuredImage {
      url
      altText
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "roast" }
        { namespace: "custom", key: "origin" }
        { namespace: "custom", key: "tasting_notes" }
      ]
    ) {
      key
      value
    }
  }
`;

function normalizeProduct(node: ShopifyProductNode): Product {
  const meta = (key: string) =>
    node.metafields?.find((m) => m && m.key === key)?.value || undefined;
  const variant = node.variants?.nodes?.[0];

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    price: Number(node.priceRange.minVariantPrice.amount),
    currency: node.priceRange.minVariantPrice.currencyCode,
    image: node.featuredImage
      ? { url: node.featuredImage.url, alt: node.featuredImage.altText ?? node.title }
      : null,
    variantId: variant?.id ?? null,
    available: variant?.availableForSale ?? false,
    roast: meta("roast"),
    origin: meta("origin"),
    notes: meta("tasting_notes"),
  };
}

/** Products in a collection by handle. Returns [] if Shopify isn't configured. */
export async function getCollectionProducts(handle: string): Promise<Product[]> {
  if (!isShopifyConfigured) return [];

  const data = await shopifyFetch<{
    collection: { products: { nodes: ShopifyProductNode[] } } | null;
  }>({
    query: /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query CollectionProducts($handle: String!) {
        collection(handle: $handle) {
          products(first: 50) {
            nodes {
              ...ProductFields
            }
          }
        }
      }
    `,
    variables: { handle },
  });

  return (data.collection?.products.nodes ?? []).map(normalizeProduct);
}

/** A single product by handle, or null if missing / not configured. */
export async function getProduct(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured) return null;

  const data = await shopifyFetch<{ product: ShopifyProductNode | null }>({
    query: /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Product($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }
    `,
    variables: { handle },
  });

  return data.product ? normalizeProduct(data.product) : null;
}

/** All product handles, for generateStaticParams. */
export async function getAllProductHandles(): Promise<string[]> {
  if (!isShopifyConfigured) return [];

  const data = await shopifyFetch<{
    products: { nodes: { handle: string }[] };
  }>({
    query: /* GraphQL */ `
      query AllHandles {
        products(first: 100) {
          nodes {
            handle
          }
        }
      }
    `,
  });

  return data.products.nodes.map((n) => n.handle);
}

/** Format a price for display, e.g. 18 -> "$18.00". */
export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(amount);
}
