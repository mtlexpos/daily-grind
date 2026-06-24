import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-amber-900/10 dark:border-amber-100/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-foreground/60 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid size-6 place-items-center rounded-full bg-amber-700 text-xs">
            ☕
          </span>
          Daily Grind
        </div>
        <p>© {new Date().getFullYear()} Daily Grind. Roasted with care.</p>
        <div className="flex gap-6">
          <Link href="/wholesale" className="transition-colors hover:text-foreground">
            Wholesale
          </Link>
          <Link href="/shipping" className="transition-colors hover:text-foreground">
            Shipping
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
