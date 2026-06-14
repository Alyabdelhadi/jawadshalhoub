"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

export type CountUpProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
};

const defaultFormat = (n: number) =>
  Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

/**
 * Animated number that tweens 0 -> value when it scrolls into view.
 * Renders the final value immediately when reduced motion is preferred.
 */
export default function CountUp({
  value,
  suffix = "",
  prefix = "",
  durationMs = 1800,
  format = defaultFormat,
  className,
}: CountUpProps) {
  const { reduced } = useMotionPrefs();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Under reduced motion we render `value` directly (see below), so there is
    // no animation to run here.
    if (reduced || !inView) return;

    const controls = animate(0, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [inView, reduced, value, durationMs]);

  // Reduced motion: skip the tween and show the final value immediately,
  // derived during render rather than via a state-setting effect.
  const shown = reduced ? value : display;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(shown)}
      {suffix}
    </span>
  );
}
