"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CountUp from "@/components/fx/CountUp";
import MountainSilhouette from "@/components/fx/MountainSilhouette";
import { STORY } from "@/lib/constants";
import { catalog, type MediaImage } from "@/lib/media-catalog";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

// Register ScrollTrigger (idempotent — also done in SmoothScroll provider).
gsap.registerPlugin(ScrollTrigger);

const MILESTONES = STORY.milestones;
const STORY_IMAGES = catalog.story.milestones;

// Index-aligned image per milestone; cycle if fewer images than milestones.
function imageFor(index: number): MediaImage {
  return STORY_IMAGES[index % STORY_IMAGES.length];
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* --------------------------------------------------------------------- */
/* Stat callouts (shared by both branches)                               */
/* --------------------------------------------------------------------- */

function StatCallouts({ reduced }: { reduced: boolean }) {
  const stats = [
    { node: <CountUp value={11} suffix=" days" className="font-display" />, label: "To Complete Both Treks" },
    { node: <CountUp value={2} suffix=" base camps" className="font-display" />, label: "Everest & Annapurna" },
  ];
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: reduced ? 0 : 0.1 + i * 0.12, ease: EASE_OUT }}
          className="glass rounded-2xl px-6 py-5 text-center"
        >
          <span
            className="block leading-none text-snow"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 6vw, 3.25rem)" }}
          >
            {s.node}
          </span>
          <span className="mt-2 block text-[0.7rem] font-medium uppercase tracking-[0.25em] text-snow/55">
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Route SVG — vertical path connecting milestones                       */
/* --------------------------------------------------------------------- */

// A gently winding vertical path in a 100 x 1000 viewBox. Anchor points land at
// x=50 on every node y (20, 260, 500, 740, 980) so the milestone circles sit
// exactly on the line; each segment bows alternately left/right for the wind.
const ROUTE_PATH =
  "M50 20 C 20 100, 20 180, 50 260 C 80 340, 80 420, 50 500 C 20 580, 20 660, 50 740 C 80 820, 80 900, 50 980";

/* --------------------------------------------------------------------- */
/* Stacked fallback (mobile + reduced motion)                            */
/* --------------------------------------------------------------------- */

