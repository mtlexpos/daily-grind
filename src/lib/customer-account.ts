/**
 * Shopify Customer Account API client (OAuth 2.0 + PKCE).
 *
 * Powers headless sign-in: login redirects to Shopify's passwordless flow, the
 * callback exchanges the auth code for tokens, and customer data is read from
 * the Customer Account GraphQL API. All credentials are read server-side from
 * environment variables and never reach the client bundle. Token storage lives
 * in `customer-session.ts` (httpOnly cookies).
 *
 * Endpoints are resolved via Shopify's discovery documents rather than
 * hardcoded, per the platform recommendation.
 *
 * Server-only: imported solely by route handlers and the /account server
 * component, and reads secrets from process.env — never bundled for the client.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
const API_VERSION =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION ?? "2025-10";

/** Scopes requested at authorization. */
const SCOPE = "openid email customer-account-api:full";

/** True only when the store domain and a customer-account client id are set. */
export const isCustomerAccountConfigured = Boolean(DOMAIN && CLIENT_ID);

export type TokenSet = {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  /** Absolute expiry as a unix epoch in milliseconds. */
  expiresAt: number;
};

type Endpoints = {
  authorization: string;
  token: string;
  logout: string;
  graphql: string;
};

// ---------------------------------------------------------------------------
// Endpoint discovery (memoized for the lifetime of the server process)
// ---------------------------------------------------------------------------

let endpointsPromise: Promise<Endpoints> | null = null;

async function discover(): Promise<Endpoints> {
  if (!DOMAIN) throw new Error("SHOPIFY_STORE_DOMAIN is not set.");

  const [openid, account] = await Promise.all([
    fetch(`https://${DOMAIN}/.well-known/openid-configuration`, {
      // Discovery docs are effectively static; cache for a day.
      next: { revalidate: 86400 },
    }),
    fetch(`https://${DOMAIN}/.well-known/customer-account-api`, {
      next: { revalidate: 86400 },
    }),
  ]);

  if (!openid.ok) {
    throw new Error(
      `OpenID discovery failed: ${openid.status} ${openid.statusText}`,
    );
  }

  const oidc = (await openid.json()) as {
    authorization_endpoint: string;
    token_endpoint: string;
    end_session_endpoint: string;
  };

  // The GraphQL endpoint lives in the customer-account-api discovery doc; fall
  // back to the documented versioned shape if that lookup is unavailable.
  let graphql = `https://${DOMAIN}/customer/api/${API_VERSION}/graphql`;
  if (account.ok) {
    const ca = (await account.json()) as { graphql_api?: string };
    if (ca.graphql_api) {
      // Pin the configured API version onto the discovered base.
      graphql = ca.graphql_api.replace(
        /\/customer\/api\/[^/]+\/graphql/,
        `/customer/api/${API_VERSION}/graphql`,
      );
    }
  }

  return {
    authorization: oidc.authorization_endpoint,
    token: oidc.token_endpoint,
    logout: oidc.end_session_endpoint,
    graphql,
  };
}

function getEndpoints(): Promise<Endpoints> {
  if (!endpointsPromise) endpointsPromise = discover();
  return endpointsPromise;
}

// ---------------------------------------------------------------------------
// PKCE + state helpers (Web Crypto)
// ---------------------------------------------------------------------------

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  // base64url, padding stripped (Shopify rejects `=` in the challenge).
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** High-entropy PKCE code verifier (43–128 chars). */
export function randomVerifier(): string {
  return randomBase64Url(32);
}

/** Random opaque value for CSRF (`state`) / replay (`nonce`) protection. */
export function randomState(): string {
  return randomBase64Url(16);
}

/** S256 challenge derived from a verifier. */
export async function challengeFromVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64UrlEncode(digest);
}

// ---------------------------------------------------------------------------
// Authorization + token exchange
// ---------------------------------------------------------------------------

