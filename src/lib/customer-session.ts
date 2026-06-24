/**
 * Cookie-backed session for the Customer Account API.
 *
 * Tokens live only in httpOnly cookies — never in the client bundle or
 * localStorage. The short-lived handshake cookies (`ca_pkce`, `ca_state`,
 * `ca_redirect`) carry the in-flight OAuth state between /login and /callback.
 *
 * Server-only: uses `next/headers` cookies, so it can only run server-side.
 */
import { cookies } from "next/headers";
import { refreshTokens, type TokenSet } from "@/lib/customer-account";

const ACCESS = "ca_access";
const REFRESH = "ca_refresh";
const ID = "ca_id";
const EXP = "ca_exp";

const PKCE = "ca_pkce";
const STATE = "ca_state";
const REDIRECT = "ca_redirect";

const HANDSHAKE_MAX_AGE = 60 * 10; // 10 minutes to complete the OAuth round-trip
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (refresh-token lifetime)

/** httpOnly cookie options. `secure` only in production so localhost dev works. */
function opts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

// ---------------------------------------------------------------------------
// OAuth handshake state (set in /login, consumed in /callback)
// ---------------------------------------------------------------------------

export async function setHandshake({
  verifier,
  state,
  redirectUri,
}: {
  verifier: string;
  state: string;
  redirectUri: string;
}): Promise<void> {
  const store = await cookies();
  const o = opts(HANDSHAKE_MAX_AGE);
  store.set(PKCE, verifier, o);
  store.set(STATE, state, o);
  store.set(REDIRECT, redirectUri, o);
}

export async function readHandshake(): Promise<{
  verifier: string | null;
  state: string | null;
  redirectUri: string | null;
}> {
  const store = await cookies();
  return {
    verifier: store.get(PKCE)?.value ?? null,
    state: store.get(STATE)?.value ?? null,
    redirectUri: store.get(REDIRECT)?.value ?? null,
  };
}

export async function clearHandshake(): Promise<void> {
  const store = await cookies();
  store.delete(PKCE);
  store.delete(STATE);
  store.delete(REDIRECT);
}

// ---------------------------------------------------------------------------
// Authenticated session
// ---------------------------------------------------------------------------

export async function setSession(tokens: TokenSet): Promise<void> {
  const store = await cookies();
  store.set(ACCESS, tokens.accessToken, opts(SESSION_MAX_AGE));
  if (tokens.refreshToken) {
    store.set(REFRESH, tokens.refreshToken, opts(SESSION_MAX_AGE));
  }
  if (tokens.idToken) {
    store.set(ID, tokens.idToken, opts(SESSION_MAX_AGE));
  }
  store.set(EXP, String(tokens.expiresAt), opts(SESSION_MAX_AGE));
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS);
  store.delete(REFRESH);
  store.delete(ID);
  store.delete(EXP);
}

/** The id_token, used as `id_token_hint` when ending the Shopify session. */
export async function getIdToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ID)?.value ?? null;
}

/**
 * A non-expired access token, refreshing transparently when needed. Returns
 * null when the visitor isn't signed in.
 *
 * Note: a refreshed token is persisted on a best-effort basis — cookie writes
 * are rejected during a Server Component render, so the refreshed token is used
 * for the current request and re-persisted on the next route-handler hit.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const store = await cookies();
  const access = store.get(ACCESS)?.value;
  if (!access) return null;

  const exp = Number(store.get(EXP)?.value ?? 0);
  if (exp && Date.now() < exp) return access;

  // Expired (or no expiry recorded) — try to refresh.
  const refresh = store.get(REFRESH)?.value;
  if (!refresh) return access; // best effort: hand back what we have

  try {
    const tokens = await refreshTokens(refresh);
    try {
      await setSession(tokens);
    } catch {
      // Read-only context (Server Component render) — refreshed token is still
      // returned below and will be re-persisted by the next route handler.
    }
    return tokens.accessToken;
  } catch (err) {
    console.error("token refresh failed:", err);
    return null;
  }
}
