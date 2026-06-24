import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/customer-account";
import {
  clearHandshake,
  readHandshake,
  setSession,
} from "@/lib/customer-session";

/**
 * OAuth callback: validate the `state`, exchange the auth code for tokens
 * (using the PKCE verifier saved at /login), persist the session, and return
 * the customer to /account.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const accountUrl = (qs = "") => new URL(`/account${qs}`, request.url);

  // Shopify reported an error (denied, expired, login_required, …).
  if (params.get("error")) {
    await clearHandshake();
    return NextResponse.redirect(accountUrl("?error=auth"));
  }

  const code = params.get("code");
  const returnedState = params.get("state");
  const { verifier, state, redirectUri } = await readHandshake();

  // CSRF / replay guard: state must match and the handshake must be present.
  if (
    !code ||
    !verifier ||
    !redirectUri ||
    !returnedState ||
    returnedState !== state
  ) {
    await clearHandshake();
    return NextResponse.redirect(accountUrl("?error=auth"));
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      redirectUri,
      codeVerifier: verifier,
    });
    await setSession(tokens);
    await clearHandshake();
    return NextResponse.redirect(accountUrl());
  } catch (err) {
    console.error("OAuth callback failed:", err);
    await clearHandshake();
    return NextResponse.redirect(accountUrl("?error=auth"));
  }
}
