"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import CountUp from "@/components/fx/CountUp";
import InView from "@/components/fx/InView";
import { RECORD } from "@/lib/constants";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Lazy globe (client-only, never SSR)                                 */
/* ------------------------------------------------------------------ */

const Globe = dynamic(() => import("@/components/fx/Globe"), { ssr: false });

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Coordinates for the mission route.
const COORDS = {
  lebanon: [33.8938, 35.5018] as [number, number],
  kilimanjaro: [-3.0674, 37.3556] as [number, number],
  elbrus: [43.3499, 42.4453] as [number, number],
};

const ARCS = [
  { from: COORDS.lebanon, to: COORDS.kilimanjaro },
  { from: COORDS.kilimanjaro, to: COORDS.elbrus },
];

const MARKERS: [number, number][] = [
  COORDS.lebanon,
  COORDS.kilimanjaro,
  COORDS.elbrus,
];

/* ------------------------------------------------------------------ */
/* Live "days remaining" countdown (client-only, hydration-safe)       */
/* ------------------------------------------------------------------ */

function useDaysRemaining(targetISO: string): { days: number; ready: boolean } {
  const [state, setState] = useState<{ days: number; ready: boolean }>({
    days: 0,
    ready: false,
  });

  useEffect(() => {
    const summit = new Date(`${targetISO}T00:00:00`).getTime();
    const now = Date.now();
    const days = Math.max(0, Math.ceil((summit - now) / 86_400_000));
    // Client-only computation: Date.now() is non-deterministic, so we resolve
    // the live "days remaining" after mount to avoid an SSR/hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ days, ready: true });
  }, [targetISO]);

  return state;
}

/* ------------------------------------------------------------------ */
/* HUD counter panel                                                   */
/* ------------------------------------------------------------------ */

interface CounterPanelProps {
  index: number;
  label: string;
  value: number;
  suffix?: string;
  caption: string;
  reduced: boolean;
  /** When false the panel renders a placeholder dash instead of CountUp. */
  ready?: boolean;
}

