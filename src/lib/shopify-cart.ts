"use server";

/**
 * Shopify Cart API server actions. These run only on the server, so the
 * Storefront token stays out of the client bundle. The client cart context
 * calls these and stores the returned normalized cart.
 */

import { shopifyFetch } from "./shopify";

export type CartLine = {
  lineId: string;
  merchandiseId: string;
  title: string;
  image: { url: string; alt: string } | null;
  price: number;
  quantity: number;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: number;
  currency: string;
  lines: CartLine[];
};

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        product: {
          title: string;
          featuredImage: { url: string; altText: string | null } | null;
        };
        price: { amount: string };
      };
    }[];
  };
};

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            price {
              amount
            }
            product {
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

function normalizeCart(cart: ShopifyCart | null): Cart | null {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: Number(cart.cost.subtotalAmount.amount),
    currency: cart.cost.subtotalAmount.currencyCode,
    lines: cart.lines.nodes.map((line) => ({
      lineId: line.id,
      merchandiseId: line.merchandise.id,
      title: line.merchandise.product.title,
      image: line.merchandise.product.featuredImage
        ? {
            url: line.merchandise.product.featuredImage.url,
            alt:
              line.merchandise.product.featuredImage.altText ??
              line.merchandise.product.title,
          }
        : null,
      price: Number(line.merchandise.price.amount),
      quantity: line.quantity,
    })),
  };
}

export async function createCart(
  variantId: string,
  quantity = 1,
): Promise<Cart | null> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
    query: /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { lines: [{ merchandiseId: variantId, quantity }] },
    cache: "no-store",
  });
  return normalizeCart(data.cartCreate.cart);
}

export async function addLine(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<Cart | null> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>({
    query: /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    cache: "no-store",
  });
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>({
    query: /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: "no-store",
  });
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeLine(
  cartId: string,
  lineId: string,
): Promise<Cart | null> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>({
    query: /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { cartId, lineIds: [lineId] },
    cache: "no-store",
  });
  return normalizeCart(data.cartLinesRemove.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: /* GraphQL */ `
      ${CART_FRAGMENT}
      query Cart($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
    `,
    variables: { cartId },
    cache: "no-store",
  });
  return normalizeCart(data.cart);
}
