import type { Metadata } from "next";
import CafeGame from "@/components/cafe/CafeGame";

export const metadata: Metadata = {
  title: "Barista Rush · Daily Grind",
  description:
    "Run the floor at Daily Grind: serve customers their coffee before they lose patience, rack up 5-star reviews, and become Café of the Year.",
};

export default function CafePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Barista Rush
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Serve the rush, earn the stars
        </h1>
        <p className="mt-4 text-foreground/70">
          Customers stream in and grab a table. Grab a coffee from the counter
          and get it to them fast — quick service earns ⭐⭐⭐, a late one only ⭐,
          and dawdle too long and they storm out. Reach 25 stars to win.
        </p>
      </div>

      <div className="mt-12">
        <CafeGame />
      </div>
    </div>
  );
}
