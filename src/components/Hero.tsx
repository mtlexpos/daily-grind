export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* warm background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(180,83,9,0.20),_transparent_55%)]"
      />

      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-amber-900/[0.04] px-3 py-1 text-xs font-medium text-foreground/70 dark:border-amber-100/15 dark:bg-amber-100/[0.05]">
          <span className="size-1.5 rounded-full bg-amber-600" />
          Roasted to order · Shipped within 48 hours
        </span>

        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Coffee worth{" "}
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            waking up for
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-foreground/70">
          We source ethical, single-origin beans from farmers we know by name,
          then roast them in small batches right here. Every bag lands on your
          doorstep within two days of roasting.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#menu"
            className="w-full rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600 sm:w-auto"
          >
            Shop our coffee
          </a>
          <a
            href="#subscription"
            className="w-full rounded-full border border-amber-900/15 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-amber-900/[0.04] dark:border-amber-100/15 dark:hover:bg-amber-100/[0.05] sm:w-auto"
          >
            Start a subscription
          </a>
        </div>

        <p className="mt-6 text-sm text-foreground/50">
          Free shipping over $40 · Cancel your subscription anytime
        </p>
      </div>
    </section>
  );
}
