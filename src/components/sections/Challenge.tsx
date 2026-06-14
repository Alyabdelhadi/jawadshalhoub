"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

import CountUp from "@/components/fx/CountUp";
import InView from "@/components/fx/InView";
import { CHALLENGE_HEADLINE, MOUNTAINS } from "@/lib/constants";
import { catalog, type MediaImage } from "@/lib/media-catalog";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

// Client-only WebGL layers — kept off the SSR/critical path.
const Globe = dynamic(() => import("@/components/fx/Globe"), { ssr: false });
const Particles = dynamic(() => import("@/components/fx/Particles"), {
  ssr: false,
});

// Map each MOUNTAINS entry to its photo + a starting continent coordinate.
const CARDS = [
  {
    mountain: MOUNTAINS[0],
    image: catalog.challenge.kilimanjaro,
    coord: [-3.0674, 37.3556] as [number, number],
  },
  {
    mountain: MOUNTAINS[1],
    image: catalog.challenge.elbrus,
    coord: [43.3499, 42.4453] as [number, number],
  },
] as const;

// Origin of the journey — Beirut, Lebanon.
const BEIRUT = [33.8938, 35.5018] as [number, number];

// Animated route: Beirut -> Africa (Kilimanjaro) -> Europe (Elbrus).
const ARC = [
  { from: BEIRUT, to: CARDS[0].coord },
  { from: CARDS[0].coord, to: CARDS[1].coord },
];
const MARKERS = [BEIRUT, CARDS[0].coord, CARDS[1].coord];

type CardProps = {
  mountain: (typeof MOUNTAINS)[number];
  image: MediaImage;
  tiltEnabled: boolean;
  reduced: boolean;
  index: number;
};

function MountainCard({
  mountain,
  image,
  tiltEnabled,
  reduced,
  index,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Raw pointer offset (-0.5 .. 0.5), spring-smoothed, mapped to small tilts.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18, mass: 0.5 });
  const transform = useMotionTemplate`perspective(1000px) rotateX(${srx}deg) rotateY(${sry}deg)`;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tiltEnabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rx.set(-py * 9);
      ry.set(px * 9);
    },
    [tiltEnabled, rx, ry]
  );

  const onPointerLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
  }, [rx, ry]);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px 200px 0px" }}
      transition={{
        duration: 0.9,
        delay: reduced ? 0 : index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="w-full [transform-style:preserve-3d]"
    >
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={tiltEnabled ? { transform } : undefined}
        className="glass group relative aspect-[3/4] w-full overflow-hidden rounded-3xl will-change-transform sm:aspect-[4/5]"
      >
        {/* Photo */}
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 768px) 45vw, 90vw"
          alt={image.alt}
          loading="eager"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${
            reduced ? "" : "group-hover:scale-105"
          }`}
        />

        {/* Legibility gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-ink) 30%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--color-ink) 35%, transparent) 60%, var(--color-ink) 100%)",
          }}
        />

        {/* Drifting soft cloud accent */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-x-1/4 top-1/4 h-1/2 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, color-mix(in srgb, var(--color-snow) 22%, transparent) 0%, transparent 70%)",
            }}
            animate={{ x: ["-12%", "12%", "-12%"], opacity: [0.5, 0.8, 0.5] }}
            transition={{
              duration: 16 + index * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Overlaid text */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lebanon-red">
            {mountain.continent}
          </span>
          <h3
            className="mt-2 font-display uppercase leading-[0.95] tracking-tight text-snow"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
            }}
          >
            {mountain.name}
          </h3>

          <div className="mt-4 border-t border-snow/15 pt-4">
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.3em] text-snow/55">
              Altitude
            </span>
            <CountUp
              value={mountain.altitude}
              suffix=" m"
              className="mt-1 block font-display text-snow"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Challenge() {
  const { reduced, isMobile } = useMotionPrefs();
  const tiltEnabled = !reduced && !isMobile;

  return (
    <section
      id="challenge"
      className="relative isolate w-full overflow-hidden bg-ink py-24 text-snow sm:py-32"
    >
      {/* ---- Atmospheric background ---- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(110% 80% at 50% 0%, color-mix(in srgb, var(--color-lebanon-green) 14%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 88%, #06101f) 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <InView className="absolute inset-0" rootMargin="300px">
          <Particles variant="snow" count={350} />
        </InView>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-8">
        {/* ---- Heading ---- */}
        <motion.h2
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "0px 0px 200px 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-balance text-center font-display uppercase leading-[0.95] tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
          }}
        >
          {CHALLENGE_HEADLINE}
        </motion.h2>

        {/* ---- Mountain cards ---- */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 md:grid-cols-2 md:gap-10">
          {CARDS.map((card, i) => (
            <MountainCard
              key={card.mountain.name}
              mountain={card.mountain}
              image={card.image}
              tiltEnabled={tiltEnabled}
              reduced={reduced}
              index={i}
            />
          ))}
        </div>

        {/* ---- Beirut -> Africa -> Europe globe route ---- */}
        <div className="mt-20 flex flex-col items-center sm:mt-28">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-snow/55">
            Beirut &rarr; Africa &rarr; Europe
          </span>

          <div className="relative mt-6 aspect-square w-full max-w-[280px] sm:max-w-[420px]">
            <InView className="absolute inset-0" rootMargin="300px">
              <Globe arcs={ARC} markers={MARKERS} originIndex={0} autoRotate />
            </InView>
          </div>

          {/* Route legend (the globe rotates, so labels live below it) */}
          <ol className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-snow/75">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lebanon-red shadow-[0_0_10px_var(--color-lebanon-red)]" />
              Beirut
            </li>
            <li aria-hidden className="text-snow/35">&rarr;</li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-snow" />
              Kilimanjaro
            </li>
            <li aria-hidden className="text-snow/35">&rarr;</li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-snow" />
              Elbrus
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
