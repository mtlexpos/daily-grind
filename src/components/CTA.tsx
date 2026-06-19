export default function CTA() {
  return (
    <section id="subscription" className="border-t border-amber-900/10 dark:border-amber-100/10">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 to-orange-600 px-8 py-16 text-center text-amber-50 sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Never run out of great coffee
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-amber-50/85">
            Set up a subscription and we&apos;ll deliver freshly roasted beans on
            your schedule — weekly, biweekly, or monthly. Adjust, pause, or
            cancel anytime.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="w-full rounded-full bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-white sm:w-auto"
            >
              Build my subscription
            </a>
            <a
              href="#menu"
              className="w-full rounded-full border border-amber-50/40 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-50/10 sm:w-auto"
            >
              Browse the coffee
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
