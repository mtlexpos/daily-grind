"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";

export default function CartPage() {
  const { cart, pending, updateQty, removeItem, clear } = useCart();

  if (!cart || cart.lines.length === 0) {
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
        {cart.lines.map((line) => (
          <li key={line.lineId} className="flex items-center gap-4 py-5">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-amber-700/10">
              {line.image ? (
                <Image
                  src={line.image.url}
                  alt={line.image.alt}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-2xl">☕</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">{line.title}</p>
              <p className="text-sm text-foreground/60">
                {formatPrice(line.price, cart.currency)} each
              </p>
            </div>

            <div className="flex items-center rounded-full border border-amber-900/15 dark:border-amber-100/15">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={pending}
                onClick={() => updateQty(line.lineId, line.quantity - 1)}
                className="grid size-8 place-items-center rounded-l-full transition-colors hover:bg-amber-900/[0.05] disabled:opacity-50 dark:hover:bg-amber-100/[0.06]"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {line.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={pending}
                onClick={() => updateQty(line.lineId, line.quantity + 1)}
                className="grid size-8 place-items-center rounded-r-full transition-colors hover:bg-amber-900/[0.05] disabled:opacity-50 dark:hover:bg-amber-100/[0.06]"
              >
                +
              </button>
            </div>

            <div className="w-20 text-right font-semibold">
              {formatPrice(line.price * line.quantity, cart.currency)}
            </div>

            <button
              type="button"
              aria-label={`Remove ${line.title}`}
              disabled={pending}
              onClick={() => removeItem(line.lineId)}
              className="text-foreground/40 transition-colors hover:text-foreground disabled:opacity-50"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-amber-900/10 bg-amber-900/[0.03] p-6 dark:border-amber-100/10 dark:bg-amber-100/[0.04]">
        <div className="flex justify-between text-sm text-foreground/70">
          <span>Subtotal ({cart.totalQuantity} items)</span>
          <span>{formatPrice(cart.subtotal, cart.currency)}</span>
        </div>
        <p className="mt-2 text-xs text-foreground/50">
          Shipping &amp; taxes calculated at checkout.
        </p>

        <a
          href={cart.checkoutUrl}
          className="mt-6 block w-full rounded-full bg-amber-700 px-6 py-3 text-center text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600"
        >
          Checkout
        </a>
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
