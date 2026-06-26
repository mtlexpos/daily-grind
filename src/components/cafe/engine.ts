/**
 * Barista Rush — pure real-time game engine (no React, no DOM).
 *
 * The component drives `step(state, dt, keys)` once per animation frame and
 * renders from the mutated state. Keeping all rules here makes the loop easy to
 * reason about: movement, the counter pickup, customer patience, serving,
 * scoring, and spawning all live in one place.
 *
 * Coordinates are in a fixed logical play-field (FIELD); the UI scales that to
 * whatever pixel size it renders at, positioning actors by percentage / depth.
 * Smaller y is the BACK of the room (where the counter sits); larger y is the
 * front, nearer the camera.
 */

export const FIELD = { w: 1000, h: 620 };

/** Counter occupies the back strip; standing in it (y <= this) grabs an item. */
export const COUNTER_BACK_Y = 96;
/** Barista half-size, used to clamp it inside the field. */
export const BARISTA_R = 34;
export const BARISTA_SPEED = 400; // logical units / second

/** How close (to a table centre) the barista must be to serve that table. */
export const SERVE_RADIUS = 96;

/** Total seconds a customer will wait before storming out. */
export const PATIENCE = 13;
/** Serve within this many seconds for a 3-star review; later earns 1 star. */
export const THREE_STAR_WITHIN = 7.5;
/** Seconds a review bubble lingers before the customer leaves the table. */
export const REVIEW_LINGER = 1.6;

export const GOAL_STARS = 25;

/** The three things a customer can order. */
export type ItemType = "coffee" | "iced" | "pastry";
export const ITEMS: ItemType[] = ["coffee", "iced", "pastry"];
export const ITEM_LABEL: Record<ItemType, string> = {
  coffee: "Hot coffee",
  iced: "Iced coffee",
  pastry: "Pastry",
};

/** Seconds a station takes to restock after its item is grabbed. */
export const STATION_RESTOCK = 4;

/** Counter stations, grouped left→right: coffee, iced, pastry. The barista
 * grabs from the ready station nearest its x, so you walk to the item you
 * need; standing at a station with a different item in hand swaps it. */
export const STATIONS: { item: ItemType; x: number }[] = [
  { item: "coffee", x: 150 },
  { item: "coffee", x: 280 },
  { item: "iced", x: 430 },
  { item: "iced", x: 560 },
  { item: "pastry", x: 710 },
  { item: "pastry", x: 840 },
];

const SPAWN_MIN = 2.2;
const SPAWN_MAX = 4.0;
const FIRST_SPAWN = 0.8;

export type Table = { x: number; y: number; r: number };

/** Ten tables: 5 columns × 2 rows, in front of the counter. Each has its own
 * radius — used both for drawing and as the solid collision footprint. Radii
 * are kept moderate so the barista can always slip between adjacent tables. */
const TABLE_RADII = [44, 34, 42, 36, 46, 40, 34, 44, 38, 42];
export const TABLES: Table[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
  const col = i % 5;
  const row = Math.floor(i / 5);
  return { x: 130 + col * 185, y: 235 + row * 210, r: TABLE_RADII[i] };
});

// Pixel-art palettes — picked per customer for visual variety.
const SKINS = ["#f6cda6", "#e9b487", "#cf9560", "#a96f3e", "#7c4a24"];
const HAIRS = ["#241a12", "#5a3a1f", "#8a5a2b", "#c9a24b", "#d9d2c4", "#3b3b3b", "#b8432e", "#2f8a4e", "#7d3fb0", "#e85aa0"];
const SHIRTS = ["#c0552f", "#2f6dc0", "#2fa05a", "#8e54b0", "#dca12f", "#d24f7a", "#359c9c", "#444a55", "#d8d2c4"];
const PANTS = ["#34415c", "#2b2b30", "#5a4632", "#3c5a3c", "#6b6b72", "#7a4a2c"];
const HAT_COLORS = ["#3a3a40", "#7d3fb0", "#2f6dc0", "#b8432e", "#2f8a4e", "#222226", "#d8b23a"];

