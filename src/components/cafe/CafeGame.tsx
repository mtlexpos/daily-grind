"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  FIELD,
  GOAL_STARS,
  createInitialState,
  step,
  type GameState,
  type Keys,
} from "./engine";

// WebGL needs the browser — load the 3D scene client-side only.
const CafeScene = dynamic(() => import("./CafeScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-foreground/40">
      Loading the café…
    </div>
  ),
});

const KEY_MAP: Record<string, keyof Keys> = {
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
};

export default function CafeGame() {
  // `game` is the authoritative mutable state, advanced inside the rAF loop;
  // `view` is the React-rendered snapshot pushed once per frame. Render reads
  // only `view` so we never touch a ref during render.
  const game = useRef<GameState>(createInitialState());
  const keys = useRef<Keys>({ up: false, down: false, left: false, right: false });
  const [view, setView] = useState<GameState>(() => createInitialState());

  // Keyboard: track held movement keys; swallow arrow-key page scrolling.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      keys.current[dir] = true;
    };
    const up = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key.toLowerCase()];
      if (dir) keys.current[dir] = false;
    };
    const blur = () => {
      keys.current = { up: false, down: false, left: false, right: false };
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Animation loop: advance the engine by real elapsed time, then re-render.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (ts: number) => {
      const dt = (ts - last) / 1000;
      last = ts;
      step(game.current, dt, keys.current);
      setView({ ...game.current });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const restart = useCallback(() => {
    game.current = createInitialState();
    setView({ ...game.current });
  }, []);

  const s = view;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* HUD */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            ⭐ {s.stars} / {GOAL_STARS} stars
          </span>
          <span className="text-foreground/55">
            {s.threeStars} perfect · {s.angry} stormed out
          </span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-amber-900/10 dark:bg-amber-100/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-[width] duration-300"
            style={{ width: `${Math.min(100, (s.stars / GOAL_STARS) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3D play field */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border border-amber-900/15 shadow-inner dark:border-amber-100/15"
        style={{ aspectRatio: `${FIELD.w} / ${FIELD.h}` }}
      >
        <CafeScene state={s} />

        {/* Win overlay */}
        {s.status === "won" && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-amber-950/70 backdrop-blur-sm">
            <div className="mx-4 max-w-sm rounded-3xl bg-background p-8 text-center shadow-2xl">
              <p className="text-5xl">🏆</p>
              <h2 className="mt-3 text-2xl font-bold">Café of the Year!</h2>
              <p className="mt-2 text-foreground/70">
                You earned {s.stars} stars — {s.threeStars} perfect pours and
                only {s.angry} walkout{s.angry === 1 ? "" : "s"}.
              </p>
              <button
                type="button"
                onClick={restart}
                className="mt-6 rounded-full bg-amber-700 px-6 py-2.5 font-medium text-amber-50 transition-colors hover:bg-amber-600"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls help */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/60">
        <p>
          <span className="font-medium text-foreground/80">WASD / arrows</span>{" "}
          to move. Each customer wants a specific order — hot coffee, iced
          coffee, or a pastry (shown in their bubble). Grab the matching item
          from its counter station (coffee · iced · pastry, left to right), then
          walk into that customer to serve. Wrong item? Walk to another station
          to swap it.
        </p>
        <button
          type="button"
          onClick={restart}
          className="rounded-full border border-amber-900/15 px-3 py-1 text-xs hover:bg-amber-900/5 dark:border-amber-100/15 dark:hover:bg-amber-100/5"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
