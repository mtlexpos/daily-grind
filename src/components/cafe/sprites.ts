/**
 * 8-bit pixel-art sprites, generated procedurally and returned as SVG strings
 * (a grid of 1×1 <rect> blocks). CafeScene rasterises each to a tiny canvas at
 * native grid resolution and lets Three.js upscale it with NearestFilter, so
 * the art stays crisp and blocky in 3D. Keeping it as code means no binary
 * assets and full per-customer recolouring / feature mixing.
 *
 * Characters are front-facing in the spirit of classic top-down RPG sprites:
 * a base body plus modular hair, hats, sunglasses, and beards.
 */

import type { ItemType } from "./engine";

export const PERSON_W = 16;
export const PERSON_H = 24;
/** All orderable items share one grid so the renderer can treat them alike. */
export const ITEM_W = 12;
export const ITEM_H = 16;

const OUTLINE = "#1a1320";
const SHOE = "#3a2a1c";
const EYE = "#241a14";

export type Look = {
  skin: string;
  hair: string;
  hairStyle: "short" | "spiky" | "long" | "afro";
  hat: "none" | "beanie" | "fedora" | "cap";
  hatColor: string;
  shirt: string;
  pants: string;
  glasses: boolean;
  beard: boolean;
  /** Draw a barista (brown tee, white apron + chef hat) regardless of hair/hat. */
  barista?: boolean;
  /** Angry expression (brows + frown) for a stormed-out customer. */
  angry?: boolean;
};

type Grid = (string | null)[][];

function makeGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () => new Array<string | null>(w).fill(null));
}

/** Multiply a #rrggbb colour toward black (f < 1) for cheap shading. */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Wrap a coloured grid in an SVG, merging horizontal runs into wide rects. */
function gridToSvg(grid: Grid, w: number, h: number): string {
  let rects = "";
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = grid[y][x];
      if (!c) {
        x++;
        continue;
      }
      let x2 = x + 1;
      while (x2 < w && grid[y][x2] === c) x2++;
      rects += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${c}"/>`;
      x = x2;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
}

/** Add a 1px dark outline on transparent cells touching a filled cell. */
function outline(grid: Grid, w: number, h: number, color: string): Grid {
  const out = grid.map((row) => row.slice());
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] !== null) continue;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (grid[ny][nx] !== null) {
          out[y][x] = color;
          break;
        }
      }
    }
  }
  return out;
}

type Set = (x: number, y: number, c: string) => void;
type Rect = (x0: number, y0: number, x1: number, y1: number, c: string) => void;

/** Allocate a grid, run `draw` over it, outline it, and emit the SVG. */
function buildSvg(w: number, h: number, draw: (set: Set, rect: Rect) => void): string {
  const g = makeGrid(w, h);
  const set: Set = (x, y, c) => {
    if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c;
  };
  const rect: Rect = (x0, y0, x1, y1, c) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
  };
  draw(set, rect);
  return gridToSvg(outline(g, w, h, OUTLINE), w, h);
}

