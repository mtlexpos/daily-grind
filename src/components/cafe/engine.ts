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

/** Counter occupies the back strip; standing in it (y <= this) grabs a coffee. */
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

/** Fresh cups sitting on the counter, and how long a taken one takes to refill. */
export const CUP_SLOTS = 5;
export const CUP_RESTOCK = 4;

const SPAWN_MIN = 2.2;
const SPAWN_MAX = 4.0;
const FIRST_SPAWN = 0.8;

/** Six tables: 3 columns × 2 rows, in front of the counter. */
export const TABLES: { x: number; y: number }[] = [0, 1, 2, 3, 4, 5].map((i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { x: 200 + col * 300, y: 235 + row * 210 };
});

// Sprite palettes — picked per customer for visual variety.
const SKINS = ["#f6cda6", "#e9b487", "#cf9560", "#a96f3e", "#7c4a24"];
const HAIRS = ["#241a12", "#5a3a1f", "#8a5a2b", "#c9a24b", "#d9d2c4", "#3b3b3b"];
const SHIRTS = ["#c0552f", "#2f6dc0", "#2fa05a", "#8e54b0", "#dca12f", "#d24f7a", "#359c9c"];

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
  // Appearance.
  skin: string;
  hair: string;
  shirt: string;
};

export type GameState = {
  status: "playing" | "won";
  stars: number;
  served: number; // reviews left (3- or 1-star; angry exits don't count)
  threeStars: number;
  angry: number;
  elapsed: number;
  barista: { x: number; y: number; carrying: boolean };
  customers: Customer[];
  occupied: boolean[]; // per table
  /** Per cup slot: 0 = ready on the counter, >0 = seconds until restocked. */
  cups: number[];
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
    barista: { x: FIELD.w / 2, y: FIELD.h - 60, carrying: false },
    customers: [],
    occupied: [false, false, false, false, false, false],
    cups: new Array(CUP_SLOTS).fill(0),
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

  // — Restock cups over time —
  for (let i = 0; i < state.cups.length; i++) {
    if (state.cups[i] > 0) state.cups[i] = Math.max(0, state.cups[i] - d);
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

  // — Grab a ready cup when standing at the counter empty-handed —
  if (!state.barista.carrying && state.barista.y <= COUNTER_BACK_Y) {
    const slot = state.cups.findIndex((t) => t <= 0);
    if (slot >= 0) {
      state.cups[slot] = CUP_RESTOCK; // cup leaves the counter, starts refilling
      state.barista.carrying = true;
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

  // — Serve the nearest reachable waiting customer if carrying a coffee —
  if (state.barista.carrying) {
    let best: Customer | null = null;
    let bestDist = SERVE_RADIUS;
    for (const c of state.customers) {
      if (c.state !== "waiting") continue;
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
      state.barista.carrying = false;
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
        skin: pick(SKINS),
        hair: pick(HAIRS),
        shirt: pick(SHIRTS),
      });
      state.spawnTimer = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    } else {
      state.spawnTimer = 0.5; // café full — retry shortly
    }
  }

  if (state.stars >= GOAL_STARS) state.status = "won";

  return state;
}
