const coffees = [
  {
    name: "Sunrise Blend",
    origin: "Brazil · Colombia",
    notes: "Milk chocolate, toasted almond, brown sugar",
    roast: "Medium",
    price: "$16",
    emoji: "🌅",
  },
  {
    name: "Ethiopia Yirgacheffe",
    origin: "Single origin · Ethiopia",
    notes: "Jasmine, bergamot, ripe blueberry",
    roast: "Light",
    price: "$19",
    emoji: "🫐",
  },
  {
    name: "Midnight Roast",
    origin: "Sumatra · Guatemala",
    notes: "Dark cocoa, molasses, toasted walnut",
    roast: "Dark",
    price: "$17",
    emoji: "🌙",
  },
  {
    name: "Colombia Huila",
    origin: "Single origin · Colombia",
    notes: "Red apple, caramel, honey",
    roast: "Medium",
    price: "$18",
    emoji: "🍎",
  },
  {
    name: "Costa Rica Tarrazú",
    origin: "Single origin · Costa Rica",
    notes: "Citrus zest, brown sugar, clean finish",
    roast: "Medium-Light",
    price: "$19",
    emoji: "🍊",
  },
  {
    name: "Decaf Cordillera",
    origin: "Swiss water · Peru",
    notes: "Dark chocolate, dried cherry, smooth",
    roast: "Medium",
    price: "$17",
    emoji: "🌿",
  },
];

export default function Features() {
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
            <div
              key={coffee.name}
              className="flex flex-col rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 transition-colors hover:bg-amber-900/[0.05] dark:border-amber-100/10 dark:bg-amber-100/[0.03] dark:hover:bg-amber-100/[0.06]"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-11 place-items-center rounded-xl bg-amber-700/10 text-2xl">
                  {coffee.emoji}
                </div>
                <span className="rounded-full bg-amber-700/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {coffee.roast}
                </span>
              </div>

              <h3 className="mt-4 font-semibold">{coffee.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-foreground/50">
                {coffee.origin}
              </p>
              <p className="mt-3 text-sm text-foreground/70">{coffee.notes}</p>

              <div className="mt-6 flex items-center justify-between border-t border-amber-900/10 pt-4 dark:border-amber-100/10">
                <span className="font-semibold">{coffee.price}</span>
                <button className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600">
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
