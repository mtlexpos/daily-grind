"use client";

import Link from "next/link";
import { coffees } from "@/data/coffees";
import { useCart } from "@/context/CartContext";

export default function Features() {
  const { addItem } = useCart();

  return (
    <section id="menu" className="border-t border-amber-900/10 dark:border-amber-100/10">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            This week&apos;s roasts
          </h2>
          <p className="mt-4 text-foreground/70">
            Six small-batch coffees, each roasted to bring out its best. Whole
            bean or ground to order — 12 oz bags.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coffees.map((coffee) => (
            <Link
              key={coffee.slug}
              href={`/coffee/${coffee.slug}`}
              className="group flex flex-col rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 transition-colors hover:bg-amber-900/[0.05] dark:border-amber-100/10 dark:bg-amber-100/[0.03] dark:hover:bg-amber-100/[0.06]"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-11 place-items-center rounded-xl bg-amber-700/10 text-2xl">
                  {coffee.emoji}
                </div>
                <span className="rounded-full bg-amber-700/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {coffee.roast}
                </span>
              </div>

              <h3 className="mt-4 font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-400">
                {coffee.name}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-foreground/50">
                {coffee.origin}
              </p>
              <p className="mt-3 text-sm text-foreground/70">{coffee.notes}</p>

              <div className="mt-6 flex items-center justify-between border-t border-amber-900/10 pt-4 dark:border-amber-100/10">
                <span className="font-semibold">${coffee.price}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      slug: coffee.slug,
                      name: coffee.name,
                      price: coffee.price,
                      emoji: coffee.emoji,
                    });
                  }}
                  className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600"
                >
                  Add to cart
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
