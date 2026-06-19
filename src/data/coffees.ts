export type Coffee = {
  slug: string;
  name: string;
  origin: string;
  notes: string;
  roast: string;
  price: number;
  emoji: string;
  description: string;
};

export const coffees: Coffee[] = [
  {
    slug: "sunrise-blend",
    name: "Sunrise Blend",
    origin: "Brazil · Colombia",
    notes: "Milk chocolate, toasted almond, brown sugar",
    roast: "Medium",
    price: 16,
    emoji: "🌅",
    description:
      "Our flagship house blend and the cup we've poured at the Montreal counter since day one. Brazilian and Colombian beans are balanced for a smooth, comforting brew with cocoa sweetness and a nutty finish. Equally at home in a drip machine or a morning espresso.",
  },
  {
    slug: "ethiopia-yirgacheffe",
    name: "Ethiopia Yirgacheffe",
    origin: "Single origin · Ethiopia",
    notes: "Jasmine, bergamot, ripe blueberry",
    roast: "Light",
    price: 19,
    emoji: "🫐",
    description:
      "A delicate, floral single origin from the Yirgacheffe region. Lightly roasted to preserve its bright bergamot aroma and burst of ripe blueberry. Best brewed as a pour-over to let the tea-like clarity shine.",
  },
  {
    slug: "midnight-roast",
    name: "Midnight Roast",
    origin: "Sumatra · Guatemala",
    notes: "Dark cocoa, molasses, toasted walnut",
    roast: "Dark",
    price: 17,
    emoji: "🌙",
    description:
      "For those who like it bold. A dark roast pairing earthy Sumatran beans with structured Guatemalan coffee for deep notes of dark cocoa and molasses. Stands up beautifully to milk and makes a serious after-dinner cup.",
  },
  {
    slug: "colombia-huila",
    name: "Colombia Huila",
    origin: "Single origin · Colombia",
    notes: "Red apple, caramel, honey",
    roast: "Medium",
    price: 18,
    emoji: "🍎",
    description:
      "Grown in the high-altitude Huila region, this medium roast is all about balance — crisp red apple acidity wrapped in caramel and honey sweetness. A crowd-pleaser that's hard to put down.",
  },
  {
    slug: "costa-rica-tarrazu",
    name: "Costa Rica Tarrazú",
    origin: "Single origin · Costa Rica",
    notes: "Citrus zest, brown sugar, clean finish",
    roast: "Medium-Light",
    price: 19,
    emoji: "🍊",
    description:
      "From the renowned Tarrazú growing region, this medium-light roast is bright and lively with citrus zest, a brown-sugar body, and a famously clean finish. A favourite of our pour-over regulars.",
  },
  {
    slug: "decaf-cordillera",
    name: "Decaf Cordillera",
    origin: "Swiss water · Peru",
    notes: "Dark chocolate, dried cherry, smooth",
    roast: "Medium",
    price: 17,
    emoji: "🌿",
    description:
      "Decaffeinated using the chemical-free Swiss Water Process, so you keep all the flavour and none of the caffeine. Smooth and rounded with dark chocolate and a hint of dried cherry — a genuine evening cup.",
  },
];

export function getCoffee(slug: string): Coffee | undefined {
  return coffees.find((coffee) => coffee.slug === slug);
}
