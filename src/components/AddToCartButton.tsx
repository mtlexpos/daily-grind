"use client";

import { useCart } from "@/context/CartContext";

/** Compact add-to-cart button used on product cards (menu + merch grids). */
export default function AddToCartButton({
  variantId,
  available = true,
}: {
  variantId: string | null;
  available?: boolean;
}) {
  const { addItem, pending } = useCart();

  if (!variantId || !available) {
    return (
      <span className="rounded-full bg-amber-900/10 px-4 py-1.5 text-sm font-medium text-foreground/50 dark:bg-amber-100/10">
        Sold out
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(variantId);
      }}
      className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600 disabled:opacity-60"
    >
      Add to cart
    </button>
  );
}
