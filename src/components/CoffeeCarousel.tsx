"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/**
 * Auto-rotating, Instagram-style gallery of coffee shots for the home page.
 * Advances every few seconds, pauses on hover, and supports manual nav via the
 * arrows and dots. Images live in /public/gallery.
 */
const SHOTS = [
  { src: "/gallery/coffee-1.jpg", caption: "Two cups, no waiting" },
  { src: "/gallery/coffee-2.jpg", caption: "Latte art on the house" },
  { src: "/gallery/coffee-3.jpg", caption: "The morning pour" },
  { src: "/gallery/coffee-4.jpg", caption: "Small batch, big flavour" },
  { src: "/gallery/coffee-5.jpg", caption: "Beans worth bragging about" },
  { src: "/gallery/coffee-6.jpg", caption: "Warm hands, warmer cup" },
];

const INTERVAL = 4000;

export default function CoffeeCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex((next + SHOTS.length) % SHOTS.length),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(index + 1), INTERVAL);
    return () => clearInterval(id);
  }, [index, paused, go]);

  // Signed distance from the active slide, wrapped to the shortest direction
  // (so the last image sits to the left of the first, etc.).
  const offset = (i: number) => {
    const total = SHOTS.length;
    let d = i - index;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  // Position/scale/opacity for each slide based on its distance from center.
  const slideStyle = (d: number) => {
    if (d === 0) return "z-20 translate-x-0 scale-100 opacity-100";
    if (d === -1)
      return "z-10 -translate-x-[108%] scale-[0.8] opacity-50 cursor-pointer";
    if (d === 1)
      return "z-10 translate-x-[108%] scale-[0.8] opacity-50 cursor-pointer";
    return "z-0 scale-75 opacity-0 pointer-events-none";
  };

  return (
    <section className="border-t border-amber-900/10 dark:border-amber-100/10">
      <div className="pt-20 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
            @dailygrind
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From the café
          </h2>
          <p className="mt-4 text-foreground/70">
            A little look at what we&apos;re brewing. Tag us and you might show
            up here.
          </p>
        </div>

        <div
          className="group relative mx-auto mt-12 h-[200px] w-full max-w-[1600px] overflow-hidden sm:h-[380px] lg:h-[440px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {SHOTS.map((shot, i) => {
            const d = offset(i);
            const isCenter = d === 0;
            return (
              <div
                key={shot.src}
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden={!isCenter}
              >
                <div
                  onClick={() => !isCenter && go(i)}
                  className={`relative aspect-video h-full overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ease-out ${slideStyle(
                    d,
                  )}`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.caption}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 640px) 95vw, 800px"
                    className="object-cover"
                  />
                </div>
              </div>
            );
          })}

          {/* prev / next */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/35 text-white opacity-0 transition-opacity hover:bg-black/55 focus-visible:opacity-100 group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/35 text-white opacity-0 transition-opacity hover:bg-black/55 focus-visible:opacity-100 group-hover:opacity-100"
          >
            ›
          </button>

          {/* dots */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {SHOTS.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
