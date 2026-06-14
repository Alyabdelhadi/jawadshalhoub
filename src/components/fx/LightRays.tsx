"use client";

import { useMotionPrefs } from "@/lib/use-reduced-motion";

export type LightRaysProps = {
  className?: string;
  color?: string;
  intensity?: number;
};

/**
 * Decorative layered "god rays" overlay built from CSS gradients + blur.
 * Drifts/rotates slowly; static when reduced motion is preferred.
 */
export default function LightRays({
  className = "",
  color = "rgba(244, 247, 251, 0.55)",
  intensity = 1,
}: LightRaysProps) {
  const { reduced } = useMotionPrefs();
  const a = Math.max(0, Math.min(1, intensity));

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Sweeping conic rays */}
      <div
        className="absolute left-1/2 top-[-30%] h-[160%] w-[160%] -translate-x-1/2"
        style={{
          opacity: 0.35 * a,
          background: `conic-gradient(from 200deg at 50% 0%, transparent 0deg, ${color} 6deg, transparent 14deg, transparent 26deg, ${color} 32deg, transparent 42deg, transparent 70deg, ${color} 78deg, transparent 90deg, transparent 360deg)`,
          filter: "blur(28px)",
          mixBlendMode: "screen",
          transformOrigin: "50% 0%",
          animation: reduced ? "none" : "fx-rays-rotate 26s linear infinite",
        }}
      />
      {/* Soft vertical wash */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.5 * a,
          background: `linear-gradient(180deg, ${color} 0%, transparent 55%)`,
          filter: "blur(20px)",
          mixBlendMode: "screen",
          animation: reduced ? "none" : "fx-rays-drift 14s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