export function personSvg(look: Look): string {
  const W = PERSON_W;
  const H = PERSON_H;
  const g = makeGrid(W, H);

  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c;
  };
  const rect = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
  };

  const skin = look.skin;
  const skinSh = shade(skin, 0.84);
  const shirt = look.barista ? "#6f4a2d" : look.shirt;
  const shirtSh = shade(shirt, 0.8);
  const pants = look.pants;
  const pantsSh = shade(pants, 0.8);
  const hair = look.hair;
  const hairSh = shade(hair, 0.78);

  // ---- Body --------------------------------------------------------------
  // Shoes, legs, hips
  rect(5, 22, 6, 22, SHOE);
  rect(9, 22, 10, 22, SHOE);
  rect(5, 19, 6, 21, pants);
  rect(9, 19, 10, 21, pants);
  set(6, 19, pantsSh);
  set(10, 19, pantsSh);
  rect(5, 18, 10, 18, pants); // hips
  // Torso + arms
  rect(5, 12, 10, 17, shirt);
  rect(10, 12, 10, 17, shirtSh); // shaded right edge
  rect(4, 12, 4, 16, shirt); // left arm
  rect(11, 12, 11, 16, shirtSh); // right arm
  set(4, 17, skin); // hands
  set(11, 17, skin);

  // ---- Head --------------------------------------------------------------
  rect(7, 11, 8, 11, skinSh); // neck
  rect(5, 4, 10, 10, skin);
  rect(5, 10, 10, 10, skinSh); // jaw shading
  set(4, 7, skin); // ears
  set(11, 7, skin);

  // ---- Face --------------------------------------------------------------
  if (look.angry) {
    set(5, 6, EYE); // angled brows
    set(6, 6, EYE);
    set(9, 6, EYE);
    set(10, 6, EYE);
    set(6, 7, EYE);
    set(9, 7, EYE);
    rect(7, 9, 8, 9, EYE); // frown
  } else {
    set(6, 7, EYE);
    set(9, 7, EYE);
    if (!look.beard) {
      set(7, 9, skinSh); // hint of a smile
      set(8, 9, skinSh);
    }
  }

  // Beard covers the lower face.
  if (look.beard && !look.barista) {
    rect(5, 9, 10, 10, hair);
    set(5, 8, hairSh);
    set(10, 8, hairSh);
  }

  // ---- Hair (skipped under a covering hat / the chef hat) ----------------
  const covered = look.barista || look.hat === "beanie" || look.hat === "fedora";
  if (!covered) {
    switch (look.hairStyle) {
      case "spiky":
        set(5, 2, hair);
        set(7, 2, hair);
        set(9, 2, hair);
        rect(5, 3, 10, 4, hair);
        break;
      case "long":
        rect(5, 2, 10, 4, hair);
        rect(4, 4, 4, 9, hair); // hair down the sides
        rect(11, 4, 11, 9, hairSh);
        break;
      case "afro":
        rect(4, 1, 11, 4, hair);
        rect(3, 2, 3, 4, hair); // round bulge
        rect(12, 2, 12, 4, hairSh);
        break;
      default: // short
        rect(5, 2, 10, 4, hair);
        set(5, 5, hair);
        set(10, 5, hairSh);
    }
  } else if (look.hat === "cap" || look.hat === "fedora") {
    // a little hair peeks out at the sides
    set(5, 6, hairSh);
    set(10, 6, hairSh);
  }

  // ---- Hats --------------------------------------------------------------
  if (!look.barista && look.hat !== "none") {
    const hc = look.hatColor;
    const hcSh = shade(hc, 0.7);
    if (look.hat === "beanie") {
      rect(5, 1, 10, 1, hc);
      rect(4, 2, 11, 3, hc);
      rect(4, 4, 11, 4, hcSh); // folded band
    } else if (look.hat === "fedora") {
      rect(5, 1, 10, 1, hc);
      rect(5, 2, 10, 3, hc); // crown
      rect(5, 4, 10, 4, hcSh); // band
      rect(3, 5, 12, 5, hcSh); // brim
    } else {
      // cap
      rect(5, 2, 10, 3, hc); // crown
      rect(5, 4, 10, 4, hc);
      rect(8, 5, 12, 5, hcSh); // brim out one side
    }
  }

  // ---- Sunglasses (over the eyes, after hats) ----------------------------
  if (look.glasses && !look.angry) {
    rect(5, 7, 10, 7, "#111118");
    set(7, 7, "#33333c"); // bridge highlight
    set(8, 7, "#33333c");
  }

  // ---- Barista apron + chef hat ------------------------------------------
  if (look.barista) {
    const apron = "#f2ede3";
    rect(6, 13, 9, 17, apron);
    set(6, 12, apron); // straps
    set(9, 12, apron);
    rect(4, 1, 11, 3, "#fbfbfb"); // chef hat
    rect(5, 0, 10, 0, "#fbfbfb");
    rect(4, 4, 11, 4, "#e6e0d4"); // hat band
  }

  return gridToSvg(outline(g, W, H, OUTLINE), W, H);
}

