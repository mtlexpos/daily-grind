import type { Metadata } from "next";
import { getCollectionProducts, MERCH_COLLECTION } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Merch · Daily Grind",
  description: "Mugs, totes, and threads from Daily Grind Coffee Roasters.",
};

export default async function MerchPage() {
  const products = await getCollectionProducts(MERCH_COLLECTION);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Merch
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Wear the Grind
        </h1>
        <p className="mt-4 text-foreground/70">
          Mugs, totes, and threads for people who take their coffee seriously.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              linkToDetail={false}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-amber-900/20 p-12 text-center text-foreground/60 dark:border-amber-100/20">
          <p className="text-lg font-medium">Merch coming soon 🧢</p>
          <p className="mt-2 text-sm">
            We&apos;re putting the finishing touches on our merch line. Check
            back shortly.
          </p>
        </div>
      )}
    </div>
  );
}
