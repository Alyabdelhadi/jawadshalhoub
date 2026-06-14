"use client";

import { useMotionPrefs } from "@/lib/use-reduced-motion";

export type FlagProps = {
  className?: string;
  size?: number;
};

/**
 * Lebanese flag: red / white / red horizontal bands (white = middle half)
 * with a green cedar centered in the white band. Gentle waving animation
 * unless reduced motion is preferred.
 */
export default function Flag({ className = "", size = 120 }: FlagProps) {
  const { reduced } = useMotionPrefs();
  const height = size * (2 / 3); // flag ratio 3:2

  return (
    <div
      aria-hidden
      className={`inline-block ${className}`}
      style={{ width: size, height }}
    >
      <svg
        viewBox="0 0 300 200"
        width="100%"
        height="100%"
        style={{
          display: "block",
          transformOrigin: "left center",
          animation: reduced ? "none" : "fx-flag-wave 5.5s ease-in-out infinite",
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Red top band (top quarter) */}
        <rect x="0" y="0" width="300" height="50" fill="var(--color-lebanon-red)" />
        {/* White middle band (middle half) */}
        <rect x="0" y="50" width="300" height="100" fill="var(--color-snow)" />
        {/* Red bottom band (bottom quarter) */}
        <rect x="0" y="150" width="300" height="50" fill="var(--color-lebanon-red)" />

        {/* Cedar of Lebanon — layered triangular tiers + trunk */}
        <g fill="var(--color-lebanon-green)">
          {/* trunk */}
          <rect x="146" y="128" width="8" height="14" />
          {/* tiers, top (narrow) to bottom (wide) */}
          <path d="M150 60 L138 78 L162 78 Z" />
          <path d="M150 70 L130 92 L170 92 Z" />
          <path d="M150 82 L122 106 L178 106 Z" />
          <path d="M150 96 L116 122 L184 122 Z" />
          {/* slight overlap base spread */}
          <path d="M150 110 L112 132 L188 132 Z" />
        </g>
      </svg>
    </div>
  );
}