export async function buildAuthorizeUrl({
  redirectUri,
  state,
  nonce,
  codeChallenge,
  prompt,
}: {
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  prompt?: string;
}): Promise<string> {
  const { authorization } = await getEndpoints();
  const url = new URL(authorization);
  url.searchParams.set("client_id", CLIENT_ID as string);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (prompt) url.searchParams.set("prompt", prompt);
  return url.toString();
}

function tokenAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  // Confidential clients authenticate with a Basic header; public clients rely
  // on PKCE alone.
  if (CLIENT_SECRET) {
    headers.Authorization = `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;
  }
  return headers;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};

function toTokenSet(json: TokenResponse): TokenSet {
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    idToken: json.id_token ?? null,
    // Refresh a touch early to avoid edge-of-expiry failures.
    expiresAt: Date.now() + (json.expires_in - 30) * 1000,
  };
}

export async function exchangeCodeForTokens({
  code,
  redirectUri,
  codeVerifier,
}: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<TokenSet> {
  const { token } = await getEndpoints();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID as string,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(token, {
    method: "POST",
    headers: tokenAuthHeaders(),
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Token exchange failed: ${res.status} ${await res.text()}`,
    );
  }
  return toTokenSet((await res.json()) as TokenResponse);
}

export async function refreshTokens(refreshToken: string): Promise<TokenSet> {
  const { token } = await getEndpoints();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID as string,
    refresh_token: refreshToken,
  });

  const res = await fetch(token, {
    method: "POST",
    headers: tokenAuthHeaders(),
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }
  const set = toTokenSet((await res.json()) as TokenResponse);
  // Shopify may omit a fresh refresh_token; keep the existing one.
  if (!set.refreshToken) set.refreshToken = refreshToken;
  return set;
}

export async function buildLogoutUrl({
  idToken,
  postLogoutRedirectUri,
}: {
  idToken: string | null;
  postLogoutRedirectUri: string;
}): Promise<string> {
  const { logout } = await getEndpoints();
  const url = new URL(logout);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}

// ---------------------------------------------------------------------------
// Customer Account GraphQL
// ---------------------------------------------------------------------------

async function customerFetch<T>(
  accessToken: string,
  query: string,
): Promise<T> {
  const { graphql } = await getEndpoints();
  const res = await fetch(graphql, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The Customer Account API expects the access token directly in the
      // Authorization header (no "Bearer " prefix).
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Customer Account request failed: ${res.status} ${res.statusText}`,
    );
  }
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) {
    throw new Error(
      `Customer Account GraphQL error: ${JSON.stringify(json.errors)}`,
    );
  }
  return json.data;
}

export type CustomerOrder = {
  number: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  total: number;
  currency: string;
};

export type Customer = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  orders: CustomerOrder[];
};

type CustomerQueryData = {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string | null } | null;
    orders: {
      edges: {
        node: {
          number: number;
          processedAt: string;
          financialStatus: string | null;
          fulfillmentStatus: string | null;
          totalPrice: { amount: string; currencyCode: string };
        };
      }[];
    };
  } | null;
};

/** Profile + recent orders for the signed-in customer, or null on failure. */
export async function getCustomer(accessToken: string): Promise<Customer | null> {
  try {
    const data = await customerFetch<CustomerQueryData>(
      accessToken,
      /* GraphQL */ `
        query AccountOverview {
          customer {
            firstName
            lastName
            emailAddress { emailAddress }
            orders(first: 5, sortKey: PROCESSED_AT, reverse: true) {
              edges {
                node {
                  number
                  processedAt
                  financialStatus
                  fulfillmentStatus
                  totalPrice { amount currencyCode }
                }
              }
            }
          }
        }
      `,
    );

    const c = data.customer;
    if (!c) return null;

    return {
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.emailAddress?.emailAddress ?? null,
      orders: c.orders.edges.map(({ node }) => ({
        number: node.number,
        processedAt: node.processedAt,
        financialStatus: node.financialStatus,
        fulfillmentStatus: node.fulfillmentStatus,
        total: Number(node.totalPrice.amount),
        currency: node.totalPrice.currencyCode,
      })),
    };
  } catch (err) {
    console.error("getCustomer failed:", err);
    return null;
  }
}
