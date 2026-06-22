import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions · Daily Grind",
  description:
    "Fresh-roasted coffee delivered on your schedule. Choose your beans, pick a cadence, and adjust, pause, or cancel anytime.",
};

const steps = [
  {
    n: "1",
    title: "Pick your beans",
    text: "Choose any roast from our collection — or let us surprise you with the roaster's pick each delivery.",
  },
  {
    n: "2",
    title: "Choose a cadence",
    text: "Weekly, biweekly, or monthly. Tell us how fast you drink it and we'll keep you stocked.",
  },
  {
    n: "3",
    title: "We roast & ship",
    text: "We roast to order and ship within 48 hours, so every bag lands fresh on your doorstep.",
  },
];

const plans = [
  {
    name: "Weekly",
    blurb: "For the serious daily drinker or a busy household.",
    cadence: "Every week",
    perk: "Save 15%",
    featured: false,
  },
  {
    name: "Biweekly",
    blurb: "Our most popular rhythm — a fresh bag right as you run low.",
    cadence: "Every 2 weeks",
    perk: "Save 12%",
    featured: true,
  },
  {
    name: "Monthly",
    blurb: "A steady supply for the once-a-day cup.",
    cadence: "Every month",
    perk: "Save 10%",
    featured: false,
  },
];

const perks = [
  "Free shipping on every subscription order",
  "Adjust your beans, size, or cadence anytime",
  "Skip, pause, or cancel with no fees",
  "Roasted to order — never sits on a shelf",
];

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      {/* intro */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Subscriptions
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Great coffee, on repeat
        </h1>
        <p className="mt-4 text-lg text-foreground/70">
          Set it up once and we&apos;ll deliver freshly roasted beans on your
          schedule. You stay in control — adjust, pause, or cancel whenever you
          like.
        </p>
      </div>

      {/* how it works */}
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.n}
            className="rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 dark:border-amber-100/10 dark:bg-amber-100/[0.03]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-amber-700 text-sm font-bold text-amber-50">
              {step.n}
            </span>
            <h2 className="mt-4 font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{step.text}</p>
          </div>
        ))}
      </div>

      {/* plans */}
      <div className="mt-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Choose your cadence
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                plan.featured
                  ? "border-amber-700 bg-amber-700/[0.06] shadow-sm"
                  : "border-amber-900/10 bg-amber-900/[0.02] dark:border-amber-100/10 dark:bg-amber-100/[0.03]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-3 py-1 text-xs font-semibold text-amber-50">
                  Most popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                {plan.cadence} · {plan.perk}
              </p>
              <p className="mt-3 flex-1 text-sm text-foreground/70">
                {plan.blurb}
              </p>
              <Link
                href="/coffee"
                className={`mt-6 inline-block rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.featured
                    ? "bg-amber-700 text-amber-50 hover:bg-amber-600"
                    : "border border-amber-900/15 text-foreground hover:bg-amber-900/[0.04] dark:border-amber-100/15 dark:hover:bg-amber-100/[0.05]"
                }`}
              >
                Choose beans
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* perks */}
      <div className="mt-20 rounded-3xl border border-amber-900/10 bg-amber-900/[0.03] p-8 dark:border-amber-100/10 dark:bg-amber-100/[0.04] sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight">Why subscribe</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-foreground/80">
              <span className="mt-0.5 text-amber-700 dark:text-amber-400">✓</span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* closing CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready when you are
        </h2>
        <p className="mx-auto mt-3 max-w-md text-foreground/70">
          Browse the collection and pick the beans you&apos;d like delivered.
        </p>
        <Link
          href="/coffee"
          className="mt-6 inline-block rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600"
        >
          Start with the coffee
        </Link>
      </div>
    </div>
  );
}