export type HairStyle = "short" | "spiky" | "long" | "afro";
export type HatStyle = "none" | "beanie" | "fedora" | "cap";

/** Everything needed to draw a pixel-art character. */
export type Appearance = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  hat: HatStyle;
  hatColor: string;
  shirt: string;
  pants: string;
  glasses: boolean;
  beard: boolean;
};

const HAIR_STYLES: HairStyle[] = ["short", "spiky", "long", "afro"];
// Weighted so most customers are hatless and you can read their hair.
const HATS: HatStyle[] = ["none", "none", "none", "none", "beanie", "fedora", "cap"];

function randomLook(): Appearance {
  return {
    skin: pick(SKINS),
    hair: pick(HAIRS),
    hairStyle: pick(HAIR_STYLES),
    hat: pick(HATS),
    hatColor: pick(HAT_COLORS),
    shirt: pick(SHIRTS),
    pants: pick(PANTS),
    glasses: Math.random() < 0.25,
    beard: Math.random() < 0.3,
  };
}

export type CustomerState = "waiting" | "reviewing";

export type Customer = {
  id: number;
  table: number;
  state: CustomerState;
  /** Seconds waited (frozen once reviewing). */
  wait: number;
  /** Stars assigned at review time: 3, 1, or 0 (stormed out). */
  stars: number;
  /** Remaining linger time while the review bubble shows. */
  linger: number;
  /** What this customer ordered — must be served the matching item. */
  order: ItemType;
  /** Pixel-art appearance, fixed for this customer's visit. */
  look: Appearance;
};

export type GameState = {
  status: "playing" | "won";
  stars: number;
  served: number; // reviews left (3- or 1-star; angry exits don't count)
  threeStars: number;
  angry: number;
  elapsed: number;
  /** `carry` is the item currently in hand, or null when empty-handed. */
  barista: { x: number; y: number; carry: ItemType | null };
  customers: Customer[];
  occupied: boolean[]; // per table
  /** Per station (parallel to STATIONS): 0 = ready, >0 = seconds to restock. */
  stations: number[];
  spawnTimer: number;
  seq: number;
};

