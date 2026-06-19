import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story · Daily Grind",
  description:
    "Daily Grind has been roasting and brewing small-batch coffee in Montreal since 1976.",
};

const timeline = [
  {
    year: "1976",
    title: "A storefront on the Plateau",
    text: "Giovanni and Maria Russo open a tiny café on a snowy corner of Montreal's Plateau, roasting beans in a secondhand drum out back.",
  },
  {
    year: "1989",
    title: "The neighbourhood roaster",
    text: "Word spreads. Locals start bringing their own tins to fill, and Daily Grind becomes the unofficial living room of the block.",
  },
  {
    year: "2004",
    title: "Direct from the farm",
    text: "The next generation begins travelling to source — building relationships with growers in Ethiopia, Colombia, and beyond.",
  },
  {
    year: "Today",
    title: "Same corner, same care",
    text: "Nearly fifty years on, we still roast in small batches on the Plateau — now shipping freshly roasted bags across Canada.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
        Our Story
      </p>
      <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        Brewing coffee in Montreal since 1976
      </h1>
      <p className="mt-6 text-lg text-foreground/75">
        Daily Grind started with a single drum roaster, a corner storefront, and
        a stubborn belief that a good cup of coffee can anchor a whole
        neighbourhood. Five decades later, that belief still guides everything we
        do.
      </p>

      <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700/15 to-orange-600/10">
        <Image
          src="/coffee-shop.jpg"
          alt="Pouring fresh milk into a bowl in our café kitchen"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="mt-14 space-y-10">
        {timeline.map((item) => (
          <div
            key={item.year}
            className="grid gap-2 border-l-2 border-amber-700/30 pl-6 sm:grid-cols-[6rem_1fr] sm:gap-6 sm:border-l-0 sm:pl-0"
          >
            <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
              {item.year}
            </div>
            <div>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-foreground/70">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-amber-900/10 bg-amber-900/[0.03] p-8 text-center dark:border-amber-100/10 dark:bg-amber-100/[0.04]">
        <h2 className="text-2xl font-bold tracking-tight">
          Taste five decades of practice
        </h2>
        <p className="mx-auto mt-3 max-w-md text-foreground/70">
          Every bag we ship carries the same care we put into our very first
          roast.
        </p>
        <Link
          href="/coffee"
          className="mt-6 inline-block rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600"
        >
          Shop our coffee
        </Link>
      </div>
    </div>
  );
}
