import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  challengeFromVerifier,
  isCustomerAccountConfigured,
  randomState,
  randomVerifier,
} from "@/lib/customer-account";
import { setHandshake } from "@/lib/customer-session";

/** Site origin: explicit env override, else the incoming request's origin. */
function siteOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
}

/**
 * Kick off the OAuth login: mint PKCE + state, stash them in httpOnly cookies,
 * and redirect the customer to Shopify's hosted passwordless login.
 */
export async function GET(request: NextRequest) {
  if (!isCustomerAccountConfigured) {
    return NextResponse.redirect(new URL("/account?error=config", request.url));
  }

  const verifier = randomVerifier();
  const codeChallenge = await challengeFromVerifier(verifier);
  const state = randomState();
  const nonce = randomState();
  const redirectUri = `${siteOrigin(request)}/api/account/callback`;

  await setHandshake({ verifier, state, redirectUri });

  const authorizeUrl = await buildAuthorizeUrl({
    redirectUri,
    state,
    nonce,
    codeChallenge,
    prompt: request.nextUrl.searchParams.get("prompt") ?? undefined,
  });

  return NextResponse.redirect(authorizeUrl);
}
