import { NextRequest, NextResponse } from "next/server";
import { buildLogoutUrl, isCustomerAccountConfigured } from "@/lib/customer-account";
import { clearSession, getIdToken } from "@/lib/customer-session";

function siteOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
}

/**
 * Sign out: end the Shopify session (so the next login truly re-authenticates)
 * and clear our cookies. Shopify redirects back to the site afterward.
 */
export async function GET(request: NextRequest) {
  const idToken = await getIdToken();
  await clearSession();

  if (!isCustomerAccountConfigured) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const logoutUrl = await buildLogoutUrl({
    idToken,
    postLogoutRedirectUri: siteOrigin(request),
  });
  return NextResponse.redirect(logoutUrl);
}
