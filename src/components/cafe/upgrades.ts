/**
 * Café Tycoon — in-game economy definitions and pure helpers.
 *
 * The game currency is "beans" (🫘). Upgrades either boost how many beans a
 * single "pull" yields (`click`) or generate beans passively each second
 * (`passive`). Everything here is pure so the state hook and UI can share it.
 */

export type UpgradeKind = "click" | "passive";

export type Upgrade = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  kind: UpgradeKind;
  /** Cost of the first unit, in beans. */
  baseCost: number;
  /** Per-unit cost multiplier — each owned copy makes the next one pricier. */
  costGrowth: number;
  /** Beans added per unit: per click for `click`, per second for `passive`. */
  amount: number;
};

/** Ordered cheapest → grandest; the UI renders them in this order. */
export const UPGRADES: Upgrade[] = [
  {
    id: "grinder",
    name: "Burr Grinder",
    emoji: "⚙️",
    blurb: "Sharper grind, fuller pull.",
    kind: "click",
    baseCost: 15,
    costGrowth: 1.15,
    amount: 1,
  },
  {
    id: "drip",
    name: "Drip Machine",
    emoji: "🫖",
    blurb: "Brews a little on its own.",
    kind: "passive",
    baseCost: 50,
    costGrowth: 1.15,
    amount: 1,
  },
  {
    id: "barista",
    name: "Hire a Barista",
    emoji: "🧑‍🍳",
    blurb: "Pulls shots while you rest.",
    kind: "passive",
    baseCost: 250,
    costGrowth: 1.17,
    amount: 5,
  },
  {
    id: "espresso",
    name: "Espresso Bar",
    emoji: "☕",
    blurb: "A full bar humming all day.",
    kind: "passive",
    baseCost: 1_200,
    costGrowth: 1.18,
    amount: 22,
  },
  {
    id: "tamper",
    name: "Golden Tamper",
    emoji: "🥇",
    blurb: "Every pull lands perfectly.",
    kind: "click",
    baseCost: 4_000,
    costGrowth: 1.2,
    amount: 25,
  },
  {
    id: "roastery",
    name: "In-House Roastery",
    emoji: "🔥",
    blurb: "Roast, grind, brew, repeat.",
    kind: "passive",
    baseCost: 9_000,
    costGrowth: 1.2,
    amount: 110,
  },
  {
    id: "location",
    name: "Second Location",
    emoji: "🏪",
    blurb: "The empire expands.",
    kind: "passive",
    baseCost: 55_000,
    costGrowth: 1.22,
    amount: 560,
  },
];

const UPGRADE_BY_ID: Record<string, Upgrade> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);

/** How many beans the `owned`-th copy of an upgrade costs. */
export function costOf(upgrade: Upgrade, owned: number): number {
  return Math.ceil(upgrade.baseCost * upgrade.costGrowth ** owned);
}

/** Beans granted per manual pull, given everything currently owned. */
export function beansPerClick(owned: Record<string, number>): number {
  let perClick = 1;
  for (const u of UPGRADES) {
    if (u.kind === "click") perClick += u.amount * (owned[u.id] ?? 0);
  }
  return perClick;
}

/** Beans generated automatically each second. */
export function beansPerSecond(owned: Record<string, number>): number {
  let perSec = 0;
  for (const u of UPGRADES) {
    if (u.kind === "passive") perSec += u.amount * (owned[u.id] ?? 0);
  }
  return perSec;
}

export function getUpgrade(id: string): Upgrade | undefined {
  return UPGRADE_BY_ID[id];
}

/** Compact bean count: 1234 → "1.2K", 5_400_000 → "5.4M". */
export function formatBeans(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.floor(n));
}
