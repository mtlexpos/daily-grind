import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping · Daily Grind",
  description:
    "Daily Grind shipping rates and delivery times for Canada and United States orders.",
};

type Rate = { method: string; time: string; cost: string; freeOver: string };

const canada: Rate[] = [
  { method: "Standard", time: "3–7 business days", cost: "$9.95 CAD", freeOver: "Orders over $50" },
  { method: "Express", time: "1–3 business days", cost: "$19.95 CAD", freeOver: "—" },
];

const usa: Rate[] = [
  { method: "Standard", time: "5–9 business days", cost: "$14.95 USD", freeOver: "Orders over $60" },
  { method: "Express", time: "2–4 business days", cost: "$29.95 USD", freeOver: "—" },
];

function RateTable({ title, rates }: { title: string; rates: Rate[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-900/10 dark:border-amber-100/10">
      <div className="border-b border-amber-900/10 bg-amber-900/[0.03] px-5 py-3 font-semibold dark:border-amber-100/10 dark:bg-amber-100/[0.04]">
        {title}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-foreground/60">
          <tr className="border-b border-amber-900/10 dark:border-amber-100/10">
            <th className="px-5 py-3 font-medium">Method</th>
            <th className="px-5 py-3 font-medium">Delivery time</th>
            <th className="px-5 py-3 font-medium">Rate</th>
            <th className="px-5 py-3 font-medium">Free shipping</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr
              key={r.method}
              className="border-b border-amber-900/[0.06] last:border-0 dark:border-amber-100/[0.06]"
            >
              <td className="px-5 py-3 font-medium">{r.method}</td>
              <td className="px-5 py-3 text-foreground/70">{r.time}</td>
              <td className="px-5 py-3 text-foreground/70">{r.cost}</td>
              <td className="px-5 py-3 text-foreground/70">{r.freeOver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Shipping
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Shipping rates &amp; delivery
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-foreground/70">
          We roast to order and ship within 48 hours, so your beans arrive
          fresh. Rates and delivery windows are below.
        </p>
      </div>

      {/* destinations note */}
      <div className="mt-10 rounded-2xl border border-amber-700/30 bg-amber-700/[0.06] px-5 py-4 text-sm text-foreground/80">
        <span className="font-semibold">Where we ship:</span> we currently ship
        to <span className="font-medium">Canada</span> and the{" "}
        <span className="font-medium">United States</span> only. More
        destinations are coming — check back soon.
      </div>

      <div className="mt-10 space-y-6">
        <RateTable title="🇨🇦 Canada" rates={canada} />
        <RateTable title="🇺🇸 United States" rates={usa} />
      </div>

      {/* details */}
      <div className="mt-12 space-y-6 text-sm text-foreground/70">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Processing &amp; roasting
          </h2>
          <p className="mt-2">
            Orders are roasted to order and dispatched within 48 hours
            (Monday–Friday). Delivery estimates above start once your order
            ships, not at checkout.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Free shipping
          </h2>
          <p className="mt-2">
            Standard shipping is free on Canadian orders over $50 CAD and U.S.
            orders over $60 USD. Every{" "}
            <Link
              href="/subscriptions"
              className="font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
            >
              subscription
            </Link>{" "}
            order ships free, with no minimum.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Duties &amp; taxes
          </h2>
          <p className="mt-2">
            U.S. orders ship duty-paid — the price at checkout is all you owe.
            Applicable sales tax is calculated at checkout based on your
            destination.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Questions about an order?
          </h2>
          <p className="mt-2">
            Reach out any time on our{" "}
            <Link
              href="/contact"
              className="font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
            >
              contact page
            </Link>{" "}
            and we&apos;ll help track it down.
          </p>
        </div>
      </div>
    </div>
  );
}
