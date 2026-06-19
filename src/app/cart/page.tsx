"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const FREE_SHIPPING_THRESHOLD = 40;

export default function CartPage() {
  const { items, updateQty, removeItem, clear, totalCount, totalPrice } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mt-4 text-foreground/70">
          Looks like you haven&apos;t added any coffee yet.
        </p>
        <Link
          href="/#menu"
          className="mt-8 inline-block rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600"
        >
          Browse our coffee
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 6;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          Clear cart
        </button>
      </div>

      <ul className="mt-8 divide-y divide-amber-900/10 dark:divide-amber-100/10">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center gap-4 py-5">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-amber-700/10 text-2xl">
              {item.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-foreground/60">${item.price} each</p>
            </div>

            <div className="flex items-center rounded-full border border-amber-900/15 dark:border-amber-100/15">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => updateQty(item.slug, item.qty - 1)}
                className="grid size-8 place-items-center rounded-l-full transition-colors hover:bg-amber-900/[0.05] dark:hover:bg-amber-100/[0.06]"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => updateQty(item.slug, item.qty + 1)}
                className="grid size-8 place-items-center rounded-r-full transition-colors hover:bg-amber-900/[0.05] dark:hover:bg-amber-100/[0.06]"
              >
                +
              </button>
            </div>

            <div className="w-16 text-right font-semibold">
              ${item.price * item.qty}
            </div>

            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => removeItem(item.slug)}
              className="text-foreground/40 transition-colors hover:text-foreground"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-amber-900/10 bg-amber-900/[0.03] p-6 dark:border-amber-100/10 dark:bg-amber-100/[0.04]">
        <div className="flex justify-between text-sm text-foreground/70">
          <span>Subtotal ({totalCount} items)</span>
          <span>${totalPrice}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-foreground/70">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
        </div>
        {remaining > 0 && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Add ${remaining} more for free shipping.
          </p>
        )}
        <div className="mt-4 flex justify-between border-t border-amber-900/10 pt-4 text-lg font-semibold dark:border-amber-100/10">
          <span>Total</span>
          <span>${totalPrice + shipping}</span>
        </div>

        <button
          type="button"
          onClick={() =>
            alert("Checkout isn't wired up yet — this is a demo storefront.")
          }
          className="mt-6 w-full rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600"
        >
          Checkout
        </button>
        <Link
          href="/#menu"
          className="mt-3 block text-center text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
