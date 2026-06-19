import { getCoffeeProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

export default async function Features() {
  const products = await getCoffeeProducts();

  return (
    <section id="menu" className="border-t border-amber-900/10 dark:border-amber-100/10">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            This week&apos;s roasts
          </h2>
          <p className="mt-4 text-foreground/70">
            Small-batch coffees, each roasted to bring out its best. Whole bean
            or ground to order.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-2xl border border-dashed border-amber-900/20 p-12 text-center text-foreground/60 dark:border-amber-100/20">
            <p className="text-lg font-medium">Our catalogue is brewing ☕</p>
            <p className="mt-2 text-sm">
              Products will appear here once the store is connected.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
