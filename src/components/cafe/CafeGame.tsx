"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/shopify";
import ProGearShelf from "./ProGearShelf";
import { useCafeGame } from "./useCafeGame";
import { costOf, formatBeans } from "./upgrades";

/** A short-lived "+N 🫘" that floats up from the brew button. */
type Floater = { id: number; amount: number; offset: number };

function awaySummary(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default function CafeGame({ products }: { products: Product[] }) {
  const game = useCafeGame();
  const {
    loaded,
    beans,
    pulls,
    perClick,
    perSec,
    owned,
    upgrades,
    away,
    pull,
    buy,
    grant,
    reset,
    dismissAway,
  } = game;

  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const nextId = useRef(0);

  // Auto-dismiss the loyalty-bonus toast.
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onBrew = useCallback(() => {
    pull();
    const id = nextId.current++;
    const offset = (id % 5) * 14 - 28; // spread floaters horizontally
    setFloaters((f) => [...f, { id, amount: perClick, offset }]);
    window.setTimeout(
      () => setFloaters((f) => f.filter((x) => x.id !== id)),
      900,
    );
  }, [pull, perClick]);

  const onBought = useCallback(
    (bonus: number, title: string) => {
      grant(bonus);
      setToast(`Added ${title} — enjoy ${formatBeans(bonus)} 🫘 on the house!`);
    },
    [grant],
  );

  if (!loaded) {
    return (
      <div className="grid place-items-center py-32 text-foreground/40">
        Warming up the espresso machine…
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
      {/* Brewing column */}
      <section className="flex flex-col items-center rounded-3xl border border-amber-900/10 bg-amber-900/[0.02] p-8 dark:border-amber-100/10 dark:bg-amber-100/[0.03]">
        <div className="text-center">
          <p className="text-5xl font-bold tabular-nums sm:text-6xl">
            {formatBeans(beans)} 🫘
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            {formatBeans(perClick)} per pull · {formatBeans(perSec)}/sec ·{" "}
            {formatBeans(pulls)} pulls
          </p>
        </div>

        <div className="relative my-10 grid place-items-center">
          {floaters.map((f) => (
            <span
              key={f.id}
              className="pointer-events-none absolute -top-2 animate-[cafe-float_0.9s_ease-out_forwards] text-lg font-bold text-amber-700 dark:text-amber-400"
              style={{ left: `calc(50% + ${f.offset}px)` }}
            >
              +{formatBeans(f.amount)}
            </span>
          ))}
          <button
            type="button"
            onClick={onBrew}
            className="size-44 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-7xl shadow-lg transition-transform active:scale-95 sm:size-52"
            aria-label="Pull a shot"
          >
            ☕
          </button>
        </div>
        <p className="text-sm font-medium text-foreground/70">
          Tap the cup to pull a shot
        </p>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset your café? This clears all progress.")) {
              reset();
            }
          }}
          className="mt-6 text-xs text-foreground/40 underline-offset-2 hover:underline"
        >
          Reset café
        </button>
      </section>

      {/* Upgrades + Pro Gear column */}
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-lg font-semibold">Upgrades</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Spend beans to brew faster — by hand and on autopilot.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {upgrades.map((u) => {
              const count = owned[u.id] ?? 0;
              const price = costOf(u, count);
              const affordable = beans >= price;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => buy(u.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-amber-900/10 bg-amber-900/[0.02] p-3 text-left transition-colors enabled:hover:bg-amber-900/[0.06] disabled:opacity-50 dark:border-amber-100/10 dark:bg-amber-100/[0.03] dark:enabled:hover:bg-amber-100/[0.07]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-700/10 text-xl">
                      {u.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-medium">{u.name}</span>
                        {count > 0 && (
                          <span className="shrink-0 text-xs text-foreground/50">
                            ×{count}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-foreground/55">
                        {u.blurb}{" "}
                        <span className="text-foreground/40">
                          (+{u.amount} {u.kind === "click" ? "per pull" : "/sec"}
                          )
                        </span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        affordable
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-foreground/40"
                      }`}
                    >
                      {formatBeans(price)} 🫘
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Pro Gear</h2>
          <p className="mt-1 text-sm text-foreground/60">
            The real thing, shipped to your door. Every order earns loyalty
            beans.
          </p>
          <div className="mt-4">
            <ProGearShelf products={products} onBought={onBought} />
          </div>
        </section>
      </div>

      {/* Away-while-closed banner */}
      {away && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] rounded-full border border-amber-900/10 bg-background/95 px-5 py-3 text-sm shadow-lg backdrop-blur dark:border-amber-100/10">
          While you were away ({awaySummary(away.seconds)}) your café brewed{" "}
          <strong className="text-amber-700 dark:text-amber-400">
            {formatBeans(away.earned)} 🫘
          </strong>
          <button
            type="button"
            onClick={dismissAway}
            className="ml-3 font-medium text-foreground/50 hover:text-foreground"
          >
            Nice ✕
          </button>
        </div>
      )}

      {/* Loyalty-bonus toast */}
      {toast && (
        <div className="fixed inset-x-0 top-20 z-50 mx-auto w-fit max-w-[90vw] rounded-full bg-amber-700 px-5 py-3 text-sm font-medium text-amber-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