/** Hot coffee — takeaway cup with a lid, sleeve, and a wisp of steam. */
export function coffeeCupSvg(): string {
  return buildSvg(ITEM_W, ITEM_H, (set, rect) => {
    const cream = "#f3ece0";
    const creamSh = "#ddd3c2";
    const lid = "#6b4a2b";
    const sleeve = "#b9803f";
    // steam
    set(4, 0, "#cdbfa8");
    set(7, 1, "#cdbfa8");
    // lid
    rect(4, 2, 7, 2, "#7a5630");
    rect(3, 3, 8, 3, lid);
    // body
    rect(3, 4, 8, 13, cream);
    rect(8, 4, 8, 13, creamSh); // shaded edge
    rect(4, 14, 7, 14, creamSh); // base
    // sleeve
    rect(3, 8, 8, 9, sleeve);
    rect(8, 8, 8, 9, shade(sleeve, 0.8));
  });
}

/** Iced coffee — clear glass, brown coffee, ice cubes, and a tall straw. */
export function icedCoffeeSvg(): string {
  return buildSvg(ITEM_W, ITEM_H, (set, rect) => {
    const glass = "#dff0f6";
    const glassSh = "#bcd6e0";
    const coffee = "#7a4a2c";
    const ice = "#bfe6f2";
    // straw poking out the top
    set(8, 0, "#e85aa0");
    set(8, 1, "#e85aa0");
    set(7, 2, "#f06fb0");
    set(7, 3, "#f06fb0");
    // glass
    rect(3, 4, 9, 14, glass);
    rect(9, 4, 9, 14, glassSh); // shaded edge
    rect(4, 15, 8, 15, glassSh); // base
    // coffee inside
    rect(4, 6, 8, 13, coffee);
    rect(8, 6, 8, 13, shade(coffee, 0.8));
    // ice cubes
    set(5, 7, ice);
    set(7, 7, ice);
    set(6, 9, ice);
    set(5, 11, ice);
    // straw continues through the drink
    rect(7, 4, 7, 12, "#f06fb0");
  });
}

/** Pastry — a glazed golden bun with a swirl. */
export function pastrySvg(): string {
  return buildSvg(ITEM_W, ITEM_H, (set, rect) => {
    const gold = "#e0a93f";
    const goldSh = "#b07e26";
    const glaze = "#f4cf7a";
    // rounded bun
    rect(4, 5, 8, 5, gold);
    rect(3, 6, 9, 11, gold);
    rect(4, 12, 8, 12, gold);
    // bottom shading
    rect(3, 11, 9, 11, goldSh);
    rect(4, 12, 8, 12, goldSh);
    // swirl / scoring
    set(5, 7, goldSh);
    set(7, 7, goldSh);
    set(6, 8, goldSh);
    set(5, 9, goldSh);
    set(7, 9, goldSh);
    // glaze highlight
    rect(4, 6, 5, 6, glaze);
    set(6, 6, glaze);
  });
}

const ITEM_SVG: Record<ItemType, () => string> = {
  coffee: coffeeCupSvg,
  iced: icedCoffeeSvg,
  pastry: pastrySvg,
};

/** SVG for any orderable item, by type. */
export function itemSvg(item: ItemType): string {
  return ITEM_SVG[item]();
}

/** Data-URI per item, handy for an <img> in the DOM order bubble. */
export const ITEM_DATA_URI: Record<ItemType, string> = {
  coffee: "data:image/svg+xml;utf8," + encodeURIComponent(coffeeCupSvg()),
  iced: "data:image/svg+xml;utf8," + encodeURIComponent(icedCoffeeSvg()),
  pastry: "data:image/svg+xml;utf8," + encodeURIComponent(pastrySvg()),
};
