import type { Metadata } from "next";
import {
  MERCH_COLLECTION,
  getCollectionProducts,
  getCoffeeProducts,
  type Product,
} from "@/lib/shopify";
import CafeGame from "@/components/cafe/CafeGame";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Café Tycoon · Daily Grind",
  description:
    "Brew beans, build your café empire, and shop the real gear that powers it — a little idle game from Daily Grind.",
};

/** A small, varied shelf of real products to embed as Pro Gear. */
async function getProGear(): Promise<Product[]> {
  const [coffee, merch] = await Promise.all([
    getCoffeeProducts(),
    getCollectionProducts(MERCH_COLLECTION),
  ]);

  // Interleave coffee + merch so the shelf isn't all one category, dedupe by
  // id, and keep it short so it reads as a curated shelf, not the full store.
  const interleaved: Product[] = [];
  for (let i = 0; i < Math.max(coffee.length, merch.length); i++) {
    if (coffee[i]) interleaved.push(coffee[i]);
    if (merch[i]) interleaved.push(merch[i]);
  }
  const seen = new Set<string>();
  return interleaved.filter((p) => !seen.has(p.id) && seen.add(p.id)).slice(0, 6);
}

export default async function CafePage() {
  const products = await getProGear();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Café Tycoon
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Build your café empire
        </h1>
        <p className="mt-4 text-foreground/70">
          Pull shots to earn beans, reinvest in upgrades, and kit out your bar
          with the real gear from our store — every order ships for real and
          earns you loyalty beans.
        </p>
      </div>

      <div className="mt-12">
        <CafeGame products={products} />
      </div>
    </div>
  );
}