function StackedTimeline({ reduced }: { reduced: boolean }) {
  return (
    <ol className="relative mt-16 sm:mt-20">
      {/* Static route line down the left edge */}
      <span
        aria-hidden
        className="absolute bottom-2 left-[18px] top-2 w-px bg-gradient-to-b from-lebanon-red/70 via-snow/30 to-lebanon-green/70 sm:left-5"
      />
      {MILESTONES.map((m, i) => {
        const img = imageFor(i);
        return (
          <motion.li
            key={m.id}
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="relative mb-12 pl-12 last:mb-0 sm:pl-16"
          >
            {/* Node dot */}
            <span
              aria-hidden
              className="absolute left-[11px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lebanon-red ring-4 ring-ink sm:left-[13px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-snow" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lebanon-red">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="mt-3 overflow-hidden rounded-2xl">
              <img
                src={img.src}
                srcSet={img.srcSet}
                sizes="90vw"
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <h3
              className="mt-4 font-display uppercase leading-[0.95] tracking-tight text-snow"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 6vw, 2.25rem)" }}
            >
              {m.title}
            </h3>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-snow/70 sm:text-base">
              {m.blurb}
            </p>
          </motion.li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------------------- */
/* Pinned desktop timeline                                               */
/* --------------------------------------------------------------------- */

function PinnedTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const routeRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const mountainsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const route = routeRef.current;
    if (!section || !route) return;

    const ctx = gsap.context(() => {
      const scenes = sceneRefs.current.filter(Boolean) as HTMLDivElement[];
      const n = scenes.length;
      if (n === 0) return;

      // Prepare route draw.
      const len = route.getTotalLength();
      gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });

      // Start state: first scene visible, rest hidden below.
      scenes.forEach((s, i) => {
        gsap.set(s, { autoAlpha: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : 8, scale: i === 0 ? 1 : 1.04 });
      });

      // One scroll-distance "step" per transition between scenes.
      const steps = Math.max(1, n - 1);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${steps * 90}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Route draws across the whole timeline.
      tl.to(route, { strokeDashoffset: 0, ease: "none", duration: steps }, 0);

      // Cross-fade between consecutive scenes.
      for (let i = 0; i < n - 1; i++) {
        const out = scenes[i];
        const incoming = scenes[i + 1];
        tl.to(out, { autoAlpha: 0, yPercent: -8, scale: 0.97, ease: "power1.inOut", duration: 1 }, i);
        tl.fromTo(
          incoming,
          { autoAlpha: 0, yPercent: 8, scale: 1.04 },
          { autoAlpha: 1, yPercent: 0, scale: 1, ease: "power1.inOut", duration: 1 },
          i
        );
      }

      // Mountains rise subtly across the whole sequence.
      if (mountainsRef.current) {
        tl.fromTo(
          mountainsRef.current,
          { yPercent: 18, opacity: 0.4 },
          { yPercent: 0, opacity: 1, ease: "none", duration: steps },
          0
        );
      }

      // Drive the marker along the path manually via the route progress.
      const marker = markerRef.current;
      if (marker) {
        const update = () => {
          const progress = tl.progress();
          const pt = route.getPointAtLength(len * progress);
          marker.setAttribute("cx", String(pt.x));
          marker.setAttribute("cy", String(pt.y));
        };
        // place at start
        const p0 = route.getPointAtLength(0);
        marker.setAttribute("cx", String(p0.x));
        marker.setAttribute("cy", String(p0.y));
        tl.eventCallback("onUpdate", update);
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative w-full">
      {/* Pinned viewport-height stage */}
      <div ref={trackRef} className="relative flex h-screen w-full items-center overflow-hidden">
        {/* Rising mountains backdrop */}
        <div ref={mountainsRef} aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 will-change-transform">
          <MountainSilhouette parallax={0} />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-8 lg:grid-cols-[100px_1fr]">
          {/* Route column */}
          <div aria-hidden className="hidden h-[70vh] items-stretch justify-center lg:flex">
            <svg viewBox="0 0 100 1000" preserveAspectRatio="xMidYMid meet" className="h-full w-[100px]" fill="none">
              {/* Faint full track */}
              <path d={ROUTE_PATH} stroke="color-mix(in srgb, var(--color-snow) 14%, transparent)" strokeWidth="2" />
              {/* Drawn route */}
              <path
                ref={routeRef}
                d={ROUTE_PATH}
                stroke="var(--color-lebanon-red)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Node markers */}
              {MILESTONES.map((m, i) => {
                const y = 20 + (960 * i) / (MILESTONES.length - 1);
                return <circle key={m.id} cx="50" cy={y} r="4" fill="var(--color-snow)" opacity="0.5" />;
              })}
              {/* Travelling marker */}
              <circle ref={markerRef} r="7" fill="var(--color-snow)" stroke="var(--color-lebanon-red)" strokeWidth="3" />
            </svg>
          </div>

          {/* Scene stack — all scenes absolutely overlap; GSAP toggles them. */}
          <div className="relative h-[70vh] w-full">
            {MILESTONES.map((m, i) => {
              const img = imageFor(i);
              return (
                <div
                  key={m.id}
                  ref={(el) => {
                    sceneRefs.current[i] = el;
                  }}
                  className="absolute inset-0 grid grid-cols-1 items-center gap-8 will-change-transform md:grid-cols-2"
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
                    <img
                      src={img.src}
                      srcSet={img.srcSet}
                      sizes="(min-width: 768px) 45vw, 90vw"
                      alt={img.alt}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--color-ink) 55%, transparent) 100%)",
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.4em] text-lebanon-red">
                      {`Chapter ${String(i + 1).padStart(2, "0")}`}
                    </span>
                    <h3
                      className="mt-3 font-display uppercase leading-[0.92] tracking-tight text-snow"
                      style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)" }}
                    >
                      {m.title}
                    </h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-snow/75 lg:text-lg">
                      {m.blurb}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Section root                                                          */
/* --------------------------------------------------------------------- */

export default function Story() {
  const { reduced, isMobile } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR-safe mount gate: deliberately flip a flag after the first client
    // render so the pinned, motion-driven timeline only activates on the
    // client (server render shows the always-visible stacked fallback).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Only use the pinned, scroll-driven timeline on desktop with motion allowed.
  // Until mounted, prefs are all false -> we render the stacked fallback so the
  // server/first-client render is the always-visible version (no hidden content).
  const usePinned = mounted && !isMobile && !reduced;

  return (
    <section
      id="story"
      className="relative isolate w-full overflow-hidden bg-ink py-24 text-snow sm:py-32"
    >
      {/* Atmospheric background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--color-lebanon-red) 10%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 90%, #060d18) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-8">
        {/* Heading */}
        <motion.h2
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="max-w-3xl text-balance font-display uppercase leading-[0.95] tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
        >
          {STORY.heading}
        </motion.h2>

        {/* Intro with emphasized numbers */}
        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-snow/75 sm:text-xl"
        >
          In November 2025, Jawad became the first Lebanese ever to complete both{" "}
          <strong className="font-semibold text-snow">Everest Base Camp</strong> and{" "}
          <strong className="font-semibold text-snow">Annapurna Base Camp</strong> in Nepal in only{" "}
          <strong className="font-semibold text-lebanon-red">11 days</strong>.
        </motion.p>

        <StatCallouts reduced={reduced} />
      </div>

      {/* Timeline */}
      <div className="relative z-10">
        {usePinned ? (
          <PinnedTimeline />
        ) : (
          <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
            <StackedTimeline reduced={reduced} />
          </div>
        )}
      </div>
    </section>
  );
}
