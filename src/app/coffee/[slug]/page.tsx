import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  formatPrice,
  getAllProductHandles,
  getProduct,
} from "@/lib/shopify";
import AddToCart from "@/components/AddToCart";

export const revalidate = 60;

export async function generateStaticParams() {
  const handles = await getAllProductHandles();
  return handles.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Coffee not found · Daily Grind" };
  return {
    title: `${product.title} · Daily Grind`,
    description: product.notes ?? product.description.slice(0, 150),
  };
}

export default async function CoffeePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/coffee"
        className="text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        ← Back to all coffee
      </Link>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        {/* Visual */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700/15 to-orange-600/10">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="grid h-full place-items-center text-[8rem]">☕</div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.origin && (
            <span className="text-xs uppercase tracking-wide text-foreground/50">
              {product.origin}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.roast && (
              <span className="rounded-full bg-amber-700/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                {product.roast} roast
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-foreground/75">
              {product.description}
            </p>
          )}

          {product.notes && (
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-foreground/50">
                  Tasting notes
                </dt>
                <dd>{product.notes}</dd>
              </div>
            </dl>
          )}

          <div className="mt-8">
            <AddToCart
              variantId={product.variantId}
              available={product.available}
            />
          </div>

          <p className="mt-4 text-sm text-foreground/50">
            Roasted to order · Free shipping over $40
          </p>
        </div>
      </div>
    </div>
  );
}
