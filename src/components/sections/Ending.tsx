"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import Flag from "@/components/fx/Flag";
import InView from "@/components/fx/InView";
import LightRays from "@/components/fx/LightRays";
import SocialLinks from "@/components/SocialLinks";
import { ENDING } from "@/lib/constants";
import { catalog } from "@/lib/media-catalog";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

/* Lazy-load the particle field — client-only, heavy WebGL */
const Particles = dynamic(() => import("@/components/fx/Particles"), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/* Animation constants                                                 */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Inner content (receives parallax scale value)                       */
/* ------------------------------------------------------------------ */

function EndingContent() {
  const { reduced } = useMotionPrefs();
  const sectionRef = useRef<HTMLElement>(null);

  /* Pull-back: scale 1.35 → 1.0 as section scrolls into and through view */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.35, 1.0]);

  const { src, srcSet, alt } = catalog.ending.summit;

  return (
    <section
      id="ending"
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden"
      aria-label="Closing statement — The Journey Begins"
    >
      {/* ── Fullscreen background image (camera pull-back) ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.img
          src={src}
          srcSet={srcSet}
          sizes="100vw"
          alt={alt}
          decoding="async"
          loading="lazy"
          className="h-full w-full object-cover object-center"
          style={reduced ? { scale: 1 } : { scale }}
        />

        {/* Heavy gradient scrim for legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(7,9,12,0.96) 0%, rgba(7,9,12,0.72) 45%, rgba(7,9,12,0.38) 75%, rgba(7,9,12,0.55) 100%)",
          }}
        />
      </div>

      {/* ── Decorative overlays ── */}
      {!reduced && (
        <>
          <LightRays
            className="z-0"
            color="rgba(244,247,251,0.35)"
            intensity={0.6}
          />
          <InView className="absolute inset-0 z-0" rootMargin="300px">
            <Particles variant="dust" count={300} />
          </InView>
        </>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
        {/* Lebanese flag */}
        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -28, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="mb-8 sm:mb-10"
        >
          <Flag size={148} className="drop-shadow-2xl" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 48, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 1.1, delay: reduced ? 0 : 0.18, ease: EASE_OUT }}
          className="font-display uppercase leading-[0.92] tracking-tight text-snow drop-shadow-lg"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 8.5vw, 6.5rem)",
            textShadow: "0 4px 32px rgba(7,9,12,0.7)",
          }}
        >
          {ENDING.headline}
        </motion.h2>

        {/* Subhead */}
        <motion.p
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.85, delay: reduced ? 0 : 0.34, ease: EASE_OUT }}
          className="mt-5 text-lg font-medium tracking-wide text-snow/75 sm:mt-6 sm:text-xl"
          style={{ textShadow: "0 2px 12px rgba(7,9,12,0.6)" }}
        >
          {ENDING.subhead}
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-6% 0px" }}
          transition={{ duration: 0.85, delay: reduced ? 0 : 0.5, ease: EASE_OUT }}
          className="mt-10 sm:mt-12"
        >
          <a
            href="#sponsor"
            aria-label={`${ENDING.cta} — jump to the sponsorship form`}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full px-9 py-3 text-base font-semibold tracking-wide text-snow transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-snow active:scale-[0.97]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-lebanon-red) 0%, color-mix(in srgb, var(--color-lebanon-red) 80%, #a00) 100%)",
              boxShadow:
                "0 0 28px color-mix(in srgb, var(--color-lebanon-red) 55%, transparent), 0 4px 16px rgba(0,0,0,0.45)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 44px color-mix(in srgb, var(--color-lebanon-red) 75%, transparent), 0 6px 24px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 28px color-mix(in srgb, var(--color-lebanon-red) 55%, transparent), 0 4px 16px rgba(0,0,0,0.45)";
            }}
          >
            {ENDING.cta}
          </a>
        </motion.div>
      </div>

      {/* ── Social links + footer line ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-4 pb-6">
        <SocialLinks />
        <p className="text-xs uppercase tracking-widest text-snow/25">
          © {new Date().getFullYear()} Jawad Shalhoub
        </p>
      </div>
    </section>
  );
}

export default function Ending() {
  return <EndingContent />;
}