function CounterPanel({
  index,
  label,
  value,
  suffix = "",
  caption,
  reduced,
  ready = true,
}: CounterPanelProps) {
  return (
    <motion.li
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px 200px 0px" }}
      transition={{
        duration: 0.7,
        delay: reduced ? 0 : 0.12 * index,
        ease: EASE_OUT,
      }}
      className="glass group relative isolate flex flex-col overflow-hidden rounded-2xl px-6 py-7 sm:px-7 sm:py-8"
    >
      {/* Corner ticks for the instrument-panel feel */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-lebanon-red/50"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-snow/20"
      />

      {/* Channel index, e.g. CH-01 */}
      <span
        aria-hidden
        className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-lebanon-red/70"
      >
        CH-{String(index + 1).padStart(2, "0")}
      </span>

      {/* Label */}
      <span className="mt-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-snow/55 sm:text-xs">
        {label}
      </span>

      {/* Animated value */}
      <span className="mt-3 font-mono text-4xl font-semibold leading-none tabular-nums text-snow sm:text-5xl">
        {ready ? (
          <CountUp value={value} suffix={suffix} />
        ) : (
          <span className="text-snow/40">—{suffix}</span>
        )}
      </span>

      {/* Caption */}
      <span className="mt-3 text-xs text-snow/45 sm:text-sm">{caption}</span>

      {/* Bottom signal bar */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-lebanon-red/60 via-lebanon-red/15 to-transparent"
      />
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Mission itinerary (vertical route legend)                           */
/* ------------------------------------------------------------------ */

function MissionItinerary({ reduced }: { reduced: boolean }) {
  return (
    <ol className="relative flex flex-col gap-0" aria-label="Expedition route">
      {RECORD.legs.map((leg, i) => {
        const isLast = i === RECORD.legs.length - 1;
        return (
          <motion.li
            key={leg.id}
            initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px 200px 0px" }}
            transition={{
              duration: 0.6,
              delay: reduced ? 0 : 0.15 * i,
              ease: EASE_OUT,
            }}
            className="relative flex gap-4 pb-7 last:pb-0"
          >
            {/* Node + connector column */}
            <div className="relative flex flex-col items-center">
              {/* Glowing node */}
              <span className="relative z-10 mt-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-lebanon-red shadow-[0_0_12px_2px_color-mix(in_srgb,var(--color-lebanon-red)_70%,transparent)]" />
                <span className="absolute inset-[3px] rounded-full bg-snow/90" />
              </span>
              {/* Glowing connector */}
              {!isLast && (
                <span
                  aria-hidden
                  className="mt-1 w-px flex-1 bg-gradient-to-b from-lebanon-red/70 to-lebanon-red/10"
                />
              )}
            </div>

            {/* Text */}
            <div className="-mt-0.5 min-w-0">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-lebanon-red/80">
                {leg.continent}
              </p>
              <p className="mt-1 text-base font-semibold text-snow sm:text-lg">
                {leg.label}
              </p>
              <p className="mt-0.5 text-xs text-snow/45 sm:text-sm">{leg.note}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Section root                                                        */
/* ------------------------------------------------------------------ */

export default function WorldRecord() {
  const { reduced } = useMotionPrefs();
  const { days, ready } = useDaysRemaining(RECORD.counters.summitDate);

  return (
    <section
      id="world-record"
      className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-ink py-24 text-snow sm:py-28"
    >
      {/* ---- Globe backdrop (lazy, client-only) ---- */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <InView className="absolute inset-0" rootMargin="300px">
          <Globe
            arcs={ARCS}
            markers={MARKERS}
            originIndex={0}
            autoRotate
            className="opacity-90 [transform:translateY(4%)_scale(1.15)] sm:[transform:translateX(18%)_scale(1.2)]"
          />
        </InView>
      </div>

      {/* ---- Space / vignette scrim so HUD text stays legible ---- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 50%, color-mix(in srgb, var(--color-ink) 92%, transparent) 0%, color-mix(in srgb, var(--color-ink) 60%, transparent) 38%, transparent 70%), radial-gradient(140% 120% at 50% 120%, color-mix(in srgb, var(--color-ink) 85%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-ink) 0%, transparent 22%, transparent 80%, var(--color-ink) 100%)",
        }}
      />

      {/* ---- Mission-control grid + scanlines (decorative) ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--color-snow) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-snow) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(120% 100% at 30% 40%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 100% at 30% 40%, black 0%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-snow) 0px, var(--color-snow) 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 sm:px-8">
        {/* Eyebrow / mission tag */}
        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 200px 0px" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-lebanon-red/90"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-lebanon-red shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-lebanon-red)_70%,transparent)]" />
          Mission Control / Live
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 36, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "0px 0px 200px 0px" }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="mt-4 max-w-3xl font-display uppercase leading-[0.95] tracking-tight text-snow"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 6.5vw, 5rem)",
          }}
        >
          The World Record Attempt
        </motion.h2>

        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 200px 0px" }}
          transition={{ duration: 0.8, delay: reduced ? 0 : 0.12, ease: EASE_OUT }}
          className="mt-5 max-w-xl text-base text-snow/60 sm:text-lg"
        >
          Two continents. Two summits. One flight path tracked from the roof of
          Africa to the highest peak in Europe.
        </motion.p>

        {/* Itinerary + spacer (itinerary left, globe shows through right on desktop) */}
        <div className="mt-12 sm:mt-14">
          <MissionItinerary reduced={reduced} />
        </div>

        {/* HUD counters */}
        <ul
          className="mt-auto grid grid-cols-1 gap-5 pt-14 sm:grid-cols-3"
          aria-label="Mission telemetry"
        >
          <CounterPanel
            index={0}
            label="Total Elevation"
            value={RECORD.counters.totalElevationM}
            suffix=" m"
            caption="Kilimanjaro + Elbrus"
            reduced={reduced}
          />
          <CounterPanel
            index={1}
            label="Distance Traveled"
            value={RECORD.counters.distanceKm}
            suffix=" km"
            caption="Across two continents"
            reduced={reduced}
          />
          <CounterPanel
            index={2}
            label="Days Remaining"
            value={days}
            caption="Until Summer 2026"
            reduced={reduced}
            ready={ready}
          />
        </ul>
      </div>
    </section>
  );
}
