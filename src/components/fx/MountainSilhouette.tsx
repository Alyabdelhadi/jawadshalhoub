"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

export type MountainSilhouetteProps = {
  className?: string;
  /** Parallax strength multiplier, 0..1. */
  parallax?: number;
};

/**
 * Multi-layer SVG ridgelines anchored to the bottom of the parent.
 * Layers translate at different rates on scroll (parallax) unless reduced.
 */
export default function MountainSilhouette({
  className = "",
  parallax = 0.5,
}: MountainSilhouetteProps) {
  const { reduced } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const p = Math.max(0, Math.min(1, parallax));

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Back layers move less, front layers move more.
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -40 * p]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -70 * p]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -110 * p]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`}
    >
      {/* Far range */}
      <motion.svg
        style={reduced ? undefined : { y: yBack }}
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 320 L0 220 L180 150 L360 200 L560 110 L760 180 L980 120 L1180 190 L1440 140 L1440 320 Z"
          fill="#0c1118"
          opacity="0.7"
        />
      </motion.svg>

      {/* Mid range */}
      <motion.svg
        style={reduced ? undefined : { y: yMid }}
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 320 L0 260 L220 200 L420 250 L640 170 L880 240 L1100 190 L1320 250 L1440 210 L1440 320 Z"
          fill="#080b10"
          opacity="0.85"
        />
      </motion.svg>

      {/* Near range */}
      <motion.svg
        style={reduced ? undefined : { y: yFront }}
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 320 L0 300 L260 250 L520 295 L760 240 L1020 300 L1280 255 L1440 290 L1440 320 Z"
          fill="#05070a"
        />
      </motion.svg>
    </div>
  );
}
