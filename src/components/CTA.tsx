import Image from "next/image";
import Link from "next/link";

export default function CTA() {
  return (
    <section id="subscription" className="border-t border-amber-900/10 dark:border-amber-100/10">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-amber-50 sm:px-16">
          {/* calendar backdrop — evokes scheduling your deliveries */}
          <Image
            src="/calendar.jpg"
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
          {/* warm overlay keeps the brand colour and text legibility */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-amber-800/90 to-orange-600/85"
          />
          <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Never run out of great coffee
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-amber-50/85">
            Set up a subscription and we&apos;ll deliver freshly roasted beans on
            your schedule — weekly, biweekly, or monthly. Adjust, pause, or
            cancel anytime.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/subscriptions"
              className="w-full rounded-full bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-white sm:w-auto"
            >
              Build my subscription
            </Link>
            <Link
              href="/coffee"
              className="w-full rounded-full border border-amber-50/40 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-50/10 sm:w-auto"
            >
              Browse the coffee
            </Link>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
