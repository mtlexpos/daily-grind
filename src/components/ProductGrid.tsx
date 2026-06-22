"use client";

import { useMemo, useState } from "react";
import { type Product } from "@/lib/shopify";
import ProductCard from "./ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name: A–Z" },
];

/** Unique, sorted, non-empty values for a facet across the products. */
function facetValues(products: Product[], pick: (p: Product) => string | undefined) {
  return Array.from(
    new Set(products.map(pick).filter((v): v is string => Boolean(v))),
  ).sort((a, b) => a.localeCompare(b));
}

/**
 * Client-side filtered/sorted product grid shared by the coffee and merch
 * collection pages. Facets (roast, origin) only render when the data has them,
 * so the same component works for both collections.
 */
export default function ProductGrid({
  products,
  linkToDetail = true,
}: {
  products: Product[];
  linkToDetail?: boolean;
}) {
  const roasts = useMemo(() => facetValues(products, (p) => p.roast), [products]);
  const origins = useMemo(() => facetValues(products, (p) => p.origin), [products]);

  const [search, setSearch] = useState("");
  const [activeRoasts, setActiveRoasts] = useState<string[]>([]);
  const [activeOrigins, setActiveOrigins] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  const toggle = (
    value: string,
    list: string[],
    set: (next: string[]) => void,
  ) => set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (activeRoasts.length && !(p.roast && activeRoasts.includes(p.roast))) return false;
      if (activeOrigins.length && !(p.origin && activeOrigins.includes(p.origin))) return false;
      if (inStockOnly && !p.available) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "name":
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return result;
    }
  }, [products, search, activeRoasts, activeOrigins, inStockOnly, sort]);

  const hasFilters =
    Boolean(search) ||
    activeRoasts.length > 0 ||
    activeOrigins.length > 0 ||
    inStockOnly;

  const clearAll = () => {
    setSearch("");
    setActiveRoasts([]);
    setActiveOrigins([]);
    setInStockOnly(false);
  };

  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${
      active
        ? "border-amber-700 bg-amber-700 text-amber-50"
        : "border-amber-900/15 text-foreground/70 hover:border-amber-700/50 dark:border-amber-100/15"
    }`;

  return (
    <div className="mt-12">
      {/* controls */}
      <div className="rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-5 dark:border-amber-100/10 dark:bg-amber-100/[0.03]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-full border border-amber-900/15 bg-background px-4 py-2 text-sm outline-none focus:border-amber-700 dark:border-amber-100/15 sm:max-w-xs"
          />
          <div className="flex items-center gap-3 sm:ml-auto">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="size-4 accent-amber-700"
              />
              In stock only
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-amber-900/15 bg-background px-3 py-2 text-sm outline-none focus:border-amber-700 dark:border-amber-100/15"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {(roasts.length > 0 || origins.length > 0) && (
          <div className="mt-4 flex flex-col gap-3 border-t border-amber-900/10 pt-4 dark:border-amber-100/10">
            {roasts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium uppercase tracking-wide text-foreground/50">
                  Roast
                </span>
                {roasts.map((roast) => (
                  <button
                    key={roast}
                    type="button"
                    onClick={() => toggle(roast, activeRoasts, setActiveRoasts)}
                    className={pill(activeRoasts.includes(roast))}
                  >
                    {roast}
                  </button>
                ))}
              </div>
            )}
            {origins.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium uppercase tracking-wide text-foreground/50">
                  Origin
                </span>
                {origins.map((origin) => (
                  <button
                    key={origin}
                    type="button"
                    onClick={() => toggle(origin, activeOrigins, setActiveOrigins)}
                    className={pill(activeOrigins.includes(origin))}
                  >
                    {origin}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* result summary */}
      <div className="mt-6 flex items-center justify-between text-sm text-foreground/60">
        <span>
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="font-medium text-amber-700 hover:underline dark:text-amber-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* grid */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              linkToDetail={linkToDetail}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-amber-900/20 p-12 text-center text-foreground/60 dark:border-amber-100/20">
          <p className="text-lg font-medium">No matches</p>
          <p className="mt-2 text-sm">
            Try removing a filter or searching for something else.
          </p>
        </div>
      )}
    </div>
  );
}
