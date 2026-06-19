"use client";

import { useState } from "react";
import type { Coffee } from "@/data/coffees";
import { useCart } from "@/context/CartContext";

export default function AddToCart({ coffee }: { coffee: Coffee }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        slug: coffee.slug,
        name: coffee.name,
        price: coffee.price,
        emoji: coffee.emoji,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-full border border-amber-900/15 dark:border-amber-100/15">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid size-10 place-items-center rounded-l-full text-lg transition-colors hover:bg-amber-900/[0.05] dark:hover:bg-amber-100/[0.06]"
        >
          −
        </button>
        <span className="w-10 text-center font-medium">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => q + 1)}
          className="grid size-10 place-items-center rounded-r-full text-lg transition-colors hover:bg-amber-900/[0.05] dark:hover:bg-amber-100/[0.06]"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600"
      >
        {added ? "Added ✓" : `Add to cart · $${coffee.price * qty}`}
      </button>
    </div>
  );
}
