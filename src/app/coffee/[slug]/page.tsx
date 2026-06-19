import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { coffees, getCoffee } from "@/data/coffees";
import AddToCart from "@/components/AddToCart";

export function generateStaticParams() {
  return coffees.map((coffee) => ({ slug: coffee.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const coffee = getCoffee(slug);
  if (!coffee) return { title: "Coffee not found · Daily Grind" };
  return {
    title: `${coffee.name} · Daily Grind`,
    description: coffee.notes,
  };
}

export default async function CoffeePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const coffee = getCoffee(slug);
  if (!coffee) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/#menu"
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← Back to all coffee
      </Link>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        {/* Visual */}
        <div className="grid aspect-square place-items-center rounded-3xl bg-gradient-to-br from-amber-700/15 to-orange-600/10 text-[8rem]">
          {coffee.emoji}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-foreground/50">
            {coffee.origin}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {coffee.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">${coffee.price}</span>
            <span className="rounded-full bg-amber-700/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              {coffee.roast} roast
            </span>
          </div>

          <p className="mt-6 text-foreground/75">{coffee.description}</p>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-foreground/50">Tasting notes</dt>
              <dd>{coffee.notes}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-foreground/50">Size</dt>
              <dd>12 oz · whole bean or ground to order</dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCart coffee={coffee} />
          </div>

          <p className="mt-4 text-sm text-foreground/50">
            Roasted to order · Free shipping over $40
          </p>
        </div>
      </div>
    </div>
  );
}
