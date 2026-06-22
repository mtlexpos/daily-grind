import Link from "next/link";
import type { Metadata } from "next";
import { accountUrl } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Account · Daily Grind",
  description:
    "Sign in to manage your Daily Grind orders, subscriptions, and account details.",
};

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

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Account
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Your account
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-foreground/70">
          Sign in to view your orders, manage your subscription, and update your
          details. Your account is handled securely by our store.
        </p>

        {accountUrl ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={accountUrl}
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
