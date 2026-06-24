import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/shopify";
import { getCustomer, isCustomerAccountConfigured } from "@/lib/customer-account";
import { getValidAccessToken } from "@/lib/customer-session";

export const metadata: Metadata = {
  title: "Account · Daily Grind",
  description:
    "Sign in to manage your Daily Grind orders, subscriptions, and account details.",
};

// Reads auth cookies, so this page must render per-request.
export const dynamic = "force-dynamic";

const features = [
  {
    title: "Track your orders",
    text: "See order status and history, and grab tracking for anything on its way.",
  },
  {
    title: "Manage subscriptions",
    text: "Adjust your beans, change cadence, or skip and pause a delivery.",
  },
  {
    title: "Update your details",
    text: "Keep your shipping address and contact info current.",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function titleCase(value: string | null): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const token = isCustomerAccountConfigured ? await getValidAccessToken() : null;
  const customer = token ? await getCustomer(token) : null;
  const signedIn = Boolean(customer);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Account
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          {signedIn && customer?.firstName
            ? `Hi, ${customer.firstName}`
            : "Your account"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-foreground/70">
          {signedIn
            ? "Here's a look at your recent orders. Manage everything from one place."
            : "Sign in to view your orders, manage your subscription, and update your details."}
        </p>

        {error && !signedIn && (
          <p className="mx-auto mt-6 max-w-md rounded-xl border border-amber-900/15 bg-amber-900/[0.04] px-4 py-3 text-sm text-foreground/70 dark:border-amber-100/15 dark:bg-amber-100/[0.05]">
            {error === "config"
              ? "Accounts aren't connected yet. Please try again later."
              : "Something went wrong signing you in. Please try again."}
          </p>
        )}

        {isCustomerAccountConfigured ? (
          signedIn ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/coffee"
                className="w-full rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600 sm:w-auto"
              >
                Keep shopping
              </Link>
              <a
                href="/api/account/logout"
                className="w-full rounded-full border border-amber-900/15 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-amber-900/[0.04] dark:border-amber-100/15 dark:hover:bg-amber-100/[0.05] sm:w-auto"
              >
                Sign out
              </a>
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/api/account/login"
                className="w-full rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600 sm:w-auto"
              >
                Sign in to your account
              </a>
              <Link
                href="/coffee"
                className="w-full rounded-full border border-amber-900/15 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-amber-900/[0.04] dark:border-amber-100/15 dark:hover:bg-amber-100/[0.05] sm:w-auto"
              >
                Keep shopping
              </Link>
            </div>
          )
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-amber-900/20 p-8 text-foreground/60 dark:border-amber-100/20">
            <p className="font-medium">Accounts aren&apos;t set up yet</p>
            <p className="mt-2 text-sm">
              Customer accounts will be available here once the store is
              connected.
            </p>
          </div>
        )}
      </div>

      {signedIn && customer && (
        <div className="mt-16">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          {customer.orders.length > 0 ? (
            <ul className="mt-4 divide-y divide-amber-900/10 overflow-hidden rounded-2xl border border-amber-900/10 dark:divide-amber-100/10 dark:border-amber-100/10">
              {customer.orders.map((order) => (
                <li
                  key={order.number}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">Order #{order.number}</p>
                    <p className="text-sm text-foreground/60">
                      {formatDate(order.processedAt)}
                      {titleCase(order.fulfillmentStatus) &&
                        ` · ${titleCase(order.fulfillmentStatus)}`}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(order.total, order.currency)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-amber-900/20 p-6 text-sm text-foreground/60 dark:border-amber-100/20">
              No orders yet — your first bag of beans is waiting.
            </p>
          )}
        </div>
      )}

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 dark:border-amber-100/10 dark:bg-amber-100/[0.03]"
          >
            <h2 className="font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{feature.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
