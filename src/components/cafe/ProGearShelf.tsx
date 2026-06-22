"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice, type Product } from "@/lib/shopify";
import { formatBeans } from "./upgrades";

/**
 * The "Pro Gear" shelf: real Shopify products embedded in the game. Adding one
 * goes straight to the live cart (same flow as the rest of the store) and tips
 * a thank-you pile of beans back into the game — flavour, not a discount.
 */

/** Beans gifted per real dollar spent, as a loyalty thank-you. */
const BEANS_PER_DOLLAR = 50;

export function gearBonus(product: Product): number {
  return Math.round(product.price * BEANS_PER_DOLLAR);
}

export default function ProGearShelf({
  products,
  onBought,
}: {
  products: Product[];
  /** Called after a successful add, with the loyalty beans to grant. */
  onBought: (beans: number, title: string) => void;
}) {
  const { addItem, pending } = useCart();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-900/20 p-8 text-center text-sm text-foreground/60 dark:border-amber-100/20">
        Pro gear appears here once the store is connected.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => {
        const buyable = Boolean(product.variantId) && product.available;
        const bonus = gearBonus(product);

        return (
          <div
            key={product.id}
            className="flex gap-4 rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-4 dark:border-amber-100/10 dark:bg-amber-100/[0.03]"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-amber-700/15 to-orange-600/10">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-3xl">☕</div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="truncate font-semibold">{product.title}</h3>
              <p className="mt-0.5 text-sm text-foreground/60">
                {formatPrice(product.price, product.currency)}
                <span className="ml-2 text-amber-700 dark:text-amber-400">
                  +{formatBeans(bonus)} 🫘
                </span>
              </p>

              <div className="mt-auto pt-3">
                {buyable ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      addItem(product.variantId as string);
                      onBought(bonus, product.title);
                    }}
                    className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600 disabled:opacity-60"
                  >
                    Add to cart
                  </button>
                ) : (
                  <span className="rounded-full bg-amber-900/10 px-4 py-1.5 text-sm font-medium text-foreground/50 dark:bg-amber-100/10">
                    Sold out
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
