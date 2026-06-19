import Link from "next/link";

const links = [
  { href: "#menu", label: "Our Coffee" },
  { href: "#subscription", label: "Subscriptions" },
  { href: "#story", label: "Our Story" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/10 bg-background/80 backdrop-blur-md dark:border-amber-100/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-full bg-amber-700 text-sm">
            ☕
          </span>
          Daily Grind
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-foreground/70 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:block"
          >
            Cart (0)
          </a>
          <a
            href="#menu"
            className="rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600"
          >
            Shop beans
          </a>
        </div>
      </nav>
    </header>
  );
}
