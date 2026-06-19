import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/shopify";
import AddToCartButton from "./AddToCartButton";

/**
 * Product card shared by the coffee menu and the merch grid. Coffee cards link
 * to a detail page; merch cards (linkToDetail=false) just show add-to-cart.
 */
export default function ProductCard({
  product,
  linkToDetail = true,
}: {
  product: Product;
  linkToDetail?: boolean;
}) {
  const media = (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-amber-700/15 to-orange-600/10">
      {product.image ? (
        <Image
          src={product.image.url}
          alt={product.image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="grid h-full place-items-center text-6xl">☕</div>
      )}
      {product.roast && (
        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
          {product.roast}
        </span>
      )}
    </div>
  );

  const title = (
    <h3 className="mt-4 font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-400">
      {product.title}
    </h3>
  );

  return (
    <div className="group flex flex-col rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 transition-colors hover:bg-amber-900/[0.05] dark:border-amber-100/10 dark:bg-amber-100/[0.03] dark:hover:bg-amber-100/[0.06]">
      {linkToDetail ? (
        <Link href={`/coffee/${product.handle}`} className="flex flex-col">
          {media}
          {title}
        </Link>
      ) : (
        <>
          {media}
          {title}
        </>
      )}

      {product.origin && (
        <p className="mt-1 text-xs uppercase tracking-wide text-foreground/50">
          {product.origin}
        </p>
      )}
      {product.notes && (
        <p className="mt-3 text-sm text-foreground/70">{product.notes}</p>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-amber-900/10 pt-4 dark:border-amber-100/10">
        <span className="font-semibold">
          {formatPrice(product.price, product.currency)}
        </span>
        <AddToCartButton
          variantId={product.variantId}
          available={product.available}
        />
      </div>
    </div>
  );
}
