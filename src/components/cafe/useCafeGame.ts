"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  UPGRADES,
  beansPerClick,
  beansPerSecond,
  costOf,
  getUpgrade,
} from "./upgrades";

/**
 * Café Tycoon — game state, persisted to localStorage the same way the cart id
 * is (see CartContext). One serialisable blob holds everything; derived numbers
 * (per-click, per-second) are recomputed from `owned` rather than stored.
 */

const STORAGE_KEY = "daily-grind-cafe-v1";
const SCHEMA_VERSION = 1;

/** Passive income tick. Beans are fractional internally, floored for display. */
const TICK_MS = 250;
/** Offline earnings are capped so a long absence can't mint an empire. */
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
/** Persist cadence — avoids writing localStorage on every animation tick. */
const SAVE_MS = 3_000;

type GameState = {
  v: number;
  beans: number;
  totalEarned: number;
  pulls: number;
  owned: Record<string, number>;
  lastSeen: number;
};

export type AwayReport = { seconds: number; earned: number };

function freshState(): GameState {
  return {
    v: SCHEMA_VERSION,
    beans: 0,
    totalEarned: 0,
    pulls: 0,
    owned: {},
    lastSeen: Date.now(),
  };
}

function load(): { state: GameState; away: AwayReport | null } {
  if (typeof window === "undefined") return { state: freshState(), away: null };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: freshState(), away: null };

    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.v !== SCHEMA_VERSION) return { state: freshState(), away: null };

    const state: GameState = {
      ...freshState(),
      ...parsed,
      owned: parsed.owned ?? {},
    };

    // Award capped passive income earned while the tab was closed.
    const elapsed = Math.max(0, (Date.now() - state.lastSeen) / 1000);
    const seconds = Math.min(elapsed, MAX_OFFLINE_SECONDS);
    const perSec = beansPerSecond(state.owned);
    const earned = Math.floor(perSec * seconds);

    if (earned > 0) {
      state.beans += earned;
      state.totalEarned += earned;
      return { state, away: { seconds: Math.floor(seconds), earned } };
    }
    return { state, away: null };
  } catch {
    return { state: freshState(), away: null };
  }
}

export function useCafeGame() {
  const [state, setState] = useState<GameState>(freshState);
  const [loaded, setLoaded] = useState(false);
  const [away, setAway] = useState<AwayReport | null>(null);

  // Keep a ref in sync so the save loop / unload handler read current state
  // without re-subscribing on every change.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Restore the saved game (and offline earnings) once, on mount. This must run
  // after mount rather than in a lazy initializer: reading localStorage and
  // Date.now() on the server would diverge from the client and break hydration.
  useEffect(() => {
    const { state: restored, away: report } = load();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time client-only restore
    setState(restored);
    setAway(report);
    setLoaded(true);
  }, []);

  // Passive income: add a fraction of beans/sec every tick.
  useEffect(() => {
    if (!loaded) return;
    const id = window.setInterval(() => {
      setState((s) => {
        const perSec = beansPerSecond(s.owned);
        if (perSec === 0) return s;
        const gain = perSec * (TICK_MS / 1000);
        return { ...s, beans: s.beans + gain, totalEarned: s.totalEarned + gain };
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [loaded]);

  // Persist on an interval plus whenever the tab is hidden or unloaded.
  useEffect(() => {
    if (!loaded) return;
    const save = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...stateRef.current, lastSeen: Date.now() }),
        );
      } catch {
        // storage full / unavailable — keep playing in memory
      }
    };
    const id = window.setInterval(save, SAVE_MS);
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [loaded]);

  const pull = useCallback(() => {
    setState((s) => {
      const gain = beansPerClick(s.owned);
      return {
        ...s,
        beans: s.beans + gain,
        totalEarned: s.totalEarned + gain,
        pulls: s.pulls + 1,
      };
    });
  }, []);

  const buy = useCallback((id: string) => {
    setState((s) => {
      const upgrade = getUpgrade(id);
      if (!upgrade) return s;
      const owned = s.owned[id] ?? 0;
      const price = costOf(upgrade, owned);
      if (s.beans < price) return s;
      return {
        ...s,
        beans: s.beans - price,
        owned: { ...s.owned, [id]: owned + 1 },
      };
    });
  }, []);

  /** Add beans from outside the loop (e.g. a Pro Gear purchase bonus). */
  const grant = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((s) => ({
      ...s,
      beans: s.beans + amount,
      totalEarned: s.totalEarned + amount,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(freshState());
    setAway(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const dismissAway = useCallback(() => setAway(null), []);

  return {
    loaded,
    beans: state.beans,
    totalEarned: state.totalEarned,
    pulls: state.pulls,
    owned: state.owned,
    perClick: beansPerClick(state.owned),
    perSec: beansPerSecond(state.owned),
    upgrades: UPGRADES,
    away,
    pull,
    buy,
    grant,
    reset,
    dismissAway,
  };
}
