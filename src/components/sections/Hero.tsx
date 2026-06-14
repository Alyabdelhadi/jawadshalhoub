"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

import InView from "@/components/fx/InView";
import LightRays from "@/components/fx/LightRays";
import MountainSilhouette from "@/components/fx/MountainSilhouette";
import { HERO } from "@/lib/constants";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

// Client-only R3F particle field, lazy-loaded so the WebGL bundle stays out of
// the critical path and never runs on the server.
const Particles = dynamic(() => import("@/components/fx/Particles"), {
  ssr: false,
});

// Static hero background image (responsive webp variants).
const HERO_IMG = "/media/img/image00013-1280.webp";
const HERO_SRCSET = [640, 1280, 1920]
  .map((w) => `/media/img/image00013-${w}.webp ${w}w`)
  .join(", ");

// Stagger config for the headline lines rising into view on mount.
const lineContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.16, delayChildren: 0.15 },
  },
};

const lineItem: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const { reduced, isMobile } = useMotionPrefs();

  // Pointer-driven parallax (desktop only). Raw pointer position normalised to
  // [-1, 1], smoothed by a spring, then mapped to small pixel translations.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  // Layered depth: background moves more than the foreground overlays.
  const bgX = useTransform(sx, [-1, 1], [-18, 18]);
  const bgY = useTransform(sy, [-1, 1], [-12, 12]);
  const fxX = useTransform(sx, [-1, 1], [-8, 8]);
  const fxY = useTransform(sy, [-1, 1], [-6, 6]);

  const parallaxOn = !reduced && !isMobile;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!parallaxOn) return;
      const { innerWidth, innerHeight } = window;
      px.set((e.clientX / innerWidth) * 2 - 1);
      py.set((e.clientY / innerHeight) * 2 - 1);
    },
    [parallaxOn, px, py]
  );

  return (
    <section
      aria-label="Jawad Shalhoub — Two Continents. Two Summits. One World Record Attempt."
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-ink text-snow"
    >
      {/* ---- Background image ----
          Fill the whole viewport with object-cover, anchored at 50% 70% so the
          crop is taken mostly from the top while keeping the lower frame visible. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={parallaxOn ? { x: bgX, y: bgY } : undefined}
      >
        <img
          src={HERO_IMG}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt="Jawad Shalhoub on an expedition"
          fetchPriority="high"
          className={`h-full w-full object-cover ${
            reduced ? "scale-105" : "hero-video-zoom"
          }`}
          style={{ objectPosition: "50% 70%" }}
        />
      </motion.div>

      {/* ---- Dark scrim for legibility (vertical + radial vignette) ---- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-ink) 70%, transparent) 0%, color-mix(in srgb, var(--color-ink) 25%, transparent) 35%, color-mix(in srgb, var(--color-ink) 55%, transparent) 70%, var(--color-ink) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 35%, color-mix(in srgb, var(--color-ink) 70%, transparent) 100%)",
        }}
      />

      {/* ---- Overlay FX (decorative, non-interactive) ---- */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={parallaxOn ? { x: fxX, y: fxY } : undefined}
      >
        <LightRays color="rgba(244, 247, 251, 0.5)" intensity={0.8} />
        {/* Gate the WebGL fog so it mounts/unmounts with viewport proximity. */}
        <InView className="absolute inset-0" rootMargin="300px">
          <Particles variant="fog" count={500} />
        </InView>
        <MountainSilhouette parallax={0.5} className="h-[42vh]" />
      </motion.div>

      {/* ---- Foreground content ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center sm:px-8">
        <motion.h1
          variants={lineContainer}
          initial={reduced ? "show" : "hidden"}
          animate="show"
          className="flex flex-col font-display uppercase leading-[0.92] tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 9vw, 7rem)",
            textShadow: "0 2px 40px rgba(0,0,0,0.45)",
          }}
        >
          {HERO.headlineLines.map((line, i) => {
            const isLast = i === HERO.headlineLines.length - 1;
            return (
              <motion.span
                key={line}
                variants={lineItem}
                className="block"
                style={
                  isLast
                    ? {
                        backgroundImage:
                          "linear-gradient(180deg, var(--color-snow) 0%, var(--color-lebanon-red) 130%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }
                    : undefined
                }
              >
                {line}
              </motion.span>
            );
          })}
        </motion.h1>

        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: reduced ? 0 : 0.15 + HERO.headlineLines.length * 0.16 + 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 max-w-prose text-balance text-base text-snow/75 sm:text-lg"
        >
          {HERO.subhead}
        </motion.p>

        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: reduced ? 0 : 0.15 + HERO.headlineLines.length * 0.16 + 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
        >
          <a
            href="#story"
            aria-label={`${HERO.ctaPrimary} — jump to Jawad's story`}
            className="group inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-lebanon-red px-8 py-3 text-sm font-semibold uppercase tracking-wider text-snow shadow-[0_0_30px_-4px_var(--color-lebanon-red)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_48px_-2px_var(--color-lebanon-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-snow focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.98] sm:w-auto"
          >
            {HERO.ctaPrimary}
          </a>
          <a
            href="#sponsor"
            aria-label={`${HERO.ctaSecondary} — jump to the sponsorship form`}
            className="glass inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wider text-snow transition-all duration-300 hover:scale-[1.03] hover:border-snow/40 hover:bg-snow/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-snow focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.98] sm:w-auto"
          >
            {HERO.ctaSecondary}
          </a>
        </motion.div>
      </div>

      {/* ---- Scroll cue ---- */}
      {!reduced && (
        <a
          href="#story"
          aria-hidden
          tabIndex={-1}
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-snow/55"
        >
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em]">
            Scroll
          </span>
          <motion.svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </a>
      )}
    </section>
  );
}