export type Keys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export function createInitialState(): GameState {
  return {
    status: "playing",
    stars: 0,
    served: 0,
    threeStars: 0,
    angry: 0,
    elapsed: 0,
    barista: { x: FIELD.w / 2, y: FIELD.h - 60, carry: null },
    customers: [],
    occupied: new Array(TABLES.length).fill(false),
    stations: new Array(STATIONS.length).fill(0),
    spawnTimer: FIRST_SPAWN,
    seq: 1,
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

/**
 * Advance the game by `dt` seconds. Mutates `state` in place and returns it.
 * Safe to call with a large dt (it's clamped) e.g. after a tab regains focus.
 */
export function step(state: GameState, dt: number, keys: Keys): GameState {
  if (state.status !== "playing") return state;

  const d = Math.min(dt, 0.05); // clamp to avoid tunnelling on long frames
  state.elapsed += d;

  // — Restock counter stations over time —
  for (let i = 0; i < state.stations.length; i++) {
    if (state.stations[i] > 0) state.stations[i] = Math.max(0, state.stations[i] - d);
  }

  // — Move the barista (normalised so diagonals aren't faster) —
  let vx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  let vy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  if (vx !== 0 || vy !== 0) {
    const m = Math.hypot(vx, vy);
    vx /= m;
    vy /= m;
    const b = state.barista;
    b.x = Math.min(FIELD.w - BARISTA_R, Math.max(BARISTA_R, b.x + vx * BARISTA_SPEED * d));
    b.y = Math.min(FIELD.h - BARISTA_R, Math.max(BARISTA_R, b.y + vy * BARISTA_SPEED * d));
  }

  // — Tables are solid: push the barista out of any it overlaps (circle vs
  //   circle), which also lets it slide along the edges instead of stopping. —
  const b = state.barista;
  for (const t of TABLES) {
    const minDist = BARISTA_R + t.r;
    let dx = b.x - t.x;
    let dy = b.y - t.y;
    let dd = Math.hypot(dx, dy);
    if (dd < minDist) {
      if (dd === 0) {
        dx = 0;
        dy = -1;
        dd = 1;
      }
      const push = (minDist - dd) / dd;
      b.x += dx * push;
      b.y += dy * push;
    }
  }
  b.x = Math.min(FIELD.w - BARISTA_R, Math.max(BARISTA_R, b.x));
  b.y = Math.min(FIELD.h - BARISTA_R, Math.max(BARISTA_R, b.y));

  // — At the counter, pick up from the ready station nearest the barista's x.
  //   Walking to a station takes that item; if you're already carrying a
  //   different item it swaps (so you can fix a wrong grab). Standing at a
  //   station that matches what you hold is a no-op (no thrashing/restock). —
  if (state.barista.y <= COUNTER_BACK_Y) {
    let slot = -1;
    let bestDx = Infinity;
    for (let i = 0; i < state.stations.length; i++) {
      if (state.stations[i] > 0) continue; // still restocking
      const dx = Math.abs(STATIONS[i].x - state.barista.x);
      if (dx < bestDx) {
        bestDx = dx;
        slot = i;
      }
    }
    if (slot >= 0 && state.barista.carry !== STATIONS[slot].item) {
      state.barista.carry = STATIONS[slot].item; // item leaves the counter
      state.stations[slot] = STATION_RESTOCK; // and starts restocking
    }
  }

  // — Age waiting customers; storm-outs become 0-star reviews —
  for (const c of state.customers) {
    if (c.state === "waiting") {
      c.wait += d;
      if (c.wait >= PATIENCE) {
        c.state = "reviewing";
        c.stars = 0;
        c.linger = REVIEW_LINGER;
        state.angry += 1;
      }
    } else {
      c.linger -= d;
    }
  }

  // — Serve the nearest reachable waiting customer whose order matches the
  //   item in hand. Carrying the wrong item won't serve them — go swap it. —
  if (state.barista.carry) {
    let best: Customer | null = null;
    let bestDist = SERVE_RADIUS;
    for (const c of state.customers) {
      if (c.state !== "waiting") continue;
      if (c.order !== state.barista.carry) continue;
      const t = TABLES[c.table];
      const dd = dist(state.barista.x, state.barista.y, t.x, t.y);
      if (dd <= bestDist) {
        best = c;
        bestDist = dd;
      }
    }
    if (best) {
      const stars = best.wait <= THREE_STAR_WITHIN ? 3 : 1;
      best.state = "reviewing";
      best.stars = stars;
      best.linger = REVIEW_LINGER;
      state.barista.carry = null;
      state.stars += stars;
      state.served += 1;
      if (stars === 3) state.threeStars += 1;
    }
  }

  // — Remove customers whose review has finished; free their tables —
  if (state.customers.some((c) => c.state === "reviewing" && c.linger <= 0)) {
    const remaining: Customer[] = [];
    for (const c of state.customers) {
      if (c.state === "reviewing" && c.linger <= 0) {
        state.occupied[c.table] = false;
      } else {
        remaining.push(c);
      }
    }
    state.customers = remaining;
  }

  // — Spawn new customers into free tables —
  state.spawnTimer -= d;
  if (state.spawnTimer <= 0) {
    const free = state.occupied
      .map((o, i) => (o ? -1 : i))
      .filter((i) => i >= 0);
    if (free.length > 0) {
      const table = pick(free);
      state.occupied[table] = true;
      state.customers.push({
        id: state.seq++,
        table,
        state: "waiting",
        wait: 0,
        stars: 0,
        linger: 0,
        order: pick(ITEMS),
        look: randomLook(),
      });
      state.spawnTimer = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    } else {
      state.spawnTimer = 0.5; // café full — retry shortly
    }
  }

  if (state.stars >= GOAL_STARS) state.status = "won";

  return state;
}
