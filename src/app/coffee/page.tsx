import type { Metadata } from "next";
import { getCoffeeProducts } from "@/lib/shopify";
import ProductGrid from "@/components/ProductGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Coffee · Daily Grind",
  description:
    "Browse the full Daily Grind collection of small-batch, freshly roasted coffee.",
};

export default async function CoffeeCollectionPage() {
  const products = await getCoffeeProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Our Coffee
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          The whole collection
        </h1>
        <p className="mt-4 text-foreground/70">
          Every small-batch roast we&apos;re pouring right now. Whole bean or
          ground to order.
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-amber-900/20 p-12 text-center text-foreground/60 dark:border-amber-100/20">
          <p className="text-lg font-medium">Our catalogue is brewing ☕</p>
          <p className="mt-2 text-sm">
            Products will appear here once the store is connected.
          </p>
        </div>
      )}
    </div>
  );
}
