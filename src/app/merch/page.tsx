"use client";

import { useCart } from "@/context/CartContext";

const merch = [
  { slug: "merch-mug", name: "Daily Grind Mug", price: 14, emoji: "🍵", desc: "12 oz stoneware, glazed in espresso brown." },
  { slug: "merch-tote", name: "Canvas Tote", price: 18, emoji: "🛍️", desc: "Heavy cotton tote with our Plateau logo." },
  { slug: "merch-tee", name: "Roaster Tee", price: 28, emoji: "👕", desc: "Soft organic cotton, unisex fit." },
  { slug: "merch-cap", name: "Embroidered Cap", price: 24, emoji: "🧢", desc: "Six-panel cap with stitched coffee cherry." },
  { slug: "merch-beanie", name: "Montreal Beanie", price: 22, emoji: "🧶", desc: "Ribbed knit for those cold MTL mornings." },
  { slug: "merch-press", name: "French Press", price: 36, emoji: "⏳", desc: "Borosilicate glass, 8-cup, branded base." },
];

export default function MerchPage() {
  const { addItem } = useCart();

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

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {merch.map((item) => (
          <div
            key={item.slug}
            className="flex flex-col rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 dark:border-amber-100/10 dark:bg-amber-100/[0.03]"
          >
            <div className="grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-amber-700/15 to-orange-600/10 text-6xl">
              {item.emoji}
            </div>
            <h3 className="mt-4 font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-foreground/70">{item.desc}</p>
            <div className="mt-6 flex items-center justify-between border-t border-amber-900/10 pt-4 dark:border-amber-100/10">
              <span className="font-semibold">${item.price}</span>
              <button
                type="button"
                onClick={() =>
                  addItem({
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    emoji: item.emoji,
                  })
                }
                className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600"
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
